"use strict";

import * as RND from "../random";
import * as Dice from "../dice";
import * as Measurements from "../measurements";
import * as Words from "../words";
import Character from "./character";
import * as PersonalityTraits from "./personality";
import {Species} from "../species/common";
import {AgeCategory} from "../age";

import random from "random";

export function generate(species: Species, ageGroupName: string, gender: string, firstNames: string[], lastNames: string[]) {
  const character = new Character(species);

  const ageGroup = getAgeData(species, ageGroupName);

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

function describe(character: Character): string {
  let description = "";

  const sbj = Words.pronoun(character.gender, "subjective");
  const ucSbj = Words.capitalize(sbj);

  const height = character.height + " cm (" + Measurements.inchesToFeet(Measurements.cmToInches(character.height)) + ")";
  const weight = character.weight + " kg (" + Measurements.kgToPounds(character.weight) + " lb.)";
  const spPhrase = character.species.adjective + " " + Words.genderNoun(character.gender, character.ageGroupName);
  const traits = Words.arrayToPhrase(character.traits);

  description = RND.item([
    `${character.firstName} ${character.lastName} is a ${height} tall ${spPhrase}. ${ucSbj} is ${character.age} years old. ${character.firstName} has ${traits}. `,
    `${character.firstName} is ${Words.article(spPhrase)} ${spPhrase} of ${character.age} years. ${ucSbj} is ${height} tall and weighs ${weight}. ${ucSbj} has ${traits}. `,
  ]);

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
  const numberOfPositiveTraits = random.int(2, 3);
  const numberOfNegativeTraits = random.int(1, 2);

  return PersonalityTraits.getRandomTraits(gender, numberOfNegativeTraits, numberOfPositiveTraits);
}

export function getRandomTraits(species: Species) {
  const traits = [];

  for (let i = 0; i < species.traits.length; i++) {
    const newTrait = species.traits[i].descriptionTemplate.replace("{name}", RND.item(species.traits[i].options));

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
