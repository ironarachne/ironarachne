import { expect, describe, it } from 'vitest';
import { sentientSpecies, sentientSpeciesList } from './index';

describe('sentientSpeciesList', () => {
  it('is non-empty', () => {
    expect(sentientSpeciesList.length).toBeGreaterThan(0);
  });

  it('holds the same species as the keyed record', () => {
    expect(sentientSpeciesList).toEqual(Object.values(sentientSpecies));
  });

  it('gives every species a unique name', () => {
    const names = sentientSpeciesList.map((species) => species.name);

    expect(new Set(names).size).toBe(names.length);
  });

  it('gives every species the naming fields generators rely on', () => {
    for (const species of sentientSpeciesList) {
      expect(species.name).toBeTruthy();
      expect(species.pluralName).toBeTruthy();
      expect(species.adjective).toBeTruthy();
      expect(species.breedType).toBeTruthy();
    }
  });

  it('gives every species at least one environment and creature type', () => {
    for (const species of sentientSpeciesList) {
      expect(species.environments.length).toBeGreaterThan(0);
      expect(species.creatureTypes.length).toBeGreaterThan(0);
    }
  });

  it('gives every species at least one gender with a full pronoun set', () => {
    for (const species of sentientSpeciesList) {
      expect(species.genders.length).toBeGreaterThan(0);

      for (const gender of species.genders) {
        expect(gender.pronouns.subjective).toBeTruthy();
        expect(gender.pronouns.objective).toBeTruthy();
        expect(gender.pronouns.possessive).toBeTruthy();
        expect(gender.pronouns.reflexive).toBeTruthy();
      }
    }
  });

  it('gives every species age categories with sane bounds', () => {
    for (const species of sentientSpeciesList) {
      expect(species.ageCategories.length).toBeGreaterThan(0);

      for (const category of species.ageCategories) {
        expect(category.minAge).toBeLessThanOrEqual(category.maxAge);
      }
    }
  });

  it('gives every species a size config for each of its genders', () => {
    for (const species of sentientSpeciesList) {
      const genderNames = species.genders.map((gender) => gender.name);
      const matrixGenders = species.sizeGeneratorConfigMatrix.map((entry) => entry.gender);

      for (const genderName of genderNames) {
        expect(matrixGenders).toContain(genderName);
      }
    }
  });

  it('gives every size config a range where the minimum does not exceed the maximum', () => {
    for (const species of sentientSpeciesList) {
      for (const matrixEntry of species.sizeGeneratorConfigMatrix) {
        for (const entry of matrixEntry.entries) {
          const config = entry.sizeGeneratorConfig;

          expect(config.minHeight).toBeLessThanOrEqual(config.maxHeight);
          expect(config.minWeight).toBeLessThanOrEqual(config.maxWeight);
          expect(config.minLength).toBeLessThanOrEqual(config.maxLength);
        }
      }
    }
  });

  it('tags every species as sentient', () => {
    for (const species of sentientSpeciesList) {
      expect(species.tags).toContain('sentient');
    }
  });

  it('gives every species a positive commonality, so weighted picks work', () => {
    for (const species of sentientSpeciesList) {
      expect(species.commonality).toBeGreaterThan(0);
    }
  });
});

describe('sentientSpecies', () => {
  it('keys every species by its own name, with separators snake-cased', () => {
    // A key's underscores stand in for either a space or a hyphen — `yuan_ti_pureblood` is
    // "yuan-ti pureblood" — so compare with separators normalised away.
    const withoutSeparators = (value: string) => value.replace(/[_\s-]/g, '');

    for (const [key, species] of Object.entries(sentientSpecies)) {
      expect(withoutSeparators(key)).toBe(withoutSeparators(species.name));
    }
  });

  it('includes the staple fantasy species', () => {
    for (const name of ['human', 'elf', 'dwarf', 'halfling', 'orc']) {
      expect(sentientSpecies).toHaveProperty(name);
    }
  });
});
