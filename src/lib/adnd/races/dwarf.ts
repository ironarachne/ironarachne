"use strict";

import ADNDCharacter from "../adndcharacter.js";
import ADNDRace from "../adndrace.js";

export default new ADNDRace(
  "dwarf",
  "dwarven",
  function(character: ADNDCharacter): ADNDCharacter {
    character.constitution += 1;
    character.charisma -= 1;
    // TODO: address saving throws
    character.abilities.push("20% chance of magical item malfunction");
    character.abilities.push("+1 to hit orcs, half-orcs, goblins, and hobgoblins");
    character.abilities.push(
      "-4 to attack rolls made on the character by ogres, trolls, ogre magi, giants, and titans",
    );
    character.abilities.push("Infravision (60')");
    character.abilities.push("Within 10', detect grade or slope in passage with 1-5 on 1d6");
    character.abilities.push("Within 10', detect new tunnel/passage construction with 1-5 on 1d6");
    character.abilities.push("Within 10', detect sliding/shifting walls or rooms with 1-4 on 1d6");
    character.abilities.push(
      "Within 10', detect stonework traps, pits, and deadfalls with 1-3 on 1d6",
    );
    character.abilities.push("Within 10', determine approximate depth underground with 1-3 on 1d6");
    return character;
  },
  8,
  18,
  3,
  17,
  11,
  18,
  3,
  18,
  3,
  18,
  3,
  17,
  43,
  41,
  130,
  105,
  "1d10",
  "4d10",
  40,
  6,
  "5d6",
  ["common", "dwarf", "gnome", "goblin", "kobold", "orc"],
  ["cleric", "fighter", "thief"],
);
