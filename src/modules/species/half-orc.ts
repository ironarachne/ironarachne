"use strict";

import * as Age from "../age";
import {Gender} from "../gender";
import * as Species from "./common";

export default new Species.Species(
  "half-orc",
  "half-orcs",
  "half-orc",
  10,
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
    new Gender("female", "she", "her", "her", "woman", "girl", 80, Age.getHumanVariant(0.8, 0.85, 0.9)),
    new Gender("male", "he", "him", "his", "man", "boy", 80, Age.getHumanVariant(0.8, 0.9, 0.95)),
  ],
);
