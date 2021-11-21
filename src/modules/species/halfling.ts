"use strict";

import * as AgeCategories from "../age/agecategories";
import Gender from "../gender";
import Species from "./species";
import SpeciesAppearanceTrait from "./appearancetrait";

export default new Species(
  "halfling",
  "halflings",
  "halfling",
  20,
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
    new Gender("female", "she", "her", "her", "woman", "girl", 150, AgeCategories.getHumanVariant(1.5, 0.5, 0.6)),
    new Gender("male", "he", "him", "his", "man", "boy", 150, AgeCategories.getHumanVariant(1.5, 0.5, 0.6)),
  ],
);
