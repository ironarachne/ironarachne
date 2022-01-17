"use strict";

import * as AgeCategories from "../age/agecategories";
import Gender from "../gender";
import Species from "./species";
import PhysicalTraitGenerator from "../physicaltraits/generator";

export default class HalfOrc implements Species {
  name: string;
  pluralName: string;
  adjective: string;
  commonality: number;
  physicalTraitGenerators: PhysicalTraitGenerator[];
  genders: Gender[];

  constructor() {
    this.name = "half-orc";
    this.pluralName = "half-orcs";
    this.adjective = "half-orc";
    this.commonality = 10;
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
          "green",
          "grey",
          "light",
          "olive",
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
      )
    ];
    this.genders = [
      new Gender("female", "she", "her", "her", 80, AgeCategories.getHumanVariant(0.8, 0.85, 0.9, "female")),
      new Gender("male", "he", "him", "his", 80, AgeCategories.getHumanVariant(0.8, 0.9, 0.95, "male")),
    ];
  }
}

