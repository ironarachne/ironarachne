"use strict";

import * as RND from "../random";
import * as Dice from "../dice";
import * as Measurements from "../measurements";
import * as Words from "../words";
import Character from "./character";
import * as PersonalityTraits from "./personality";
import {Species} from "@/modules/species/common";
import {AgeCategory} from "@/modules/age";

const random = require("random");

export function generate(species: Species, ageGroupName: string, gender: string, firstNames: string[], lastNames: string[]) {
  let character = new Character(species);

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

function describe(character: Character) {
  let description = "";

  let subjectivePronoun = Words.pronoun(character.gender, "subjective");

  description += character.firstName + " is " + Words.article(character.species.adjective) + " " + character.species.adjective;
  description += " " + Words.genderNoun(character.gender, character.ageGroupName) + " of " + character.age + " years. ";
  description += Words.capitalize(subjectivePronoun) + " is " + character.height + " cm (";
  description += Measurements.inchesToFeet(Measurements.cmToInches(character.height)) + ") tall and weighs ";
  description += character.weight + " kg (" + Measurements.kgToPounds(character.weight) + " lbs). " + Words.capitalize(subjectivePronoun) + " has ";

  description += Words.arrayToPhrase(character.traits) + ". ";

  description += getRandomPersonality(character.gender) + ".";

  return description;
}

export function getAgeData(species: Species, ageGroupName: string) {
  let group = species.ageGroups[0];

  for (let i = 0; i < species.ageGroups.length; i++) {
    group = species.ageGroups[i];
    if (group.name == ageGroupName) {
      return group;
    }
  }

  return group;
}

export function getRandomAge(ageGroup: AgeCategory) {
  return random.int(ageGroup.minAge, ageGroup.maxAge);
}

export function getRandomHeight(ageGroup: AgeCategory, gender: string) {
  if (gender == "female") {
    return Dice.roll(ageGroup.femaleHeightMetric);
  }

  return Dice.roll(ageGroup.maleHeightMetric);
}

export function getRandomPersonality(gender: string) {
  let numberOfPositiveTraits = random.int(2, 3);
  let numberOfNegativeTraits = random.int(1, 2);

  return PersonalityTraits.getRandomTraits(gender, numberOfNegativeTraits, numberOfPositiveTraits);
}

export function getRandomTraits(species: Species) {
  let traits = [];

  for (let i = 0; i < species.traits.length; i++) {
    let newTrait = species.traits[i].descriptionTemplate.replace("{name}", RND.item(species.traits[i].options));

    traits.push(newTrait);
  }

  return traits;
}

export function getRandomWeight(ageGroup: AgeCategory, gender: string) {
  if (gender == "female") {
    return Dice.roll(ageGroup.femaleWeightMetric);
  }

  return Dice.roll(ageGroup.maleWeightMetric);
}
