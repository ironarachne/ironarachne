"use strict";

import * as RND from "@ironarachne/rng";
import * as Words from "@ironarachne/words";
import random from "random";
import * as AgeCategories from "../age/agecategories.js";
import * as Measurements from "../measurements.js";
import PhysicalTrait from "../physicaltraits/physicaltrait.js";
import type Species from "../species/species.js";
import Character from "./character.js";
import CharacterGeneratorConfig from "./generatorconfig.js";
import PersonalityGenerator from "./personality/generator.js";
import PersonalityGeneratorConfig from "./personality/generatorconfig.js";
import PersonalityTrait from "./personality/personalitytrait.js";

export default class CharacterGenerator {
  config: CharacterGeneratorConfig;

  constructor(config: CharacterGeneratorConfig) {
    this.config = config;
  }

  describe(character: Character): string {
    let description = "";

    const sbj = character.gender.subjectivePronoun;
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

  generate(): Character {
    const species = RND.weighted(this.config.speciesOptions);
    const ageCategoryName = RND.item(this.config.ageCategories);
    const genderName = RND.item(this.config.genderNameOptions);

    let gender;

    for (let i = 0; i < species.genders.length; i++) {
      if (species.genders[i].name === genderName) {
        gender = species.genders[i];
      }
    }

    let familyNameGenerator = this.config.familyNameGenerator;
    let femaleNameGenerator = this.config.femaleNameGenerator;
    let maleNameGenerator = this.config.maleNameGenerator;

    if (this.config.useAdaptiveNames) {
      familyNameGenerator = species.nameGeneratorSet.family;
      femaleNameGenerator = species.nameGeneratorSet.female;
      maleNameGenerator = species.nameGeneratorSet.male;
    }

    let firstNames = [];
    const lastNames = familyNameGenerator.generate(30);

    if (gender.name === "female") {
      firstNames = femaleNameGenerator.generate(30);
    } else {
      firstNames = maleNameGenerator.generate(30);
    }

    const character = new Character(species);

    const ageCategory = AgeCategories.getCategoryFromName(ageCategoryName, gender.ageCategories);

    character.age = ageCategory.randomAge();
    character.ageCategory = ageCategory;
    character.gender = gender;
    character.height = ageCategory.randomHeight();
    character.weight = ageCategory.randomWeight();

    character.personalityTraits = getRandomPersonality();
    character.physicalTraits = getRandomTraits(species);

    if (this.config.physicalTraitOverrides.length > 0) {
      character.physicalTraits = this.config.physicalTraitOverrides;
    }

    character.firstName = RND.item(firstNames);
    character.lastName = RND.item(lastNames);
    character.name = `${character.firstName} ${character.lastName}`;

    character.description = this.describe(character);

    return character;
  }
}

function describePersonality(character: Character): string {
  let traits = [];

  for (let i = 0; i < character.personalityTraits.length; i++) {
    traits.push(character.personalityTraits[i].descriptor);
  }

  let description = Words.capitalize(character.gender.subjectivePronoun) + " is " + Words.arrayToPhrase(traits);

  return description;
}

function describeTraits(character: Character): string[] {
  let traits = [];

  for (let i = 0; i < character.physicalTraits.length; i++) {
    traits.push(character.physicalTraits[i].description);
  }

  return traits;
}

function getRandomPersonality(): PersonalityTrait[] {
  const numberOfPositiveTraits = random.int(1, 2);
  const numberOfNegativeTraits = random.int(0, 1);

  const genConfig = new PersonalityGeneratorConfig();
  genConfig.numberOfNegativeTraits = numberOfNegativeTraits;
  genConfig.numberOfPositiveTraits = numberOfPositiveTraits;

  let generator = new PersonalityGenerator(genConfig);

  return generator.generate();
}

function getRandomTraits(species: Species): PhysicalTrait[] {
  const traits = [];

  for (let i = 0; i < species.physicalTraitGenerators.length; i++) {
    const newTrait = species.physicalTraitGenerators[i].generate();
    traits.push(newTrait);
  }

  return traits;
}
