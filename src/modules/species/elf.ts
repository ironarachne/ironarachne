"use strict";

import * as AgeCategories from "../age/agecategories";
import Gender from "../gender";
import Species from "./species";
import PhysicalTraitGenerator from "../physicaltraits/generator";

export default class Elf implements Species {
  name: string;
  pluralName: string;
  adjective: string;
  commonality: number;
  physicalTraitGenerators: PhysicalTraitGenerator[];
  genders: Gender[];

  constructor() {
    this.name = "elf";
    this.pluralName = "elves";
    this.adjective = "elven";
    this.commonality = 30;
    this.physicalTraitGenerators = [
      new PhysicalTraitGenerator(
        "hair", "hair",
        [
          "black",
          "blonde",
          "brown",
          "dark",
          "light",
          "red",
          "russet",
        ], ["hair"]
      ),
      new PhysicalTraitGenerator(
        "skin",
        "skin",
        [
          "tan",
          "light",
          "bronzed",
          "white",
          "pale",
        ],
        ["skin"]
      ),
      new PhysicalTraitGenerator(
        "eyes",
        "eyes",
        [
          "blue",
          "green",
          "brown",
          "dark",
          "amber",
          "grey",
        ],
        ["eyes"]
      )
    ];
    this.genders = [
      new Gender("female", "she", "her", "her", 700, AgeCategories.getHumanVariant(7, 0.6, 0.9, "female")),
      new Gender("male", "he", "him", "his", 700, AgeCategories.getHumanVariant(7, 0.6, 0.95, "male")),
    ];
  }
}
