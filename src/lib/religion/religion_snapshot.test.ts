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
});
