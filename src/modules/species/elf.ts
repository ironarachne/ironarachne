"use strict";

import * as Age from "../age";
import {Gender} from "../gender";
import * as Species from "./common";

export default new Species.Species(
  "elf",
  "elves",
  "elven",
  30,
  [
    new Species.AppearanceTrait(
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
    new Species.AppearanceTrait(
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
    new Species.AppearanceTrait(
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
    new Gender("female", "she", "her", "her", "woman", "girl", 700, Age.getHumanVariant(7, 0.6, 0.9)),
    new Gender("male", "he", "him", "his", "man", "boy", 700, Age.getHumanVariant(7, 0.6, 0.95)),
  ],
);
