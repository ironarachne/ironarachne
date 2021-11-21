"use strict";

import * as Words from "../words";
import Gender from "../gender";
import Species from "../species/species";
import Domain from "./domain";
import Realm from "./realm";
import {Relationship} from "../characters/relationship";

import { AgeCategory } from "../age";

export default class Deity {
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

  describe(): string {
    const speciesAdj = this.species.adjective;
    const subjectivePronoun = this.gender.subjectivePronoun;
    let noun = "god";
    const domainNames = [];

    for (let i = 0; i < this.domains.length; i++) {
      domainNames.push(this.domains[i].name);
    }

    if (this.gender.name === "female") {
      noun = "goddess";
    }

    let description = `${this.name} appears as ${Words.article(speciesAdj)} ${speciesAdj} ${this.ageCategory.noun}.`;
    description += ` ${Words.capitalize(subjectivePronoun)} has ${this.appearance}. ${this.personality}.`;
    description += ` ${this.name} is the ${noun} of ${Words.arrayToPhrase(domainNames)}.`;
    description += ` ${Words.capitalize(subjectivePronoun)} resides in ${Words.uncapitalize(this.realm.name)}.`;

    return description;
  }
}
