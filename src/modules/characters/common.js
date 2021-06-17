"use strict";

import * as RND from "../random.js";
import * as Dice from "../dice.js";
import * as Measurements from "../measurements.js";
import * as Words from "../words.js";
import Character from "./character.js";
import * as PersonalityTraits from "./personality.js";

const random = require("random");

export function generate(species, ageGroupName, gender, firstNames, lastNames) {
  let character = new Character();

  character.species = species;

  let ageGroup = getAgeData(species, ageGroupName);

  character.age = getRandomAge(ageGroup);
  character.ageGroupName = ageGroupName;
  character.gender = gender;
  character.weight = getRandomWeight(ageGroup, gender);
  character.height = getRandomHeight(ageGroup, gender);
  character.traits = getRandomTraits(species);

  character.firstName = RND.item(firstNames);
  character.lastName = RND.item(lastNames);

  character.description = describe(character);

  return character;
}

function describe(character) {
  let description = "";

  let subjectivePronoun = Words.pronoun(character.gender, "subjective");

  description += character.firstName + " is " + Words.article(character.species.adjective) + " " + character.species.adjective;
  description += " " + Words.genderNoun(character.gender, character.ageGroupName) + " of " + character.age + " years. ";
  description += Words.capitalize(subjectivePronoun) + " is " + character.height + " cm (";
  description += Measurements.inchesToFeet(Measurements.cmToInches(character.height)) + ") tall and weighs ";
  description += character.weight + " kg (" + Measurements.kgToPounds(character.weight) + " lbs). " + Words.capitalize(subjectivePronoun) + " has ";

  let traits = [];

  for (let i = 0; i < character.traits.length; i++) {
    traits.push(character.traits[i].description);
  }

  description += Words.arrayToPhrase(traits) + ". ";

  description += getRandomPersonality(character.gender) + ".";

  return description;
}

export function getAgeData(species, ageGroupName) {
  let ageGroup = {};

  for (let i = 0; i < species.ageGroups.length; i++) {
    let group = species.ageGroups[i];
    if (group.name == ageGroupName) {
      ageGroup = group;
    }
  }

  return ageGroup;
}

export function getRandomAge(ageGroup) {
  return random.int(ageGroup.minAge, ageGroup.maxAge);
}

export function getRandomHeight(ageGroup, gender) {
  let height = 0;

  if (gender == "female") {
    height = Dice.roll(ageGroup.femaleHeightMetric);
  } else {
    height = Dice.roll(ageGroup.maleHeightMetric);
  }

  return height;
}

export function getRandomPersonality(gender) {
  let numberOfPositiveTraits = random.int(2, 3);
  let numberOfNegativeTraits = random.int(1, 2);

  return PersonalityTraits.getRandomTraits(gender, numberOfNegativeTraits, numberOfPositiveTraits);
}

export function getRandomTraits(species) {
  let traits = [];

  for (let i = 0; i < species.traits.length; i++) {
    let newTrait = {
      name: species.traits[i].name,
      template: species.traits[i].descriptionTemplate,
      option: RND.item(species.traits[i].options),
    };

    newTrait.description = newTrait.template.replace("{name}", newTrait.option);

    traits.push(newTrait);
  }

  return traits;
}

export function getRandomWeight(ageGroup, gender) {
  let weight = 0;

  if (gender == "female") {
    weight = Dice.roll(ageGroup.femaleWeightMetric);
  } else {
    weight = Dice.roll(ageGroup.maleWeightMetric);
  }

  return weight;
}
