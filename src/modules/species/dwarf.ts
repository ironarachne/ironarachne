"use strict";

import * as AgeCategories from "../age/agecategories";
import {Gender} from "../gender";
import SpeciesAppearanceTrait from "./appearancetrait";
import Species from "./species";

export default new Species(
  "dwarf",
  "dwarves",
  "dwarven",
  20,
  [
    new SpeciesAppearanceTrait(
      "hair color",
      "{name} hair",
      [
        "dark",
        "black",
        "russet",
        "brown",
        "red",
      ],
    ),
    new SpeciesAppearanceTrait(
      "skin color",
      "{name} skin",
      [
        "tan",
        "bronzed",
        "ruddy",
      ],
    ),
    new SpeciesAppearanceTrait(
      "eye color",
      "{name} eyes",
      [
        "green",
        "brown",
        "dark",
        "amber",
      ],
    ),
  ],
  [
    new Gender("female", "she", "her", "her", "woman", "girl", 300, AgeCategories.getHumanVariant(3, 0.9, 0.7)),
    new Gender("male", "he", "him", "his", "man", "boy", 300, AgeCategories.getHumanVariant(3, 1, 0.8)),
  ],
);
