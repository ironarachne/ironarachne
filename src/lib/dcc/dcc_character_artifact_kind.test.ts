import { describe, expect, it } from 'vitest';

import { readArtifactPayload, type AnyArtifactKindEntry } from '$lib/artifact_kinds';

import {
  dccCharacterArtifactKind,
  DCC_CHARACTER_ARTIFACT_KIND,
  DCC_CHARACTER_PAYLOAD_VERSION,
  migrateDccCharacterSnapshot,
  validateDccCharacterSnapshot,
} from './dcc_character_artifact_kind.js';
import { rollDccCharacter, rollDccCharacterSnapshot } from './dcc_character_roll.js';
import type { DccCharacterSnapshot } from './dcc_character_snapshot.js';
import { DCC_CHARACTER_RULESET_REF } from './dcc_character_snapshot.js';

/** A stored payload, as anything reading one actually receives it. */
function storedSnapshot(seed = 'kind-fixture'): Record<string, unknown> {
  return JSON.parse(JSON.stringify(rollDccCharacterSnapshot(seed))) as Record<string, unknown>;
}

const snapshot = storedSnapshot();

describe('the DCC character artifact kind', () => {
  it('is registered system-qualified, concept first', () => {
    expect(DCC_CHARACTER_ARTIFACT_KIND).toBe('character.dcc');
    expect(dccCharacterArtifactKind.kind).toBe('character.dcc');
    expect(dccCharacterArtifactKind.displayName).toBe('DCC Character');
    expect(dccCharacterArtifactKind.payloadVersion).toBe(DCC_CHARACTER_PAYLOAD_VERSION);
    expect(dccCharacterArtifactKind.icon).not.toBe('');
  });

  it('names an artifact after the character', () => {
    const named = snapshot as unknown as DccCharacterSnapshot;

    expect(dccCharacterArtifactKind.nameOf(named)).toBe(
      `${named.firstName} ${named.lastName}`.trim(),
    );
  });

  /** A funnel peasant who was never named is still findable by what they did for a living. */
  it('falls back to the occupation for a character with no name', () => {
    const unnamed = {
      ...snapshot,
      firstName: '',
      lastName: '  ',
    } as unknown as DccCharacterSnapshot;

    expect(dccCharacterArtifactKind.nameOf(unnamed)).toBe(unnamed.occupation.name);
  });

  it('falls back again for a character with neither', () => {
    const nothing = {
      ...snapshot,
      firstName: '',
      lastName: '',
      occupation: { name: '', trainedWeapon: null, tradeGoods: null, commonality: 0 },
    } as unknown as DccCharacterSnapshot;

    expect(dccCharacterArtifactKind.nameOf(nothing)).toBe('DCC Character');
  });

  it('round-trips through the codec the registry loads', async () => {
    const codec = await dccCharacterArtifactKind.loadCodec();
    const { character } = rollDccCharacter('codec-fixture');
    const stored = codec.toSnapshot(character) as DccCharacterSnapshot;

    expect(validateDccCharacterSnapshot(stored).ok).toBe(true);
    const restored = codec.fromSnapshot(stored, undefined as never) as typeof character;
    expect(restored.occupation.name).toBe(character.occupation.name);
    expect(restored.hp).toBe(character.hp);
  });

  it('reads a current-version payload and refuses one from a newer build', () => {
    // The erased form the registry hands every consumer back.
    const entry = dccCharacterArtifactKind as unknown as AnyArtifactKindEntry;

    expect(readArtifactPayload(entry, snapshot, DCC_CHARACTER_PAYLOAD_VERSION).ok).toBe(true);
    const ahead = readArtifactPayload(entry, snapshot, DCC_CHARACTER_PAYLOAD_VERSION + 1);
    expect(ahead.ok).toBe(false);
    expect(ahead.ok === false && ahead.reason).toBe('unsupported-version');
  });
});

describe('validating a DCC character payload', () => {
  it('accepts what the generator writes, from every table', () => {
    for (const ancestry of ['dwarf', 'elf', 'halfling', 'human'] as const) {
      const rolled = JSON.parse(
        JSON.stringify(
          rollDccCharacterSnapshot(`validate-${ancestry}`, {
            allowedOccupations: [ancestry],
          }),
        ),
      ) as unknown;
      expect(validateDccCharacterSnapshot(rolled).ok).toBe(true);
    }
  });

  it('rejects something that is not an object', () => {
    const result = validateDccCharacterSnapshot('a peasant, honestly');

    expect(result.ok).toBe(false);
    expect(result.ok ? '' : result.reason).toBe('invalid-payload');
  });

  it('rejects a payload with no alignment to print', () => {
    const { alignment: _dropped, ...rest } = snapshot;

    expect(validateDccCharacterSnapshot(rest).ok).toBe(false);
  });

  it('rejects a payload whose hit points are not a number', () => {
    expect(validateDccCharacterSnapshot({ ...snapshot, hp: 'a few' }).ok).toBe(false);
  });

  /**
   * Both halves of an attribute are checked because both are stored and both are shown. The
   * modifier is derivable, which is exactly why it must be validated rather than recomputed.
   */
  it('rejects an attribute missing its modifier', () => {
    const result = validateDccCharacterSnapshot({ ...snapshot, luck: { value: 12 } });

    expect(result.ok).toBe(false);
    expect(result.ok ? '' : result.message).toContain('luck');
  });

  it('rejects a lucky sign with no modifier', () => {
    expect(
      validateDccCharacterSnapshot({
        ...snapshot,
        luckyRoll: { name: 'The bull', description: 'Strength' },
      }).ok,
    ).toBe(false);
  });

  it('rejects an occupation with no name', () => {
    expect(validateDccCharacterSnapshot({ ...snapshot, occupation: {} }).ok).toBe(false);
  });

  /**
   * A name no table has is not a corrupt record — the human farmer's own handler produces one every
   * time it runs — so the validator says nothing about it.
   */
  it('accepts an occupation name no table has', () => {
    expect(
      validateDccCharacterSnapshot({
        ...snapshot,
        occupation: { ...(snapshot.occupation as object), name: 'potato farmer' },
      }).ok,
    ).toBe(true);
  });
});

describe('migrating a DCC character payload', () => {
  it('pins the legacy ruleset ref without inventing source provenance', () => {
    const { ruleset: _ruleset, ...legacy } = snapshot;
    const result = migrateDccCharacterSnapshot(legacy, 1);

    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.value).toEqual({ ...legacy, ruleset: DCC_CHARACTER_RULESET_REF });
      expect(result.value).not.toHaveProperty('sourceIds');
    }
  });

  it('rejects an unsupported version', () => {
    const result = migrateDccCharacterSnapshot(snapshot, 0);

    expect(result.ok).toBe(false);
    expect(result.ok ? '' : result.reason).toBe('unsupported-version');
  });
});
