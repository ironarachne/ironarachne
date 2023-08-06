"use strict";

import DCCCharacter from "../character.js";
import DCCGear from "../equipment/gear.js";
import DCCWeapon from "../equipment/weapon.js";
import DCCOccupation from "../occupation.js";

export function all(): DCCOccupation[] {
  return [
    new DCCOccupation(
      "elven artisan",
      new DCCWeapon("staff", "staff", "melee", "1d4", 50),
      new DCCGear("clay, 1 lb.", 1),
      1,
      function(character: DCCCharacter): DCCCharacter {
        character.specialRules.push("Sensitive to iron");
        character.specialRules.push("Heightened senses");
        character.languages.push("Elf");
        return character;
      },
    ),
    new DCCOccupation(
      "elven barrister",
      new DCCWeapon("quill", "dart", "20/40/60", "1d4", 50),
      new DCCGear("book", 1),
      1,
      function(character: DCCCharacter): DCCCharacter {
        character.specialRules.push("Sensitive to iron");
        character.specialRules.push("Heightened senses");
        character.languages.push("Elf");
        return character;
      },
    ),
    new DCCOccupation(
      "elven chandler",
      new DCCWeapon("scissors", "dagger", "10/20/30", "1d4/1d10", 50),
      new DCCGear("candles, 20", 1),
      1,
      function(character: DCCCharacter): DCCCharacter {
        character.specialRules.push("Sensitive to iron");
        character.specialRules.push("Heightened senses");
        character.languages.push("Elf");
        return character;
      },
    ),
    new DCCOccupation(
      "elven falconer",
      new DCCWeapon("dagger", "dagger", "10/20/30", "1d4/1d10", 50),
      new DCCGear("falcon", 1),
      1,
      function(character: DCCCharacter): DCCCharacter {
        character.specialRules.push("Sensitive to iron");
        character.specialRules.push("Heightened senses");
        character.languages.push("Elf");
        return character;
      },
    ),
    new DCCOccupation(
      "elven forester",
      new DCCWeapon("staff", "staff", "melee", "1d4", 50),
      new DCCGear("herbs, 1 lb.", 1),
      2,
      function(character: DCCCharacter): DCCCharacter {
        character.specialRules.push("Sensitive to iron");
        character.specialRules.push("Heightened senses");
        character.languages.push("Elf");
        return character;
      },
    ),
    new DCCOccupation(
      "elven glassblower",
      new DCCWeapon("hammer", "club", "melee", "1d4", 50),
      new DCCGear("glass beads", 1),
      1,
      function(character: DCCCharacter): DCCCharacter {
        character.specialRules.push("Sensitive to iron");
        character.specialRules.push("Heightened senses");
        character.languages.push("Elf");
        return character;
      },
    ),
    new DCCOccupation(
      "elven navigator",
      new DCCWeapon("shortbow", "shortbow", "50/100/150", "1d6", 50),
      new DCCGear("spyglass", 1),
      1,
      function(character: DCCCharacter): DCCCharacter {
        character.specialRules.push("Sensitive to iron");
        character.specialRules.push("Heightened senses");
        character.languages.push("Elf");
        return character;
      },
    ),
    new DCCOccupation(
      "elven sage",
      new DCCWeapon("dagger", "dagger", "10/20/30", "1d4/1d10", 50),
      new DCCGear("parchment and quill pen", 1),
      2,
      function(character: DCCCharacter): DCCCharacter {
        character.specialRules.push("Sensitive to iron");
        character.specialRules.push("Heightened senses");
        character.languages.push("Elf");
        return character;
      },
    ),
  ];
}
