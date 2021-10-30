"use strict";

import * as Age from "../age";
import {Gender} from "../gender";
import * as Species from "./common";

export default new Species.Species(
  "human",
  "humans",
  "human",
  200,
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
    new Gender("female", "she", "her", "her", "woman", "girl", 100, Age.humanStandardFemale()),
    new Gender("male", "he", "him", "his", "man", "boy", 100, Age.humanStandardMale()),
  ],
);
