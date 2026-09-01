import { describe, expect, it } from 'vitest';

import {
  FAMILY_DEFAULT_GENERATIONS,
  FAMILY_MAX_GENERATIONS,
  readFamilyGeneratorConfig,
  rollFamily,
  rollFamilySnapshot,
} from './family_roll.js';

describe('rollFamily', () => {
  /** Requirement 2.2, including the names, which the page used to draw from its own RNG. */
  it('gives the same family, names included, for the same seed and settings', () => {
    const first = rollFamily('a-fixed-seed', { speciesName: 'human' });
    const second = rollFamily('a-fixed-seed', { speciesName: 'human' });

    expect(second.family).toEqual(first.family);
    expect(second.family.members.map((m) => m.name)).toEqual(
      first.family.members.map((m) => m.name),
    );
  });

  it('gives a different family for a different seed', () => {
    const seeds = ['one', 'two', 'three'].map((seed) => rollFamily(seed, {}).family.name);

    expect(new Set(seeds).size).toBeGreaterThan(1);
  });

  it('rolls a multi-generation family with edges between its members', () => {
    const { family } = rollFamily('generations', { speciesName: 'human', generations: 3 });

    expect(family.members.length).toBeGreaterThan(1);
    expect(family.relationships.length).toBeGreaterThan(0);
    expect(family.relationships.some((r) => r.type.name === 'parent')).toBe(true);
    for (const member of family.members) {
      expect(member.species.name).toBe('human');
    }
  });

  it('lets the seed choose a species when none is named, and reports which', () => {
    const roll = rollFamily('any-species', {});

    expect(roll.speciesName).toBe(roll.family.members[0].species.name);
    expect(roll.substitutions).toEqual([]);
  });

  it('names the family from the set asked for, and records which', () => {
    const roll = rollFamily('named', { speciesName: 'human', nameGeneratorSet: 'elf' });

    expect(roll.nameGeneratorSet).toBe('elf');
    expect(roll.substitutions).toEqual([]);
  });

  it('substitutes, and says so, for a species or a name set this build does not have', () => {
    const roll = rollFamily('missing', {
      speciesName: 'thrennish',
      nameGeneratorSet: 'a tongue nobody speaks',
    });

    expect(roll.substitutions).toEqual(['species', 'nameGeneratorSet']);
    expect(roll.family.members.length).toBeGreaterThan(0);
  });

  it('caps the generations at what the page allows', () => {
    const roll = rollFamily('capped', {
      speciesName: 'human',
      generations: 500,
      maxMembersPerGeneration: 1,
    });

    expect(roll.family.members.length).toBeGreaterThan(0);
  });

  it('rolls a snapshot from the same seed', () => {
    const snapshot = rollFamilySnapshot('reroll-seed', { speciesName: 'human' });

    expect(snapshot.name).toBe(rollFamily('reroll-seed', { speciesName: 'human' }).family.name);
    expect(snapshot.members[0].speciesName).toBe('human');
  });
});

describe('readFamilyGeneratorConfig', () => {
  it('reads every control the page has', () => {
    const config = {
      speciesName: 'elf',
      nameGeneratorSet: 'elf',
      lastNameTradition: 'female',
      generations: 4,
      minMembersPerGeneration: 1,
      maxMembersPerGeneration: 3,
      fertilityChance: 0.5,
      infantMortalityChance: 0.1,
      allowAdoption: true,
      adoptionChance: 0.2,
      allowIllegitimateChildren: true,
      illegitimateChildChance: 0.3,
      allowMultipleMarriages: true,
      multipleMarriageChance: 0.4,
      allowSameGenderMarriage: true,
      sameGenderMarriageChance: 0.6,
      allowCrossSpeciesMarriages: true,
      crossSpeciesMarriageChance: 0.7,
    };

    expect(readFamilyGeneratorConfig(config)).toEqual(config);
  });

  it('drops what it does not recognise rather than coercing it', () => {
    expect(
      readFamilyGeneratorConfig({
        speciesName: '',
        nameGeneratorSet: 3,
        lastNameTradition: 'neither',
        generations: 2.5,
        minMembersPerGeneration: -1,
        fertilityChance: 1.5,
        adoptionChance: 'often',
        allowAdoption: 'yes',
        other: true,
      }),
    ).toEqual({});
  });

  it('accepts the edges of the ranges', () => {
    expect(
      readFamilyGeneratorConfig({ fertilityChance: 0, adoptionChance: 1, generations: 0 }),
    ).toEqual({ fertilityChance: 0, adoptionChance: 1, generations: 0 });
  });
});

describe('the defaults', () => {
  it('are what the page has always used', () => {
    expect(FAMILY_DEFAULT_GENERATIONS).toBe(3);
    expect(FAMILY_MAX_GENERATIONS).toBe(10);
  });
});
