import { expect, describe, it } from 'vitest';
import { getSizeConfig } from '$lib/size/size_matrix';
import { nonSentient } from '$lib/species/common';
import { generate, getDefaultCreatureGenerationConfig } from './creatures';
import type { CreatureGenerationConfig } from './creature_types';

function configForFirstSpecies(): CreatureGenerationConfig {
  const config = getDefaultCreatureGenerationConfig();
  config.speciesOptions = [nonSentient()[0]];
  return config;
}

describe('getDefaultCreatureGenerationConfig', () => {
  it('defaults to adult creatures of the traditional genders', () => {
    const config = getDefaultCreatureGenerationConfig();

    expect(config.ageCategoryNames).toEqual(['adult']);
    expect(config.genderNames).toEqual(['female', 'male']);
  });

  it('starts with no species options, so callers must supply them', () => {
    expect(getDefaultCreatureGenerationConfig().speciesOptions).toEqual([]);
  });

  it('returns a fresh config each call so callers cannot mutate the default', () => {
    const first = getDefaultCreatureGenerationConfig();
    first.ageCategoryNames.push('elderly');

    expect(getDefaultCreatureGenerationConfig().ageCategoryNames).toEqual(['adult']);
  });
});

describe('generate', () => {
  it('is deterministic for a given seed and config', () => {
    expect(generate('beast', configForFirstSpecies())).toEqual(
      generate('beast', configForFirstSpecies()),
    );
  });

  it('produces different creatures for different seeds', () => {
    const ids = new Set(
      Array.from(
        { length: 8 },
        (_, index) => generate(`seed-${index}`, configForFirstSpecies()).id,
      ),
    );

    expect(ids.size).toBeGreaterThan(1);
  });

  it('names the creature after its species', () => {
    const config = configForFirstSpecies();
    const creature = generate('named', config);

    expect(creature.name).toBe(config.speciesOptions[0].name);
    expect(creature.species).toBe(config.speciesOptions[0]);
  });

  it('gives the creature a 16-character id', () => {
    expect(generate('id', configForFirstSpecies()).id).toHaveLength(16);
  });

  it('picks a gender the species actually offers', () => {
    const config = configForFirstSpecies();
    const creature = generate('gendered', config);

    expect(config.speciesOptions[0].genders).toContainEqual(creature.gender);
    expect(config.genderNames).toContain(creature.gender.name);
  });

  it('picks an age category from the configured names', () => {
    const creature = generate('aged', configForFirstSpecies());

    expect(creature.ageCategory.name).toBe('adult');
  });

  it('gives an age inside the chosen age category', () => {
    const creature = generate('aged', configForFirstSpecies());

    expect(creature.age).toBeGreaterThanOrEqual(creature.ageCategory.minAge);
    expect(creature.age).toBeLessThanOrEqual(creature.ageCategory.maxAge);
  });

  it('gives a positive height and weight, and a length the species may leave at zero', () => {
    const creature = generate('sized', configForFirstSpecies());

    expect(creature.height).toBeGreaterThan(0);
    expect(creature.weight).toBeGreaterThan(0);
    expect(creature.length).toBeGreaterThanOrEqual(0);
  });

  it('keeps each dimension inside the species size range for its gender and age', () => {
    const config = configForFirstSpecies();
    const creature = generate('ranged', config);
    const sizeConfig = getSizeConfig(
      creature.gender.name,
      creature.ageCategory.name,
      config.speciesOptions[0].sizeGeneratorConfigMatrix,
    );

    expect(creature.height).toBeGreaterThanOrEqual(sizeConfig.minHeight);
    expect(creature.height).toBeLessThanOrEqual(sizeConfig.maxHeight);
    expect(creature.weight).toBeGreaterThanOrEqual(sizeConfig.minWeight);
    expect(creature.weight).toBeLessThanOrEqual(sizeConfig.maxWeight);
  });

  it('summarises the creature with one of its behaviors', () => {
    const creature = generate('behaving', configForFirstSpecies());

    expect(creature.behaviors).toContain(creature.shortDescription);
  });

  it('starts the creature with nothing carried and no relationships', () => {
    const creature = generate('empty', configForFirstSpecies());

    expect(creature.carried).toEqual([]);
    expect(creature.relationships).toEqual([]);
  });

  it('copies abilities from the species rather than aliasing them', () => {
    const config = configForFirstSpecies();
    const creature = generate('abilities', config);

    expect(creature.abilities).toEqual(config.speciesOptions[0].abilities);
    expect(creature.abilities).not.toBe(config.speciesOptions[0].abilities);
  });

  it('takes its tags and creature types from the species', () => {
    const config = configForFirstSpecies();
    const creature = generate('tagged', config);

    expect(creature.tags).toEqual(config.speciesOptions[0].tags);
    expect(creature.creatureTypes).toEqual(config.speciesOptions[0].creatureTypes);
  });

  it('gives the creature a combat profile and default actions', () => {
    const creature = generate('combat', configForFirstSpecies());

    expect(creature.combatProfile).toBeDefined();
    expect(Array.isArray(creature.actions)).toBe(true);
  });

  it('throws when no configured gender exists on the species', () => {
    const config = configForFirstSpecies();
    config.genderNames = ['nonexistent'];

    expect(() => generate('bad-gender', config)).toThrow(
      `Gender nonexistent not found for species ${config.speciesOptions[0].name}`,
    );
  });

  it('generates a valid creature for every non-sentient species', () => {
    for (const species of nonSentient()) {
      const config = getDefaultCreatureGenerationConfig();
      config.speciesOptions = [species];
      config.genderNames = species.genders.map((gender) => gender.name);

      const creature = generate(`all-${species.name}`, config);

      expect(creature.name).toBe(species.name);
      expect(creature.age).toBeGreaterThanOrEqual(0);
    }
  });
});
