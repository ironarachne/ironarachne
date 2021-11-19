"use strict";

import * as AgeCategories from "../age/agecategories";
import {Gender} from "../gender";
import Species from "./species";
import SpeciesAppearanceTrait from "./appearancetrait";

export default new Species(
  "half-orc",
  "half-orcs",
  "half-orc",
  10,
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
        "grey",
        "green",
        "olive",
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
    new Gender("female", "she", "her", "her", "woman", "girl", 80, AgeCategories.getHumanVariant(0.8, 0.85, 0.9)),
    new Gender("male", "he", "him", "his", "man", "boy", 80, AgeCategories.getHumanVariant(0.8, 0.9, 0.95)),
  ],
);
