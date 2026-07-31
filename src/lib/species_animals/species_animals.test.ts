import { expect, describe, it } from 'vitest';
import type Species from '$lib/species/species';

/**
 * The library is a flat directory of data modules with no aggregating index, so the suite
 * collects them the way Vite does: eagerly, by glob. Every file here must satisfy the same
 * contract, and a new animal is picked up without touching this test.
 */
const modules = import.meta.glob<{ default: Species }>('./*.ts', { eager: true });
const animals = Object.entries(modules)
  .filter(([path]) => !path.endsWith('.test.ts'))
  .map(([path, module]) => [path, module.default] as const);

describe('animal species data', () => {
  it('finds a species module for every file in the library', () => {
    expect(animals.length).toBeGreaterThan(0);
  });

  it('gives every module a default-exported species', () => {
    for (const [path, species] of animals) {
      expect(species, `${path} has no default export`).toBeDefined();
    }
  });

  it('names every species uniquely', () => {
    const names = animals.map(([, species]) => species.name);

    expect(new Set(names).size).toBe(names.length);
  });

  it('gives every species the naming fields generators rely on', () => {
    for (const [path, species] of animals) {
      expect(species.name, path).toBeTruthy();
      expect(species.pluralName, path).toBeTruthy();
      expect(species.adjective, path).toBeTruthy();
      expect(species.breedType, path).toBeTruthy();
    }
  });

  it('gives every species at least one environment and creature type', () => {
    for (const [path, species] of animals) {
      expect(species.environments.length, path).toBeGreaterThan(0);
      expect(species.creatureTypes.length, path).toBeGreaterThan(0);
    }
  });

  it('never tags an animal as sentient', () => {
    for (const [path, species] of animals) {
      expect(species.tags, path).not.toContain('sentient');
    }
  });

  it('gives every species a positive commonality, so weighted picks work', () => {
    for (const [path, species] of animals) {
      expect(species.commonality, path).toBeGreaterThan(0);
    }
  });

  it('gives every species at least one gender with a full pronoun set', () => {
    for (const [path, species] of animals) {
      expect(species.genders.length, path).toBeGreaterThan(0);

      for (const gender of species.genders) {
        expect(gender.pronouns.subjective, path).toBeTruthy();
        expect(gender.pronouns.objective, path).toBeTruthy();
        expect(gender.pronouns.possessive, path).toBeTruthy();
        expect(gender.pronouns.reflexive, path).toBeTruthy();
      }
    }
  });

  it('gives every species age categories with sane bounds', () => {
    for (const [path, species] of animals) {
      expect(species.ageCategories.length, path).toBeGreaterThan(0);

      for (const category of species.ageCategories) {
        expect(category.minAge, `${path}: ${category.name}`).toBeLessThanOrEqual(category.maxAge);
      }
    }
  });

  it('gives every species a size config for each of its genders', () => {
    for (const [path, species] of animals) {
      const matrixGenders = species.sizeGeneratorConfigMatrix.map((entry) => entry.gender);

      for (const gender of species.genders) {
        expect(matrixGenders, path).toContain(gender.name);
      }
    }
  });

  it('gives every size config a range where the minimum does not exceed the maximum', () => {
    for (const [path, species] of animals) {
      for (const matrixEntry of species.sizeGeneratorConfigMatrix) {
        for (const entry of matrixEntry.entries) {
          const config = entry.sizeGeneratorConfig;
          const where = `${path}: ${matrixEntry.gender}/${entry.ageCategoryName}`;

          expect(config.minHeight, where).toBeLessThanOrEqual(config.maxHeight);
          expect(config.minWeight, where).toBeLessThanOrEqual(config.maxWeight);
          expect(config.minLength, where).toBeLessThanOrEqual(config.maxLength);
        }
      }
    }
  });

  it('gives every physical trait config at least one option', () => {
    for (const [path, species] of animals) {
      for (const config of species.physicalTraitGeneratorConfigs) {
        expect(config.options.length, `${path}: ${config.name}`).toBeGreaterThan(0);
      }
    }
  });
});
