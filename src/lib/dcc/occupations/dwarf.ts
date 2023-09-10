import DCCCharacter from "../character.js";
import DCCGear from "../equipment/gear.js";
import DCCWeapon from "../equipment/weapon.js";
import DCCOccupation from "../occupation.js";

export function all(): DCCOccupation[] {
  return [
    new DCCOccupation(
      "dwarven apothecarist",
      new DCCWeapon("cudgel", "staff", "melee", "1d4", 50),
      new DCCGear("steel vial", 1),
      1,
      function(character: DCCCharacter): DCCCharacter {
        character.specialRules.push("Infravision");
        character.speed = 20;
        character.languages.push("Dwarf");
        return character;
      },
    ),
    new DCCOccupation(
      "dwarven blacksmith",
      new DCCWeapon("hammer", "club", "melee", "1d4", 50),
      new DCCGear("mithril, 1 oz.", 1),
      1,
      function(character: DCCCharacter): DCCCharacter {
        character.specialRules.push("Infravision");
        character.speed = 20;
        character.languages.push("Dwarf");
        return character;
      },
    ),
    new DCCOccupation(
      "dwarven chest-maker",
      new DCCWeapon("chisel", "dagger", "10/20/30", "1d4/1d10", 50),
      new DCCGear("wood, 10 lbs.", 1),
      1,
      function(character: DCCCharacter): DCCCharacter {
        character.specialRules.push("Infravision");
        character.speed = 20;
        character.languages.push("Dwarf");
        return character;
      },
    ),
    new DCCOccupation(
      "dwarven herder",
      new DCCWeapon("staff", "staff", "melee", "1d4", 50),
      new DCCGear("sow", 1),
      1,
      function(character: DCCCharacter): DCCCharacter {
        character.specialRules.push("Infravision");
        character.speed = 20;
        character.languages.push("Dwarf");
        return character;
      },
    ),
    new DCCOccupation(
      "dwarven miner",
      new DCCWeapon("pick", "club", "melee", "1d4", 50),
      new DCCGear("lantern", 1),
      2,
      function(character: DCCCharacter): DCCCharacter {
        character.specialRules.push("Infravision");
        character.speed = 20;
        character.languages.push("Dwarf");
        return character;
      },
    ),
    new DCCOccupation(
      "dwarven mushroom-farmer",
      new DCCWeapon("shovel", "staff", "melee", "1d4", 50),
      new DCCGear("sack", 1),
      1,
      function(character: DCCCharacter): DCCCharacter {
        character.specialRules.push("Infravision");
        character.speed = 20;
        character.languages.push("Dwarf");
        return character;
      },
    ),
    new DCCOccupation(
      "dwarven rat-catcher",
      new DCCWeapon("club", "club", "melee", "1d4", 50),
      new DCCGear("net", 1),
      1,
      function(character: DCCCharacter): DCCCharacter {
        character.specialRules.push("Infravision");
        character.speed = 20;
        character.languages.push("Dwarf");
        return character;
      },
    ),
    new DCCOccupation(
      "dwarven stonemason",
      new DCCWeapon("hammer", "club", "melee", "1d4", 50),
      new DCCGear("fine stone, 10 lbs.", 1),
      2,
      function(character: DCCCharacter): DCCCharacter {
        character.specialRules.push("Infravision");
        character.speed = 20;
        character.languages.push("Dwarf");
        return character;
      },
    ),
  ];
}
