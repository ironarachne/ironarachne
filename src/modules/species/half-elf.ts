"use strict";

import * as Age from "../age";
import {Gender} from "../gender";
import * as Species from "./common";

export default new Species.Species(
  "half-elf",
  "half-elves",
  "half-elf",
  15,
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
      ],
    ),
  ],
  [
    new Gender("female", "she", "her", "her", "woman", "girl", 185, Age.getHumanVariant(1.85, 0.9, 0.95)),
    new Gender("male", "he", "him", "his", "man", "boy", 185, Age.getHumanVariant(1.85, 0.9, 0.95)),
  ],
);
