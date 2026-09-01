import { describe, expect, it } from 'vitest';

import { readArtifactPayload, type AnyArtifactKindEntry } from '$lib/artifact_kinds';

import {
  migrateUwCharacterSnapshot,
  uwCharacterArtifactKind,
  UW_CHARACTER_ARTIFACT_KIND,
  UW_CHARACTER_PAYLOAD_VERSION,
  validateUwCharacterSnapshot,
} from './uw_character_artifact_kind.js';
import { rollUwCharacterSnapshot } from './uw_character_roll.js';
import type { UwCharacterSnapshot } from './uw_character_snapshot.js';

/** A stored payload, as anything reading one actually receives it. */
function storedSnapshot(seed = 'kind-fixture'): Record<string, unknown> {
  return JSON.parse(JSON.stringify(rollUwCharacterSnapshot(seed))) as Record<string, unknown>;
}

const snapshot = storedSnapshot();

describe('the Uncharted Worlds character artifact kind', () => {
  it('is registered system-qualified, concept first', () => {
    expect(UW_CHARACTER_ARTIFACT_KIND).toBe('character.uncharted-worlds');
    expect(uwCharacterArtifactKind.kind).toBe('character.uncharted-worlds');
    expect(uwCharacterArtifactKind.displayName).toBe('Uncharted Worlds Character');
    expect(uwCharacterArtifactKind.payloadVersion).toBe(UW_CHARACTER_PAYLOAD_VERSION);
    expect(uwCharacterArtifactKind.icon).not.toBe('');
  });

  it('names an artifact after the character', () => {
    const named = snapshot as unknown as UwCharacterSnapshot;

    expect(uwCharacterArtifactKind.nameOf(named)).toBe(
      `${named.firstName} ${named.lastName}`.trim(),
    );
  });

  /** No classes in this game: a character is what they have done, so that is what names them. */
  it('falls back to the careers for a character with no name', () => {
    const unnamed = { ...snapshot, firstName: '', lastName: ' ' } as unknown as UwCharacterSnapshot;

    expect(uwCharacterArtifactKind.nameOf(unnamed)).toBe(
      unnamed.careers.map((career) => career.name).join(' and '),
    );
  });

  it('falls back again for a character with neither', () => {
    const anonymous = {
      ...snapshot,
      firstName: '',
      lastName: '',
      careers: [],
    } as unknown as UwCharacterSnapshot;

    expect(uwCharacterArtifactKind.nameOf(anonymous)).toBe('Uncharted Worlds Character');
  });

  it('accepts a payload the generator produced', () => {
    expect(validateUwCharacterSnapshot(snapshot).ok).toBe(true);
  });

  it('rejects something that is not an object at all', () => {
    for (const payload of [null, 'a character', 42, ['stats']]) {
      const result = validateUwCharacterSnapshot(payload);
      expect(result.ok).toBe(false);
      expect(result.ok === false && result.reason).toBe('invalid-payload');
    }
  });

  it('rejects a payload missing the prose the sheet is read from', () => {
    const { descriptors: _dropped, ...rest } = snapshot;

    expect(validateUwCharacterSnapshot(rest).ok).toBe(false);
  });

  /** A -1 is an ordinary stat here, so the check is for a number rather than for a size. */
  it('accepts the standard array and rejects a missing stat', () => {
    expect(
      validateUwCharacterSnapshot({
        ...snapshot,
        stats: { physique: 2, mettle: 1, expertise: 1, influence: 0, interface: -1 },
      }).ok,
    ).toBe(true);
    expect(validateUwCharacterSnapshot({ ...snapshot, stats: { physique: 2, mettle: 1 } }).ok).toBe(
      false,
    );
  });

  it('rejects a career, origin, workspace or skill with no name', () => {
    expect(validateUwCharacterSnapshot({ ...snapshot, careers: [{}] }).ok).toBe(false);
    expect(validateUwCharacterSnapshot({ ...snapshot, origin: {} }).ok).toBe(false);
    expect(validateUwCharacterSnapshot({ ...snapshot, workspace: 'A Shed' }).ok).toBe(false);
    expect(validateUwCharacterSnapshot({ ...snapshot, skills: [{ level: 1 }] }).ok).toBe(false);
  });

  it('rejects an asset that is not a classed item with upgrades', () => {
    expect(validateUwCharacterSnapshot({ ...snapshot, assets: [{ name: 'A ship' }] }).ok).toBe(
      false,
    );
    expect(
      validateUwCharacterSnapshot({
        ...snapshot,
        assets: [
          {
            name: 'A ship',
            description: '',
            assetClass: 2,
            type: { name: 'Freighter' },
            upgrades: [{ name: 'Cargo hold' }],
          },
        ],
      }).ok,
    ).toBe(false);
  });

  it('accepts an asset with no upgrades, which is what Attire is', () => {
    expect(
      validateUwCharacterSnapshot({
        ...snapshot,
        assets: [
          {
            name: 'Attire',
            description: 'A coat',
            assetClass: 0,
            type: { name: 'Attire' },
            upgrades: [],
          },
        ],
      }).ok,
    ).toBe(true);
  });

  it('has no migration to offer, and says so rather than guessing', () => {
    const result = migrateUwCharacterSnapshot(snapshot, 0);

    expect(result.ok).toBe(false);
    expect(result.ok === false && result.reason).toBe('unsupported-version');
  });

  /** The whole read path, as the store runs it. */
  it('reads a stored payload of its own version', () => {
    const result = readArtifactPayload(
      uwCharacterArtifactKind as AnyArtifactKindEntry,
      snapshot,
      UW_CHARACTER_PAYLOAD_VERSION,
    );

    expect(result.ok).toBe(true);
  });

  it('quarantines a payload from a version it has no step for', () => {
    const result = readArtifactPayload(
      uwCharacterArtifactKind as AnyArtifactKindEntry,
      snapshot,
      UW_CHARACTER_PAYLOAD_VERSION + 1,
    );

    expect(result.ok).toBe(false);
  });

  it('loads a codec that round-trips the payload', async () => {
    const codec = await uwCharacterArtifactKind.loadCodec();
    const accepted = validateUwCharacterSnapshot(snapshot);

    expect(accepted.ok).toBe(true);
    if (!accepted.ok) {
      return;
    }
    const { RNG } = await import('@ironarachne/rng');
    const live = codec.fromSnapshot(accepted.value, new RNG('unused'));

    expect(codec.toSnapshot(live)).toEqual(accepted.value);
  });
});
