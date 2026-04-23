import * as RNG from '@ironarachne/rng';
import * as AgeCategories from '$lib/age/age_categories';
import * as CombatSystem from '$lib/combat_system';
import * as CommonSpecies from '$lib/species/common';
import * as SizeMatrix from '$lib/size/size_matrix';
import type { Creature } from './creature_types';
import type { CreatureGenerationConfig } from './creature_types';

export function generate(seed: string, config: CreatureGenerationConfig): Creature {
  const rng = new RNG.RNG(seed);

  let creatureSpecies = rng.weighted(
    config.speciesOptions.map((s) => {
      return { commonality: s.commonality, value: s };
    }),
  );
  let creatureAgeCategory = AgeCategories.randomWeighted(
    config.ageCategoryNames,
    creatureSpecies.ageCategories,
    rng,
  );
  let age = rng.int(creatureAgeCategory.minAge, creatureAgeCategory.maxAge);
  let genderName = rng.item(config.genderNames);
  const gender = creatureSpecies.genders.find((g) => g.name === genderName);
  if (!gender) {
    throw new Error(`Gender ${genderName} not found for species ${creatureSpecies.name}`);
  }
  const sizeGeneratorConfig = SizeMatrix.getSizeConfig(
    gender.name,
    creatureAgeCategory.name,
    creatureSpecies.sizeGeneratorConfigMatrix,
  );
  const height = rng.int(sizeGeneratorConfig.minHeight, sizeGeneratorConfig.maxHeight);
  const weight = rng.int(sizeGeneratorConfig.minWeight, sizeGeneratorConfig.maxWeight);
  const length = rng.int(sizeGeneratorConfig.minLength, sizeGeneratorConfig.maxLength);
  let physicalTraits = CommonSpecies.randomTraits(seed + '-physical', creatureSpecies);
  let behaviors = ['cautious', 'hunting', 'lethargic', 'resting', 'sleeping', 'stalking'];
  let summary = rng.item(behaviors);
  let abilities = [...creatureSpecies.abilities];

  let creature: Creature = {
    id: rng.randomString(16),
    name: creatureSpecies.name,
    description: '',
    shortDescription: summary,
    combatProfile: CombatSystem.getDefaultCombatProfile(),
    species: creatureSpecies,
    abilities: abilities,
    actions: CombatSystem.getDefaultCombatActions(),
    behaviors: behaviors,
    physicalTraits,
    gender,
    height,
    weight,
    length,
    age,
    ageCategory: creatureAgeCategory,
    carried: [],
    relationships: [],
    tags: creatureSpecies.tags,
    creatureTypes: creatureSpecies.creatureTypes,
  };

  return creature;
}

export function getDefaultCreatureGenerationConfig(): CreatureGenerationConfig {
  return {
    ageCategoryNames: ['adult'],
    genderNames: ['female', 'male'],
    speciesOptions: [],
  };
}
