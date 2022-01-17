"use strict";

import * as AgeCategories from "../age/agecategories";
import Gender from "../gender";
import Species from "./species";
import PhysicalTraitGenerator from "../physicaltraits/generator";

export default class HalfElf implements Species {
  name: string;
  pluralName: string;
  adjective: string;
  commonality: number;
  physicalTraitGenerators: PhysicalTraitGenerator[];
  genders: Gender[];

  constructor() {
    this.name = "half-elf";
    this.pluralName = "half-elves";
    this.adjective = "half-elven";
    this.commonality = 15;
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
          "bronzed",
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
      new Gender("female", "she", "her", "her", 185, AgeCategories.getHumanVariant(1.85, 0.9, 0.95, "female")),
      new Gender("male", "he", "him", "his", 185, AgeCategories.getHumanVariant(1.85, 0.9, 0.95, "male")),
    ];
  }
}
