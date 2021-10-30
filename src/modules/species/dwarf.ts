"use strict";

import * as Age from "../age";
import {Gender} from "../gender";
import * as Species from "./common";

export default new Species.Species(
  "dwarf",
  "dwarves",
  "dwarven",
  20,
  [
    new Species.AppearanceTrait(
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
    new Species.AppearanceTrait(
      "skin color",
      "{name} skin",
      [
        "tan",
        "bronzed",
        "ruddy",
      ],
    ),
    new Species.AppearanceTrait(
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
    new Gender("female", "she", "her", "her", "woman", "girl", 300, Age.getHumanVariant(3, 0.9, 0.7)),
    new Gender("male", "he", "him", "his", "man", "boy", 300, Age.getHumanVariant(3, 1, 0.8)),
  ],
);
