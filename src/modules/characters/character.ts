"use strict";

import * as Age from "../age";
import * as Gender from "../gender";
import Title from "./title";
import {Species} from "../species/common";

export default class Character {
  titles: Title[];
  species: Species;
  description: string;
  gender: Gender.Gender;
  age: number;
  ageCategory: Age.AgeCategory;
  height: number;
  weight: number;
  traits: string[];
  firstName: string;
  lastName: string;

  constructor(species: Species) {
    this.titles = [];
    this.species = species;
    this.description = "";
    this.age = 0;
    this.height = 0;
    this.weight = 0;
    this.traits = [];
    this.firstName = "";
    this.lastName = "";
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
