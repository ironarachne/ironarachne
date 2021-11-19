"use strict";

import * as AgeCategories from "../age/agecategories";
import {Gender} from "../gender";
import Species from "./species";
import SpeciesAppearanceTrait from "./appearancetrait";

export default new Species(
  "half-elf",
  "half-elves",
  "half-elf",
  15,
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
      ],
    ),
  ],
  [
    new Gender("female", "she", "her", "her", "woman", "girl", 185, AgeCategories.getHumanVariant(1.85, 0.9, 0.95)),
    new Gender("male", "he", "him", "his", "man", "boy", 185, AgeCategories.getHumanVariant(1.85, 0.9, 0.95)),
  ],
);
