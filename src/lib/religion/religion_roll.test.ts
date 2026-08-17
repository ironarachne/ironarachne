import { describe, expect, it } from 'vitest';

import { readReligionGeneratorConfig, rollReligionSnapshot } from './religion_roll';

describe('readReligionGeneratorConfig', () => {
  it('reads back what the generator records', () => {
    expect(
      readReligionGeneratorConfig({
        nameGeneratorSet: 'elf',
        selectedCategories: ['monotheism'],
        selectedSpecies: ['human', 'elf'],
        polytheisticStanding: 'egalitarian',
        spiritCosmologyDepth: 'deep',
        useSavedCulture: true,
        savedCultureName: 'The Emberfolk',
        lockSeed: true,
      }),
    ).toEqual({
      nameGeneratorSet: 'elf',
      selectedCategories: ['monotheism'],
      selectedSpecies: ['human', 'elf'],
      polytheisticStanding: 'egalitarian',
      spiritCosmologyDepth: 'deep',
      useSavedCulture: true,
      savedCultureName: 'The Emberfolk',
      lockSeed: true,
    });
  });

  it('drops anything it does not recognise rather than coercing it', () => {
    expect(
      readReligionGeneratorConfig({
        nameGeneratorSet: '',
        selectedCategories: 'monotheism',
        selectedSpecies: [1, 2],
        polytheisticStanding: 'ecumenical',
        spiritCosmologyDepth: 42,
        useSavedCulture: 'yes',
        savedCultureName: null,
        lockSeed: 1,
      }),
    ).toEqual({});
  });

  it('reads an empty provenance as no settings at all', () => {
    expect(readReligionGeneratorConfig({})).toEqual({});
  });
});

describe('rollReligionSnapshot', () => {
  it('is deterministic for a seed and a config', () => {
    const config = { selectedCategories: ['polytheism'], nameGeneratorSet: 'human' };

    expect(rollReligionSnapshot('roll-seed', config)).toEqual(
      rollReligionSnapshot('roll-seed', config),
    );
  });

  it('rolls a whole artifact payload, options and all', () => {
    const snapshot = rollReligionSnapshot('roll-seed', {
      selectedCategories: ['polytheism'],
      selectedSpecies: ['human'],
      polytheisticStanding: 'egalitarian',
      spiritCosmologyDepth: 'shallow',
      useSavedCulture: true,
      savedCultureName: 'The Emberfolk',
      lockSeed: true,
    });

    expect(snapshot.seed).toBe('roll-seed');
    expect(snapshot.name).toBe(snapshot.religion.name);
    expect(snapshot.generatorOptions).toEqual({
      lockSeed: true,
      selectedCategories: ['polytheism'],
      selectedSpecies: ['human'],
      polytheisticStanding: 'egalitarian',
      spiritCosmologyDepth: 'shallow',
      useSavedCulture: true,
      savedCultureName: 'The Emberfolk',
    });
  });

  it('honours the categories it was given', () => {
    const snapshot = rollReligionSnapshot('roll-seed', { selectedCategories: ['animism'] });

    // Animism has no gods, so drawing from that pool alone is visible in the payload.
    expect(snapshot.religion.pantheon).toBeNull();
    expect(snapshot.religion.nonTheisticDetail?.categoryName).toBe('animism');
  });

  /**
   * A religion whose names came from a saved culture rolls again in that culture's style, because
   * the pattern set travels in provenance. Reaching back into the store for the culture itself is
   * what this avoids: a roll has a seed and a config and nothing else.
   */
  it('names the pantheon from the recorded pattern set', () => {
    const fromElves = rollReligionSnapshot('roll-seed', {
      selectedCategories: ['polytheism'],
      nameGeneratorSet: 'elf',
    });
    const fromHumans = rollReligionSnapshot('roll-seed', {
      selectedCategories: ['polytheism'],
      nameGeneratorSet: 'human',
    });

    expect(fromElves.religion.name).not.toBe(fromHumans.religion.name);
  });

  it('falls back to every category when the recorded ones mean nothing to this build', () => {
    const snapshot = rollReligionSnapshot('roll-seed', { selectedCategories: ['thaumaturgy'] });

    expect(snapshot.generatorOptions.selectedCategories.length).toBeGreaterThan(1);
  });

  it('falls back to human deities when the recorded species mean nothing to this build', () => {
    const snapshot = rollReligionSnapshot('roll-seed', { selectedSpecies: ['sylph'] });

    expect(snapshot.generatorOptions.selectedSpecies).toEqual(['human']);
  });

  it('throws rather than substituting when the name pattern set is not one this build has', () => {
    expect(() => rollReligionSnapshot('roll-seed', { nameGeneratorSet: 'martian' })).toThrow(
      /not available/,
    );
  });
});
