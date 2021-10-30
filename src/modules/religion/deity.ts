"use strict";

import * as PersonalityTraits from "../characters/personality";
import * as Words from "../words";
import {Gender} from "../gender";
import {Species} from "../species/common";
import {Domain} from "./domain";
import {Realm} from "./realm";
import {Relationship} from "../characters/relationship";

import random from "random";
import { AgeCategory } from "../age";

export class Deity {
  name: string;
  species: Species;
  gender: Gender;
  ageCategory: AgeCategory;
  domains: Domain[];
  titles: string[];
  realm: Realm;
  description: string;
  personality: string;
  appearance: string;
  relationships: Relationship[];
  holyItem: string;
  holySymbol: string;
  isAlive: boolean;

  constructor(name: string, species: Species, gender: Gender, ageCategory: AgeCategory, realm: Realm, domains: Domain[]) {
    this.name = name;
    this.species = species;
    this.gender = gender;
    this.ageCategory = ageCategory;
    this.domains = domains;
    this.titles = [];
    this.realm = realm;
    this.description = "";
    this.personality = "";
    this.appearance = "";
    this.relationships = [];
    this.holyItem = "";
    this.holySymbol = "";
    this.isAlive = true;
  }
}

export function describe(deity: Deity) {
  const speciesAdj = deity.species.adjective;
  const subjectivePronoun = deity.gender.subjectivePronoun;
  let noun = "god";
  const domainNames = [];

  for (let i = 0; i < deity.domains.length; i++) {
    domainNames.push(deity.domains[i].name);
  }

  if (deity.gender.name === "female") {
    noun = "goddess";
  }

  let description = `${deity.name} appears as ${Words.article(speciesAdj)} ${speciesAdj} ${deity.ageCategory.noun}.`;
  description += ` ${Words.capitalize(subjectivePronoun)} has ${deity.appearance}. ${deity.personality}.`;
  description += ` ${deity.name} is the ${noun} of ${Words.arrayToPhrase(domainNames)}.`;
  description += ` ${Words.capitalize(subjectivePronoun)} resides in ${Words.uncapitalize(deity.realm.name)}.`;

  return description;
}

export function getRandomPersonality(gender: string) {
  const numberOfPositiveTraits = random.int(2, 3);
  const numberOfNegativeTraits = random.int(1, 2);

  return PersonalityTraits.getRandomTraits(gender, numberOfNegativeTraits, numberOfPositiveTraits);
}
