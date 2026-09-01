import { describe, expect, it } from 'vitest';

import { readArtifactPayload, type AnyArtifactKindEntry } from '$lib/artifact_kinds';

import {
  migrateSwnCharacterSnapshot,
  swnCharacterArtifactKind,
  SWN_CHARACTER_ARTIFACT_KIND,
  SWN_CHARACTER_PAYLOAD_VERSION,
  validateSwnCharacterSnapshot,
} from './swn_character_artifact_kind.js';
import { rollSwnCharacterSnapshot } from './swn_character_roll.js';
import type { SwnCharacterSnapshot } from './swn_character_snapshot.js';

/** A stored payload, as anything reading one actually receives it. */
function storedSnapshot(seed = 'kind-fixture'): Record<string, unknown> {
  return JSON.parse(JSON.stringify(rollSwnCharacterSnapshot(seed))) as Record<string, unknown>;
}

const snapshot = storedSnapshot();

describe('the SWN character artifact kind', () => {
  it('is registered system-qualified, concept first', () => {
    expect(SWN_CHARACTER_ARTIFACT_KIND).toBe('character.swn');
    expect(swnCharacterArtifactKind.kind).toBe('character.swn');
    expect(swnCharacterArtifactKind.displayName).toBe('SWN Character');
    expect(swnCharacterArtifactKind.payloadVersion).toBe(SWN_CHARACTER_PAYLOAD_VERSION);
    expect(swnCharacterArtifactKind.icon).not.toBe('');
  });

  it('names an artifact after the character', () => {
    const named = snapshot as unknown as SwnCharacterSnapshot;

    expect(swnCharacterArtifactKind.nameOf(named)).toBe(
      `${named.firstName} ${named.lastName}`.trim(),
    );
  });

  /** A character saved unnamed is still findable by what they are. */
  it('falls back to the background and class for a character with no name', () => {
    const unnamed = {
      ...snapshot,
      firstName: '',
      lastName: '  ',
    } as unknown as SwnCharacterSnapshot;

    expect(swnCharacterArtifactKind.nameOf(unnamed)).toBe(
      `${unnamed.background.name} ${unnamed.characterClass.name}`,
    );
  });

  it('falls back again for a character with neither', () => {
    const anonymous = {
      ...snapshot,
      firstName: '',
      lastName: '',
      background: { name: '' },
      characterClass: { name: '' },
    } as unknown as SwnCharacterSnapshot;

    expect(swnCharacterArtifactKind.nameOf(anonymous)).toBe('SWN Character');
  });

  it('accepts a payload the generator produced', () => {
    expect(validateSwnCharacterSnapshot(snapshot).ok).toBe(true);
  });

  it('rejects something that is not an object at all', () => {
    for (const payload of [null, 'a character', 42, ['stats']]) {
      const result = validateSwnCharacterSnapshot(payload);
      expect(result.ok).toBe(false);
      expect(result.ok === false && result.reason).toBe('invalid-payload');
    }
  });

  it('rejects a payload missing the numbers a sheet is read from', () => {
    const { hitPoints: _dropped, ...rest } = snapshot;

    expect(validateSwnCharacterSnapshot(rest).ok).toBe(false);
  });

  it('rejects stats that are not scores with modifiers', () => {
    expect(validateSwnCharacterSnapshot({ ...snapshot, stats: [{ name: 'strength' }] }).ok).toBe(
      false,
    );
  });

  it('rejects skills without a level, which is half of what a skill is', () => {
    expect(validateSwnCharacterSnapshot({ ...snapshot, skills: [{ name: 'Shoot' }] }).ok).toBe(
      false,
    );
  });

  it('rejects a focus with no level, because the level is the pick', () => {
    expect(validateSwnCharacterSnapshot({ ...snapshot, focuses: [{ name: 'Alert' }] }).ok).toBe(
      false,
    );
  });

  it('rejects abilities with nothing to print', () => {
    expect(
      validateSwnCharacterSnapshot({ ...snapshot, abilities: [{ kind: 'specialAbility' }] }).ok,
    ).toBe(false);
  });

  it('rejects a background or a class with no name', () => {
    expect(validateSwnCharacterSnapshot({ ...snapshot, background: { equipment: 1 } }).ok).toBe(
      false,
    );
    expect(validateSwnCharacterSnapshot({ ...snapshot, characterClass: {} }).ok).toBe(false);
  });

  /** Absent picks are a character who has none, not a corrupt record. */
  it('accepts a payload with no psychic picks and rejects malformed ones', () => {
    const { psychicPicks: _dropped, ...older } = snapshot;

    expect(validateSwnCharacterSnapshot(older).ok).toBe(true);
    expect(
      validateSwnCharacterSnapshot({ ...snapshot, psychicPicks: [{ disciplineName: 'Telepathy' }] })
        .ok,
    ).toBe(false);
  });

  it('has no migration to offer, and says so rather than guessing', () => {
    const result = migrateSwnCharacterSnapshot(snapshot, 0);

    expect(result.ok).toBe(false);
    expect(result.ok === false && result.reason).toBe('unsupported-version');
  });

  /** The whole read path, as the store runs it. */
  it('reads a stored payload of its own version', () => {
    const result = readArtifactPayload(
      swnCharacterArtifactKind as AnyArtifactKindEntry,
      snapshot,
      SWN_CHARACTER_PAYLOAD_VERSION,
    );

    expect(result.ok).toBe(true);
  });

  it('quarantines a payload from a version it has no step for', () => {
    const result = readArtifactPayload(
      swnCharacterArtifactKind as AnyArtifactKindEntry,
      snapshot,
      SWN_CHARACTER_PAYLOAD_VERSION + 1,
    );

    expect(result.ok).toBe(false);
  });

  it('loads a codec that round-trips the payload', async () => {
    const codec = await swnCharacterArtifactKind.loadCodec();
    const accepted = validateSwnCharacterSnapshot(snapshot);

    expect(accepted.ok).toBe(true);
    if (!accepted.ok) {
      return;
    }
    const { RNG } = await import('@ironarachne/rng');
    const live = codec.fromSnapshot(accepted.value, new RNG('unused'));

    expect(codec.toSnapshot(live)).toEqual(accepted.value);
  });
});
