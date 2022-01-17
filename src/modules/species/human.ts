"use strict";

import * as AgeCategories from "../age/agecategories";
import Gender from "../gender";
import Species from "./species";
import PhysicalTraitGenerator from "../physicaltraits/generator";

export default class Human implements Species {
  name: string;
  pluralName: string;
  adjective: string;
  commonality: number;
  physicalTraitGenerators: PhysicalTraitGenerator[];
  genders: Gender[];

  constructor() {
    this.name = "human";
    this.pluralName = "humans";
    this.adjective = "human";
    this.commonality = 200;
    this.physicalTraitGenerators = [
      new PhysicalTraitGenerator(
        "hair",
        "hair",
        [
          "black",
          "blonde",
          "brown",
          "dark",
          "light",
          "red",
          "russet",
        ],
        ["hair"]
      ),
      new PhysicalTraitGenerator(
        "skin",
        "skin",
        [
          "black",
          "bronzed",
          "ebony",
          "light",
          "pale",
          "tan",
          "white",
        ],
        ["skin"]
      ),
      new PhysicalTraitGenerator(
        "eyes",
        "eyes",
        [
          "amber",
          "blue",
          "brown",
          "dark",
          "green",
        ],
        ["eyes"]
      ),
    ];
    this.genders = [
      new Gender("female", "she", "her", "her", 100, AgeCategories.humanStandardFemale()),
      new Gender("male", "he", "him", "his", 100, AgeCategories.humanStandardMale()),
    ];
  }
}

