import { describe, expect, it } from 'vitest';

import { readArtifactPayload, type AnyArtifactKindEntry } from '$lib/artifact_kinds';

import {
  encounterArtifactKind,
  ENCOUNTER_ARTIFACT_KIND,
  ENCOUNTER_PAYLOAD_VERSION,
  migrateEncounterSnapshot,
  validateEncounterSnapshot,
} from './encounter_artifact_kind.js';
import { rollEncounterSnapshot } from './encounter_roll.js';
import type { EncounterSnapshot } from './encounter_snapshot.js';

/** Stored payloads, as anything reading one actually receives them. */
const people = JSON.parse(
  JSON.stringify(rollEncounterSnapshot('kind-people', { templateName: 'group of bandits' })),
) as Record<string, unknown>;
const beasts = JSON.parse(
  JSON.stringify(rollEncounterSnapshot('kind-beasts', { templateName: 'wandering monster' })),
) as Record<string, unknown>;

const groups = people.groups as { mobs: Record<string, unknown>[] }[];

describe('the encounter artifact kind', () => {
  it('is registered under its own unqualified name', () => {
    expect(ENCOUNTER_ARTIFACT_KIND).toBe('encounter');
    expect(encounterArtifactKind.kind).toBe('encounter');
    expect(encounterArtifactKind.displayName).toBe('Encounter');
    expect(encounterArtifactKind.payloadVersion).toBe(ENCOUNTER_PAYLOAD_VERSION);
    expect(encounterArtifactKind.icon).not.toBe('');
  });

  it('names a saved encounter after itself, and an unnamed one by its kind', () => {
    expect(
      encounterArtifactKind.nameOf({
        name: 'pack of ghouls',
        description: '',
        difficulty: 0,
        groups: [],
      }),
    ).toBe('pack of ghouls');
    expect(
      encounterArtifactKind.nameOf({ name: '  ', description: '', difficulty: 0, groups: [] }),
    ).toBe('Encounter');
  });

  it('accepts payloads the generator produced, of people and of beasts', () => {
    expect(validateEncounterSnapshot(people).ok).toBe(true);
    expect(validateEncounterSnapshot(beasts).ok).toBe(true);
  });

  /** 3.3: an emptied encounter is a well-defined result, not a refusal. */
  it('accepts an encounter with no groups, and a group with no mobs', () => {
    expect(
      validateEncounterSnapshot({ name: '', description: '', difficulty: 0, groups: [] }).ok,
    ).toBe(true);
    expect(
      validateEncounterSnapshot({
        name: 'ambush',
        description: '',
        difficulty: 0,
        groups: [{ name: 'bandits', tags: [], mobs: [] }],
      }).ok,
    ).toBe(true);
  });

  it('rejects something that is not an object at all', () => {
    for (const payload of [null, 'ambush', 42, [people]]) {
      const result = validateEncounterSnapshot(payload);
      expect(result.ok).toBe(false);
      expect(result.ok === false && result.reason).toBe('invalid-payload');
    }
  });

  it('rejects a payload missing its own fields', () => {
    expect(validateEncounterSnapshot({ ...people, name: undefined }).ok).toBe(false);
    expect(validateEncounterSnapshot({ ...people, difficulty: 'hard' }).ok).toBe(false);
    expect(validateEncounterSnapshot({ ...people, groups: 'bandits' }).ok).toBe(false);
  });

  it('rejects a group that is not shaped as one', () => {
    expect(validateEncounterSnapshot({ ...people, groups: [null] }).ok).toBe(false);
    expect(
      validateEncounterSnapshot({ ...people, groups: [{ name: 3, tags: [], mobs: [] }] }).ok,
    ).toBe(false);
    expect(validateEncounterSnapshot({ ...people, groups: [{ tags: 'x', mobs: [] }] }).ok).toBe(
      false,
    );
    expect(validateEncounterSnapshot({ ...people, groups: [{ tags: [], mobs: {} }] }).ok).toBe(
      false,
    );
  });

  it('rejects a mob that does not say what it is, or lies about it', () => {
    const [mob] = groups[0].mobs;
    const withMob = (replacement: unknown) => ({
      ...people,
      groups: [{ name: 'bandits', tags: [], mobs: [replacement] }],
    });

    expect(validateEncounterSnapshot(withMob({ ...mob, mobKind: undefined })).ok).toBe(false);
    expect(validateEncounterSnapshot(withMob({ ...mob, mobKind: 'ghost' })).ok).toBe(false);
    expect(validateEncounterSnapshot(withMob(null)).ok).toBe(false);
    // A character-shaped record claiming to be a creature still validates as a creature, because
    // a character is a creature with more; the reverse is not true.
    expect(
      validateEncounterSnapshot(withMob({ ...mob, mobKind: 'character', firstName: 1 })).ok,
    ).toBe(false);
  });

  it('has no migration to offer, and says so rather than guessing', () => {
    const result = migrateEncounterSnapshot(people, 0);

    expect(result.ok).toBe(false);
    expect(result.ok === false && result.reason).toBe('unsupported-version');
  });

  /** The whole read path, as the store runs it. */
  it('reads a stored payload of its own version', () => {
    expect(
      readArtifactPayload(
        encounterArtifactKind as AnyArtifactKindEntry,
        people,
        ENCOUNTER_PAYLOAD_VERSION,
      ).ok,
    ).toBe(true);
  });

  it('quarantines a payload from a version it has no step for', () => {
    expect(
      readArtifactPayload(
        encounterArtifactKind as AnyArtifactKindEntry,
        people,
        ENCOUNTER_PAYLOAD_VERSION + 1,
      ).ok,
    ).toBe(false);
  });

  it('loads a codec that round-trips the payload', async () => {
    const codec = await encounterArtifactKind.loadCodec();
    const accepted = validateEncounterSnapshot(beasts);

    expect(accepted.ok).toBe(true);
    if (!accepted.ok) {
      return;
    }
    const { RNG } = await import('@ironarachne/rng');
    const live = codec.fromSnapshot(accepted.value as EncounterSnapshot, new RNG('unused'));

    expect(codec.toSnapshot(live)).toEqual(accepted.value);
  });
});
