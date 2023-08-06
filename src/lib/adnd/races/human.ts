"use strict";

import ADNDCharacter from "../adndcharacter.js";
import ADNDRace from "../adndrace.js";

export default new ADNDRace(
  "human",
  "human",
  function(character: ADNDCharacter): ADNDCharacter {
    return character;
  },
  1,
  25,
  1,
  25,
  1,
  25,
  1,
  25,
  1,
  25,
  1,
  25,
  60,
  59,
  140,
  100,
  "2d10",
  "6d10",
  15,
  12,
  "1d4",
  [
    "common",
    "dwarf",
    "elf",
    "gnome",
    "halfling",
    "goblin",
    "hobgoblin",
    "gnoll",
    "orc",
    "giant",
    "kobold",
  ],
  [
    "bard",
    "cleric",
    "druid",
    "fighter",
    "illusionist",
    "mage",
    "paladin",
    "ranger",
    "specialist wizard",
    "thief",
  ],
);
