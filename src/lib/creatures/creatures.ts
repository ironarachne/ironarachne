import * as RNG from '@ironarachne/rng';
import { AgeCategories } from '$lib/age';
import * as CombatSystem from '$lib/combat_system';
import { CommonSpecies } from '$lib/species';
import { withLegacyActorMechanics } from '$lib/rulesets';
import { getSizeConfig } from '$lib/size';
import type { Creature } from './creature_types';
import type { CreatureGenerationConfig } from './creature_types';

export function generate(seed: string, config: CreatureGenerationConfig): Creature {
  const rng = new RNG.RNG(seed);

  const creatureSpecies = rng.weighted(
    config.speciesOptions.map((s) => {
      return { commonality: s.commonality, value: s };
    }),
  );
  const creatureAgeCategory = AgeCategories.randomWeighted(
    config.ageCategoryNames,
    creatureSpecies.ageCategories,
    rng,
  );
  const age = rng.int(creatureAgeCategory.minAge, creatureAgeCategory.maxAge);
  const genderName = rng.item(config.genderNames);
  const gender = creatureSpecies.genders.find((g) => g.name === genderName);
  if (!gender) {
    throw new Error(`Gender ${genderName} not found for species ${creatureSpecies.name}`);
  }
  const sizeGeneratorConfig = getSizeConfig(
    gender.name,
    creatureAgeCategory.name,
    creatureSpecies.sizeGeneratorConfigMatrix,
  );
  const height = rng.int(sizeGeneratorConfig.minHeight, sizeGeneratorConfig.maxHeight);
  const weight = rng.int(sizeGeneratorConfig.minWeight, sizeGeneratorConfig.maxWeight);
  const length = rng.int(sizeGeneratorConfig.minLength, sizeGeneratorConfig.maxLength);
  const physicalTraits = CommonSpecies.randomTraits(seed + '-physical', creatureSpecies);
  const behaviors = ['cautious', 'hunting', 'lethargic', 'resting', 'sleeping', 'stalking'];
  const summary = rng.item(behaviors);
  const abilities = [...creatureSpecies.abilities];

  const creature: Creature = {
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

  return withLegacyActorMechanics(creature, 'generated');
}

export function getDefaultCreatureGenerationConfig(): CreatureGenerationConfig {
  return {
    ageCategoryNames: ['adult'],
    genderNames: ['female', 'male'],
    speciesOptions: [],
  };
}
