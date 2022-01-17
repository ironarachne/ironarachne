"use strict";

import * as AgeCategories from "../age/agecategories";
import Gender from "../gender";
import Species from "./species";
import PhysicalTraitGenerator from "../physicaltraits/generator";

export default class Gnome implements Species {
  name: string;
  pluralName: string;
  adjective: string;
  commonality: number;
  physicalTraitGenerators: PhysicalTraitGenerator[];
  genders: Gender[];

  constructor() {
    this.name = "gnome";
    this.pluralName = "gnomes";
    this.adjective = "gnomish";
    this.commonality = 20;
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
      new Gender("female", "she", "her", "her", 500, AgeCategories.getHumanVariant(5, 0.4, 0.4, "female")),
      new Gender("male", "he", "him", "his", 500, AgeCategories.getHumanVariant(5, 0.5, 0.5, "male")),
    ];
  }
}
