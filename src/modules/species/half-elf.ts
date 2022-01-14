"use strict";

import * as AgeCategories from "../age/agecategories";
import Gender from "../gender";
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
    new Gender("female", "she", "her", "her", 185, AgeCategories.getHumanVariant(1.85, 0.9, 0.95, "female")),
    new Gender("male", "he", "him", "his", 185, AgeCategories.getHumanVariant(1.85, 0.9, 0.95, "male")),
  ],
);
