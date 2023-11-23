import * as AgeCategories from "$lib/age/age_categories";
import * as Archetypes from "$lib/archetypes/archetypes";
import type Gender from "$lib/gender/gender.js";
import * as Measurements from "$lib/measurements";
import * as SizeMatrix from "$lib/size/size_matrix.js";
import * as CommonSpecies from "$lib/species/common";
import * as MUN from "@ironarachne/made-up-names";
import * as RND from "@ironarachne/rng";
import * as Words from "@ironarachne/words";
import random from "random";
import type Character from "./character";
import type CharacterGeneratorConfig from "./character_generator_config";
import * as PersonalityTraits from "./personality/all_traits";
import * as Personality from "./personality/personality";
import type PersonalityGeneratorConfig from "./personality/personality_generator_config";
import type PersonalityTrait from "./personality/personality_trait";
import type Title from "./titles/title";
import * as Titles from "./titles/titles";

export function describe(character: Character): string {
  let description = "";

  const sbj = character.gender.pronouns.subjective;
  const ucSbj = Words.capitalize(sbj);
  const genderNoun = character.ageCategory.noun;

  const height = character.height
    + " cm ("
    + Measurements.inchesToFeetExpression(Measurements.cmToInches(character.height))
    + ")";
  const weight = character.weight + " kg (" + Math.round(Measurements.kgToPounds(character.weight)) + " lb.)";
  const spPhrase = character.species.adjective + " " + genderNoun;
  const traits = Words.arrayToPhrase(describeTraits(character));

  description = RND.item([
    `${character.firstName} ${character.lastName} is a ${height} tall ${spPhrase}. ${ucSbj} is ${character.age} years old. ${character.firstName} has ${traits}. `,
    `${character.firstName} is ${
      Words.article(spPhrase)
    } ${spPhrase} of ${character.age} years. ${ucSbj} is ${height} tall and weighs ${weight}. ${ucSbj} has ${traits}. `,
  ]);

  description += describePersonality(character) + ".";

  return description;
}

export function describePersonality(character: Character): string {
  let traits = [];

  for (let i = 0; i < character.personalityTraits.length; i++) {
    traits.push(character.personalityTraits[i].descriptor);
  }

  let description = Words.capitalize(character.gender.pronouns.subjective) + " is " + Words.arrayToPhrase(traits);

  return description;
}

export function describeTraits(character: Character): string[] {
  let traits = [];

  for (let i = 0; i < character.physicalTraits.length; i++) {
    traits.push(character.physicalTraits[i].description);
  }

  return traits;
}

export function generate(config: CharacterGeneratorConfig): Character {
  if (config.speciesOptions.length === 0) {
    throw new Error("No species options provided.");
  }

  const species = RND.weighted(config.speciesOptions);
  const genderName = RND.item(config.genderNameOptions);

  let gender = species.genders.find((g: Gender) => g.name === genderName);

  const ageCategory = AgeCategories.randomWeighted(config.ageCategoryNames, species.ageCategories);

  let familyNameGenerator = config.familyNameGenerator;
  let femaleNameGenerator = config.femaleNameGenerator;
  let maleNameGenerator = config.maleNameGenerator;

  if (config.useAdaptiveNames) {
    let speciesNameGenerator;
    try {
      speciesNameGenerator = MUN.getSetByName(species.name, MUN.allSets());
    } catch (e) {
      speciesNameGenerator = MUN.getSetByName("fantasy", MUN.allSets());
    }

    familyNameGenerator = speciesNameGenerator.family;
    femaleNameGenerator = speciesNameGenerator.female;
    maleNameGenerator = speciesNameGenerator.male;
  }

  let firstNames = [];
  const lastNames = familyNameGenerator.generate(30);

  if (gender.name === "female") {
    firstNames = femaleNameGenerator.generate(30);
  } else {
    firstNames = maleNameGenerator.generate(30);
  }

  const age = random.int(ageCategory.minAge, ageCategory.maxAge);

  const sizeGeneratorConfig = SizeMatrix.getSizeConfig(
    gender.name,
    ageCategory.name,
    species.sizeGeneratorConfigMatrix,
  );
  const height = random.int(sizeGeneratorConfig.minHeight, sizeGeneratorConfig.maxHeight);
  const weight = random.int(sizeGeneratorConfig.minWeight, sizeGeneratorConfig.maxWeight);

  const personalityTraits = getRandomPersonality();
  let physicalTraits = CommonSpecies.randomTraits(species);

  if (config.physicalTraitOverrides.length > 0) {
    physicalTraits = config.physicalTraitOverrides;
  }

  const firstName = RND.item(firstNames);
  const lastName = RND.item(lastNames);
  const name = `${firstName} ${lastName}`;
  const titles: Title[] = [];
  let abilities = species.abilities;

  let threatLevel = species.baseThreatLevel;
  for (let i = 0; i < abilities.length; i++) {
    threatLevel += abilities[i].threatLevel;
  }

  let character: Character = {
    name,
    firstName,
    lastName,
    heraldry: null,
    carried: [],
    threatLevel: threatLevel,
    abilities: abilities,
    traits: [],
    titles,
    species,
    age,
    height,
    weight,
    personalityTraits,
    physicalTraits,
    description: "",
    summary: "",
    gender,
    archetype: Archetypes.blank,
    statBlock: null,
    ageCategory,
    status: "alive",
    tags: [],
  };
  character.description = describe(character);

  return character;
}

export function getDefaultCharacterGeneratorConfig(): CharacterGeneratorConfig {
  const nameSet = MUN.getSetByName("fantasy", MUN.allSets());

  return {
    speciesOptions: [],
    ageCategoryNames: ["adult"],
    familyNameGenerator: nameSet.family,
    femaleNameGenerator: nameSet.female,
    maleNameGenerator: nameSet.male,
    genderNameOptions: ["female", "male"],
    useAdaptiveNames: false,
    physicalTraitOverrides: [],
  };
}

export function getHonorific(character: Character): string {
  let primaryTitle = getPrimaryTitle(character);

  if (primaryTitle) {
    return Titles.getHonorific(character.gender.name, primaryTitle);
  }

  return "";
}

export function getPrimaryTitle(character: Character): Title | null {
  let highestPrecedence = 100;
  let primaryTitle = null;

  for (let i = 0; i < character.titles.length; i++) {
    if (character.titles[i].precedence < highestPrecedence) {
      highestPrecedence = character.titles[i].precedence;

      primaryTitle = character.titles[i];
    }
  }

  return primaryTitle;
}

export function getRandomPersonality(): PersonalityTrait[] {
  const numberOfPositiveTraits = random.int(1, 2);
  const numberOfNegativeTraits = random.int(0, 1);

  const genConfig: PersonalityGeneratorConfig = {
    numberOfNegativeTraits,
    numberOfPositiveTraits,
    traits: PersonalityTraits.all(),
  };

  return Personality.generate(genConfig);
}

export function getRandomTrait(character: Character): string {
  return RND.item(character.traits);
}

export function getTitle(character: Character): string {
  let primaryTitle = getPrimaryTitle(character);

  if (primaryTitle) {
    return Titles.getTitleForGender(character.gender.name, primaryTitle);
  }

  return "";
}

export function getTotalThreatLevel(character: Character): number {
  let totalThreatLevel = character.species.baseThreatLevel;
  for (let i = 0; i < character.abilities.length; i++) {
    totalThreatLevel += character.abilities[i].threatLevel;
  }

  return totalThreatLevel;
}
