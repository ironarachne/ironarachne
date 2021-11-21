"use strict";

import * as AgeCategories from "../age/agecategories";
import Gender from "../gender";
import Species from "./species";
import SpeciesAppearanceTrait from "./appearancetrait";

export default new Species(
  "human",
  "humans",
  "human",
  200,
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
        "black",
        "ebony",
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
    new Gender("female", "she", "her", "her", "woman", "girl", 100, AgeCategories.humanStandardFemale()),
    new Gender("male", "he", "him", "his", "man", "boy", 100, AgeCategories.humanStandardMale()),
  ],
);
