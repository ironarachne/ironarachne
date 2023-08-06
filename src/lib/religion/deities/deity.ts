"use strict";

import * as Words from "@ironarachne/words";
import AgeCategory from "../../age/agecategory.js";
import PersonalityTrait from "../../characters/personality/personalitytrait.js";
import Gender from "../../gender.js";
import type Species from "../../species/species.js";
import DomainSet from "../domains/domainset.js";
import Realm from "../realms/realm.js";

export default class Deity {
  name: string;
  species: Species;
  gender: Gender;
  ageCategory: AgeCategory;
  domains: DomainSet;
  titles: string[];
  realm: Realm;
  description: string;
  personalityTraits: PersonalityTrait[];
  personality: string;
  appearance: string;
  holyItem: string;
  holySymbol: string;
  isAlive: boolean;

  constructor(
    name: string,
    species: Species,
    gender: Gender,
    ageCategory: AgeCategory,
    realm: Realm,
    domains: DomainSet,
  ) {
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
    this.holyItem = "";
    this.holySymbol = "";
    this.isAlive = true;
  }

  describe(): string {
    const speciesAdj = this.species.adjective;
    const subjectivePronoun = this.gender.subjectivePronoun;
    let noun = "god";
    const domainNames = [];

    domainNames.push(this.domains.primary.name);

    for (let i = 0; i < this.domains.secondaries.length; i++) {
      domainNames.push(this.domains.secondaries[i].name);
    }

    if (this.gender.name === "female") {
      noun = "goddess";
    }

    let description = `${this.name} appears as ${Words.article(speciesAdj)} ${speciesAdj} ${this.ageCategory.noun}.`;
    description += ` ${Words.capitalize(subjectivePronoun)} has ${this.appearance}. ${this.personality}.`;
    description += ` ${this.name} is the ${noun} of ${Words.arrayToPhrase(domainNames)}.`;
    description += ` ${Words.capitalize(subjectivePronoun)} resides in ${
      Words.uncapitalize(
        this.realm.name,
      )
    }.`;

    return description;
  }
}
