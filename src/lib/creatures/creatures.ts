import * as AgeCategories from "$lib/age/age_categories.js";
import type Gender from "$lib/gender/gender.js";
import * as SizeMatrix from "$lib/size/size_matrix.js";
import * as CommonSpecies from "$lib/species/common.js";
import * as RND from "@ironarachne/rng";
import random from "random";
import type Creature from "./creature.js";
import type CreatureGeneratorConfig from "./creature_generator_config.js";

export function generate(config: CreatureGeneratorConfig): Creature {
  let creatureSpecies = RND.weighted(config.speciesOptions);
  let creatureAgeCategory = AgeCategories.randomWeighted(config.ageCategoryNames, creatureSpecies.ageCategories);
  let age = random.int(creatureAgeCategory.minAge, creatureAgeCategory.maxAge);
  const genderName = RND.item(config.genderNames);
  let gender = creatureSpecies.genders.find((g: Gender) => g.name === genderName);
  const sizeGeneratorConfig = SizeMatrix.getSizeConfig(
    gender.name,
    creatureAgeCategory.name,
    creatureSpecies.sizeGeneratorConfigMatrix,
  );
  const height = random.int(sizeGeneratorConfig.minHeight, sizeGeneratorConfig.maxHeight);
  const weight = random.int(sizeGeneratorConfig.minWeight, sizeGeneratorConfig.maxWeight);
  const length = random.int(sizeGeneratorConfig.minLength, sizeGeneratorConfig.maxLength);
  let physicalTraits = CommonSpecies.randomTraits(creatureSpecies);
  let behaviors = ["cautious", "hunting", "lethargic", "resting", "sleeping", "stalking"];
  let summary = RND.item(behaviors);
  let abilities = creatureSpecies.abilities;

  let threatLevel = creatureSpecies.baseThreatLevel;
  for (let i = 0; i < abilities.length; i++) {
    threatLevel += abilities[i].threatLevel;
  }

  let creature: Creature = {
    name: creatureSpecies.name,
    description: creatureSpecies.description,
    summary: summary,
    statBlock: null,
    species: creatureSpecies,
    abilities: abilities,
    behaviors: behaviors,
    threatLevel: threatLevel,
    physicalTraits,
    gender,
    height,
    weight,
    length,
    age,
    ageCategory: creatureAgeCategory,
    carried: [],
    tags: creatureSpecies.tags,
    creatureTypes: creatureSpecies.creatureTypes,
  };

  return creature;
}

export function getTotalThreatLevel(creature: Creature): number {
  let totalThreatLevel = creature.species.baseThreatLevel;
  for (let i = 0; i < creature.abilities.length; i++) {
    totalThreatLevel += creature.abilities[i].threatLevel;
  }

  return totalThreatLevel;
}

export function hasAllTagsIn(tags: string[], creatures: Creature[]): Creature[] {
  let result = [];

  for (let i = 0; i < creatures.length; i++) {
    let valid = true;
    for (let t = 0; t < tags.length; t++) {
      if (!creatures[i].tags.includes(tags[t])) {
        valid = false;
        break;
      }
    }
    if (valid === true) {
      result.push(creatures[i]);
    }
  }

  return result;
}

export function hasAnyTagIn(tags: string[], creatures: Creature[]): Creature[] {
  let result = [];

  for (let i = 0; i < creatures.length; i++) {
    let valid = false;
    for (let t = 0; t < tags.length; t++) {
      if (creatures[i].tags.includes(tags[t])) {
        valid = true;
        break;
      }
    }
    if (valid === true) {
      result.push(creatures[i]);
    }
  }

  return result;
}

export function hasNoTagIn(tags: string[], creatures: Creature[]): Creature[] {
  let result = [];

  for (let i = 0; i < creatures.length; i++) {
    let valid = true;
    for (let t = 0; t < tags.length; t++) {
      if (creatures[i].tags.includes(tags[t])) {
        valid = false;
        break;
      }
    }
    if (valid === true) {
      result.push(creatures[i]);
    }
  }

  return result;
}

export function newCreatureGeneratorConfig(): CreatureGeneratorConfig {
  return {
    ageCategoryNames: ["adult"],
    genderNames: ["female", "male"],
    speciesOptions: [],
  };
}
