"use strict";

import * as AgeCategories from "../age/agecategories";
import * as RND from "../random";
import Gender from "../gender";
import * as Measurements from "../measurements";
import * as Words from "../words";
import Character from "./character";
import * as PersonalityTraits from "./personality";
import Species from "../species/species";

import random from "random";

export function generate(species: Species, ageCategoryName: string, gender: Gender, firstNames: string[], lastNames: string[]): Character {
  const character = new Character(species);

  const ageCategory = AgeCategories.getCategoryFromName(ageCategoryName, gender.ageCategories);

  character.age = ageCategory.randomAge();
  character.ageCategory = ageCategory;
  character.gender = gender;
  character.height = ageCategory.randomHeight();
  character.weight = ageCategory.randomWeight();
  character.traits = getRandomTraits(species);

  character.firstName = RND.item(firstNames);
  character.lastName = RND.item(lastNames);

  character.description = describe(character);

  return character;
}

function describe(character: Character): string {
  let description = "";

  const sbj = character.gender.subjectivePronoun;
  const ucSbj = Words.capitalize(sbj);
  const genderNoun = character.ageCategory.noun;

  const height = character.height + " cm (" + Measurements.inchesToFeet(Measurements.cmToInches(character.height)) + ")";
  const weight = character.weight + " kg (" + Measurements.kgToPounds(character.weight) + " lb.)";
  const spPhrase = character.species.adjective + " " + genderNoun;
  const traits = Words.arrayToPhrase(character.traits);

  description = RND.item([
    `${character.firstName} ${character.lastName} is a ${height} tall ${spPhrase}. ${ucSbj} is ${character.age} years old. ${character.firstName} has ${traits}. `,
    `${character.firstName} is ${Words.article(spPhrase)} ${spPhrase} of ${character.age} years. ${ucSbj} is ${height} tall and weighs ${weight}. ${ucSbj} has ${traits}. `,
  ]);

  description += getRandomPersonality(character.gender) + ".";

  return description;
}

export function getRandomPersonality(gender: Gender): string {
  const numberOfPositiveTraits = random.int(2, 3);
  const numberOfNegativeTraits = random.int(1, 2);

  return PersonalityTraits.getRandomTraits(gender, numberOfNegativeTraits, numberOfPositiveTraits);
}

export function getRandomTraits(species: Species): string[] {
  const traits = [];

  for (let i = 0; i < species.traits.length; i++) {
    const newTrait = species.traits[i].descriptionTemplate.replace("{name}", RND.item(species.traits[i].options));

    traits.push(newTrait);
  }

  return traits;
}
