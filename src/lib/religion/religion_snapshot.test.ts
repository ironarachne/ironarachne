import { describe, expect, it } from 'vitest';

import { generateReligion, getDefaultReligionGenerationConfig } from './religion_generation';
import {
  religionFromSnapshot,
  toReligionSnapshot,
  type ReligionGeneratorOptionsSnapshot,
} from './religion_snapshot';

const sampleGeneratorOptions: ReligionGeneratorOptionsSnapshot = {
  lockSeed: true,
  selectedCategories: ['monotheism', 'polytheism'],
  selectedSpecies: ['human'],
  polytheisticStanding: 'balanced',
  spiritCosmologyDepth: 'moderate',
  useSavedCulture: false,
};

describe('religion_snapshot', () => {
  it('round-trips religion through JSON', () => {
    const config = getDefaultReligionGenerationConfig();
    const religion = generateReligion('religion-snapshot-test', config);
    const snapshot = toReligionSnapshot(religion, 'religion-snapshot-test', sampleGeneratorOptions);
    const json = JSON.stringify(snapshot);
    const parsed = JSON.parse(json) as typeof snapshot;
    const restored = religionFromSnapshot(parsed);

    expect(restored.seed).toBe('religion-snapshot-test');
    expect(restored.generatorOptions).toEqual(sampleGeneratorOptions);
    expect(restored.religion.name).toBe(religion.name);
    expect(restored.religion.description).toBe(religion.description);
    expect(restored.religion.realms).toHaveLength(religion.realms.length);
    expect(restored.religion.realms[0]?.name).toBe(religion.realms[0]?.name);

    if (religion.pantheon !== null) {
      expect(restored.religion.pantheon).not.toBeNull();
      expect(restored.religion.pantheon!.members).toHaveLength(religion.pantheon.members.length);
      expect(restored.religion.pantheon!.members[0]?.name).toBe(religion.pantheon.members[0]?.name);
    }

    if (religion.dimensions !== undefined) {
      const dimensionKeys = Object.keys(religion.dimensions);
      expect(Object.keys(restored.religion.dimensions ?? {})).toEqual(dimensionKeys);
    }
  });

  /**
   * Requirement 7.2, stated as a whole rather than field by field: everything a reader is shown
   * survives storage. Asserted against the snapshot rather than the live religion because the two
   * differ by exactly one thing, and that thing is the next test.
   */
  it('preserves the whole religion, not only the fields something happens to check', () => {
    const seed = 'religion-round-trip';
    const religion = generateReligion(seed, getDefaultReligionGenerationConfig());
    const snapshot = toReligionSnapshot(religion, seed, sampleGeneratorOptions);
    const restored = religionFromSnapshot(JSON.parse(JSON.stringify(snapshot)) as typeof snapshot);

    expect(restored.religion).toEqual(snapshot.religion);
    expect(restored.seed).toBe(snapshot.seed);
    expect(restored.generatorOptions).toEqual(snapshot.generatorOptions);
  });

  /**
   * The one lossy edge, and it is deliberate. A live religion carries mutators — the functions that
   * shaped its gods during generation — hanging off its domains and realms. They are stripped
   * rather than reconstructed because they did their work before the religion existed: nothing
   * reads them again, and a payload is JSON or it is not storable at all.
   */
  it('drops the generation-time functions and keeps everything around them', () => {
    const seed = 'religion-strip';
    const religion = generateReligion(seed, getDefaultReligionGenerationConfig());
    const snapshot = toReligionSnapshot(religion, seed, sampleGeneratorOptions);
    const primary = snapshot.religion.pantheon?.members[0]?.domains.primary;

    expect(JSON.parse(JSON.stringify(snapshot))).toEqual(snapshot);
    if (primary !== null && primary !== undefined) {
      expect(primary.name).toBe(religion.pantheon?.members[0]?.domains.primary?.name);
      expect(primary.mutators.every((mutator) => !('mutate' in mutator))).toBe(true);
    }
  });
});
