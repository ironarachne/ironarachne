"use strict";

import ADNDCharacter from "../adndcharacter.js";
import ADNDRace from "../adndrace.js";

export default new ADNDRace(
  "elf",
  "elven",
  function(character: ADNDCharacter): ADNDCharacter {
    character.dexterity += 1;
    character.constitution -= 1;
    // TODO: address special abilities
    character.abilities.push("90% resistance to sleep spell and all charm-related spells");
    character.abilities.push("+1 to hit with all bows other than crossbow");
    character.abilities.push("+1 to hit with short or long swords");
    character.abilities.push("Infravision (60')");
    character.abilities.push("Notice secret door with 1 on 1d6 when passing within 10 feet");
    character.abilities.push("Find secret door when actively searching with 1-2 on 1d6");
    character.abilities.push("Find concealed portal when actively searching with 1-3 on 1d6");
    character.abilities.push(
      "When not wearing metal armor, and either alone or with other elves/halflings not in metal armor, gain a bonus to surprise opponents. Those opponents have a -4 penalty to their surprise die rolls, or a -2 penalty if the elf has to open a door or screen to attack.",
    );
    return character;
  },
  3,
  18,
  6,
  18,
  7,
  18,
  8,
  18,
  3,
  18,
  3,
  18,
  55,
  50,
  90,
  70,
  "1d10",
  "3d10",
  100,
  12,
  "5d6",
  ["common", "elf", "gnome", "halfling", "goblin", "hobgoblin", "gnoll", "orc"],
  ["cleric", "fighter", "mage", "ranger", "thief"],
);
