"use strict";

import AgeCategory from "$lib/age/agecategory.js";
import type PersonalityTrait from "$lib/characters/personality/personalitytrait.js";
import Gender from "$lib/gender/gender.js";
import Human from "$lib/species/human.js";
import type Species from "$lib/species/species.js";
import * as Words from "@ironarachne/words";
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

  constructor() {
    this.name = "";
    this.species = new Human();
    this.gender = new Gender();
    this.ageCategory = new AgeCategory();
    this.domains = new DomainSet();
    this.titles = [];
    this.realm = new Realm();
    this.description = "";
    this.personality = "";
    this.personalityTraits = [];
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
