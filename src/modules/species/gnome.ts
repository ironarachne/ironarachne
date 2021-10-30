"use strict";

import * as Age from "../age";
import {Gender} from "../gender";
import * as Species from "./common";

export default new Species.Species(
  "gnome",
  "gnomes",
  "gnome",
  20,
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
    new Gender("female", "she", "her", "her", "woman", "girl", 500, Age.getHumanVariant(5, 0.4, 0.4)),
    new Gender("male", "he", "him", "his", "man", "boy", 500, Age.getHumanVariant(5, 0.5, 0.5)),
  ],
);
