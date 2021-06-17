"use strict";

import * as PersonalityTraits from "../characters/personality.js";
import * as Words from "../words.js";

const random = require("random");

export class Deity {
  constructor(name, species, gender, domains) {
    this.name = name;
    this.species = species;
    this.gender = gender;
    this.domains = domains;
    this.titles = [];
    this.realm = {};
    this.description = "";
    this.personality = "";
    this.appearance = "";
    this.relationships = [];
    this.holyItem = "";
    this.holySymbol = "";
    this.isAlive = true;
  }
}

export function describe(deity) {
  let speciesAdj = deity.species.adjective;
  let subjectivePronoun = Words.pronoun(deity.gender, "subjective");
  let noun = "god";
  let domainNames = [];

  for (let i = 0; i < deity.domains.length; i++) {
    domainNames.push(deity.domains[i].name);
  }

  if (deity.gender === "female") {
    noun = "goddess";
  }

  let description = `${deity.name} appears as ${Words.article(speciesAdj)} ${speciesAdj} ${Words.genderNoun(deity.gender, "adult")}.`;
  description += ` ${Words.capitalize(subjectivePronoun)} has ${deity.appearance}. ${deity.personality}.`;
  description += ` ${deity.name} is the ${noun} of ${Words.arrayToPhrase(domainNames)}.`;
  description += ` ${Words.capitalize(subjectivePronoun)} resides in ${Words.uncapitalize(deity.realm.name)}.`;

  return description;
}

export function getRandomPersonality(gender) {
  let numberOfPositiveTraits = random.int(2, 3);
  let numberOfNegativeTraits = random.int(1, 2);

  return PersonalityTraits.getRandomTraits(gender, numberOfNegativeTraits, numberOfPositiveTraits);
}
