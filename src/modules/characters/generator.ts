'use strict';

import * as RND from '../random';
import Character from './character';
import * as AgeCategories from '../age/agecategories';
import * as Words from '../words';
import * as Measurements from '../measurements';
import type Species from '../species/species';
import PhysicalTrait from '../physicaltraits/physicaltrait';
import CharacterGeneratorConfig from './generatorconfig';

import random from 'random';
import PersonalityGeneratorConfig from './personality/generatorconfig';
import PersonalityGenerator from './personality/generator';
import PersonalityTrait from './personality/personalitytrait';

export default class CharacterGenerator {
  config: CharacterGeneratorConfig;

  constructor(config: CharacterGeneratorConfig) {
    this.config = config;
  }

  describe(character: Character): string {
    let description = '';

    const sbj = character.gender.subjectivePronoun;
    const ucSbj = Words.capitalize(sbj);
    const genderNoun = character.ageCategory.noun;

    const height =
      character.height +
      ' cm (' +
      Measurements.inchesToFeet(Measurements.cmToInches(character.height)) +
      ')';
    const weight = character.weight + ' kg (' + Measurements.kgToPounds(character.weight) + ' lb.)';
    const spPhrase = character.species.adjective + ' ' + genderNoun;
    const traits = Words.arrayToPhrase(describeTraits(character));

    description = RND.item([
      `${character.firstName} ${character.lastName} is a ${height} tall ${spPhrase}. ${ucSbj} is ${character.age} years old. ${character.firstName} has ${traits}. `,
      `${character.firstName} is ${Words.article(spPhrase)} ${spPhrase} of ${
        character.age
      } years. ${ucSbj} is ${height} tall and weighs ${weight}. ${ucSbj} has ${traits}. `,
    ]);

    description += describePersonality(character) + '.';

    return description;
  }

  generate(): Character {
    const species = RND.weighted(this.config.speciesOptions);
    const ageCategoryName = RND.item(this.config.ageCategories);
    const gender = RND.item(this.config.genderOptions);

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

    if (gender.name === 'female') {
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

    character.description = this.describe(character);

    return character;
  }
}

function describePersonality(character: Character): string {
  let traits = [];

  for (let i = 0; i < character.personalityTraits.length; i++) {
    traits.push(character.personalityTraits[i].descriptor);
  }

  let description =
    Words.capitalize(character.gender.subjectivePronoun) + ' is ' + Words.arrayToPhrase(traits);

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
