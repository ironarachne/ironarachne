"use strict";

import AgeCategory from "../age/agecategory";
import Gender from "../gender";
import Title from "./title";
import Species from "../species/species";
import { Heraldry } from "../heraldry/heraldry";
import PhysicalTrait from "../physicaltraits/physicaltrait";
import PersonalityTrait from "./personality/personalitytrait";

export default class Character {
  titles: Title[];
  heraldry: Heraldry|null;
  species: Species;
  description: string;
  gender: Gender;
  age: number;
  ageCategory: AgeCategory;
  height: number;
  weight: number;
  traits: string[];
  personalityTraits: PersonalityTrait[];
  physicalTraits: PhysicalTrait[];
  firstName: string;
  lastName: string;
  status: string;

  constructor(species: Species) {
    this.titles = [];
    this.heraldry = null;
    this.species = species;
    this.description = "";
    this.age = 0;
    this.height = 0;
    this.weight = 0;
    this.traits = [];
    this.physicalTraits = [];
    this.firstName = "";
    this.lastName = "";
    this.status = "alive";
  }

  getPrimaryTitle() {
    let highestPrecedence = 100;
    let primaryTitle = null;

    for (let i = 0; i < this.titles.length; i++) {
      if (this.titles[i].precedence < highestPrecedence) {
        highestPrecedence = this.titles[i].precedence;

        primaryTitle = this.titles[i];
      }
    }

    if (primaryTitle == null) {
      return "";
    }

    return primaryTitle.getTitle(this.gender.name);
  }
}
