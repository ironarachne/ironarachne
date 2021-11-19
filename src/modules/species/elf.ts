"use strict";

import * as AgeCategories from "../age/agecategories";
import {Gender} from "../gender";
import Species from "./species";
import SpeciesAppearanceTrait from "./appearancetrait";

export default new Species(
  "elf",
  "elves",
  "elven",
  30,
  [
    new SpeciesAppearanceTrait(
      "hair color",
      "{name} hair",
      [
        "blonde",
        "dark",
        "black",
        "russet",
        "light",
        "brown",
        "red",
      ],
    ),
    new SpeciesAppearanceTrait(
      "skin color",
      "{name} skin",
      [
        "tan",
        "light",
        "bronzed",
        "white",
        "pale",
      ],
    ),
    new SpeciesAppearanceTrait(
      "eye color",
      "{name} eyes",
      [
        "blue",
        "green",
        "brown",
        "dark",
        "amber",
        "grey",
      ],
    ),
  ],
  [
    new Gender("female", "she", "her", "her", "woman", "girl", 700, AgeCategories.getHumanVariant(7, 0.6, 0.9)),
    new Gender("male", "he", "him", "his", "man", "boy", 700, AgeCategories.getHumanVariant(7, 0.6, 0.95)),
  ],
);
