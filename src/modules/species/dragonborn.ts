"use strict";

import * as AgeCategories from "../age/agecategories";
import Gender from "../gender";
import Species from "./species";
import SpeciesAppearanceTrait from "./appearancetrait";

export default new Species(
  "dragonborn",
  "dragonborn",
  "dragonborn",
  10,
  [
    new SpeciesAppearanceTrait(
      "scale color",
      "{name} scales",
      [
        "amethyst",
        "black",
        "blue",
        "brass",
        "bronze",
        "copper",
        "crystal",
        "emerald",
        "gold",
        "green",
        "red",
        "sapphire",
        "silver",
        "topaz",
        "white",
      ],
    ),
    new SpeciesAppearanceTrait(
      "tail type",
      "{name} tail",
      [
        "no",
        "short",
        "long",
        "spiked",
        "thick",
      ],
    ),
    new SpeciesAppearanceTrait(
      "eye color",
      "{name} eyes",
      [
        "amber",
        "blue",
        "dark",
        "green",
        "orange",
        "red",
        "turquoise",
        "white",
        "yellow",
      ],
    ),
  ],
  [
    new Gender("female", "she", "her", "her", 80, AgeCategories.getHumanVariant(0.8, 1.5, 1.05, "female")),
    new Gender("male", "he", "him", "his", 80, AgeCategories.getHumanVariant(0.8, 1.7, 1.1, "male")),
  ],
);
