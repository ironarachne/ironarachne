"use strict";

import DCCCharacter from "./character";
import DCCGear from "./equipment/gear";
import DCCWeapon from "./equipment/weapon";
import DCCOccupation from "./occupation";

export function all(): DCCOccupation[] {
  return [
    new DCCOccupation(
      "alchemist",
      new DCCWeapon("staff", "staff", "melee", "1d4", 50),
      new DCCGear("oil, 1 flask", 5),
      1,
      function(character: DCCCharacter): DCCCharacter {
        return character;
      }
    ),
    new DCCOccupation(
      "animal trainer",
      new DCCWeapon("club", "club", "melee", "1d4", 50),
      new DCCGear("pony", 1),
      1,
      function(character: DCCCharacter): DCCCharacter {
        return character;
      }
    ),
    new DCCOccupation(
      "armorer",
      new DCCWeapon("hammer", "club", "melee", "1d4", 50),
      new DCCGear("iron helmet", 1),
      1,
      function(character: DCCCharacter): DCCCharacter {
        return character;
      }
    ),
    new DCCOccupation(
      "astrologer",
      new DCCWeapon("dagger", "dagger", "10/20/30", "1d4/1d10", 50),
      new DCCGear("spyglass", 1),
      1,
      function(character: DCCCharacter): DCCCharacter {
        return character;
      }
    ),
    new DCCOccupation(
      "baker",
      new DCCWeapon("rolling pin", "club", "melee", "1d4", 50),
      new DCCGear("flour, 1 lb.", 1),
      1,
      function(character: DCCCharacter): DCCCharacter {
        return character;
      }
    ),
    new DCCOccupation(
      "barber",
      new DCCWeapon("razor", "dagger", "10/20/30", "1d4/1d10", 50),
      new DCCGear("scissors", 1),
      1,
      function(character: DCCCharacter): DCCCharacter {
        return character;
      }
    ),
    new DCCOccupation(
      "beadle",
      new DCCWeapon("staff", "staff", "melee", "1d4", 50),
      new DCCGear("holy symbol", 1),
      1,
      function(character: DCCCharacter): DCCCharacter {
        return character;
      }
    ),
    new DCCOccupation(
      "beekeeper",
      new DCCWeapon("staff", "staff", "melee", "1d4", 50),
      new DCCGear("jar of honey", 1),
      1,
      function(character: DCCCharacter): DCCCharacter {
        return character;
      }
    ),
    new DCCOccupation(
      "blacksmith",
      new DCCWeapon("hammer", "club", "melee", "1d4", 50),
      new DCCGear("steel tongs", 1),
      1,
      function(character: DCCCharacter): DCCCharacter {
        return character;
      }
    ),
    new DCCOccupation(
      "bowyer",
      new DCCWeapon("shortbow", "shortbow", "50/100/150", "1d6", 50),
      new DCCGear("sinew, 10'", 1),
      1,
      function(character: DCCCharacter): DCCCharacter {
        return character;
      }
    ),
    new DCCOccupation(
      "butcher",
      new DCCWeapon("cleaver", "handaxe", "10/20/30", "1d6", 50),
      new DCCGear("side of beef", 1),
      1,
      function(character: DCCCharacter): DCCCharacter {
        return character;
      }
    ),
    new DCCOccupation(
      "brewer",
      new DCCWeapon("vat spoon", "staff", "melee", "1d4", 50),
      new DCCGear("barrel of ale", 1),
      1,
      function(character: DCCCharacter): DCCCharacter {
        return character;
      }
    ),
    new DCCOccupation(
      "caravan guard",
      new DCCWeapon("short sword", "short sword", "melee", "1d6", 50),
      new DCCGear("linen, 1 yard", 1),
      1,
      function(character: DCCCharacter): DCCCharacter {
        return character;
      }
    ),
    new DCCOccupation(
      "carpenter",
      new DCCWeapon("handaxe", "handaxe", "10/20/30", "1d6", 50),
      new DCCGear("pole, 10'", 1),
      1,
      function(character: DCCCharacter): DCCCharacter {
        return character;
      }
    ),
    new DCCOccupation(
      "cheesemaker",
      new DCCWeapon("cudgel", "staff", "melee", "1d4", 50),
      new DCCGear("stinky cheese", 1),
      1,
      function(character: DCCCharacter): DCCCharacter {
        return character;
      }
    ),
    new DCCOccupation(
      "cobbler",
      new DCCWeapon("awl", "dagger", "10/20/30", "1d4/1d10", 50),
      new DCCGear("shoehorn", 1),
      1,
      function(character: DCCCharacter): DCCCharacter {
        return character;
      }
    ),
    new DCCOccupation(
      "confidence artist",
      new DCCWeapon("dagger", "dagger", "10/20/30", "1d4/1d10", 50),
      new DCCGear("quality cloak", 1),
      1,
      function(character: DCCCharacter): DCCCharacter {
        return character;
      }
    ),
    new DCCOccupation(
      "cook",
      new DCCWeapon("staff", "staff", "melee", "1d4", 50),
      new DCCGear("spices, 1 lb.", 1),
      1,
      function(character: DCCCharacter): DCCCharacter {
        return character;
      }
    ),
    new DCCOccupation(
      "cooper",
      new DCCWeapon("crowbar", "club", "melee", "1d4", 50),
      new DCCGear("barrel", 1),
      1,
      function(character: DCCCharacter): DCCCharacter {
        return character;
      }
    ),
    new DCCOccupation(
      "costermonger",
      new DCCWeapon("knife", "dagger", "10/20/30", "1d4/1d10", 50),
      new DCCGear("fruit", 1),
      1,
      function(character: DCCCharacter): DCCCharacter {
        return character;
      }
    ),
    new DCCOccupation(
      "cutpurse",
      new DCCWeapon("dagger", "dagger", "10/20/30", "1d4/1d10", 50),
      new DCCGear("small chest", 1),
      1,
      function(character: DCCCharacter): DCCCharacter {
        return character;
      }
    ),
    new DCCOccupation(
      "ditch digger",
      new DCCWeapon("shovel", "staff", "melee", "1d4", 50),
      new DCCGear("fine dirt, 1 lb.", 1),
      1,
      function(character: DCCCharacter): DCCCharacter {
        return character;
      }
    ),
    new DCCOccupation(
      "dock worker",
      new DCCWeapon("pole", "staff", "melee", "1d4", 50),
      new DCCGear("1 late RPG book", 1),
      1,
      function(character: DCCCharacter): DCCCharacter {
        return character;
      }
    ),
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
      }
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
      }
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
      }
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
      }
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
      }
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
      }
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
      }
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
      }
    ),
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
      }
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
      }
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
      }
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
      }
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
      }
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
      }
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
      }
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
      }
    ),
    new DCCOccupation(
      "farmer",
      new DCCWeapon("pitchfork", "spear", "melee", "1d8", 50),
      new DCCGear("hen", 1),
      20,
      function(character: DCCCharacter): DCCCharacter {
        return character;
      }
    ),
    new DCCOccupation(
      "fisherman",
      new DCCWeapon("knife", "dagger", "10/20/30", "1d4/1d10", 50),
      new DCCGear("fishing pole", 1),
      1,
      function(character: DCCCharacter): DCCCharacter {
        return character;
      }
    ),
    new DCCOccupation(
      "fortune-teller",
      new DCCWeapon("dagger", "dagger", "10/20/30", "1d4/1d10", 50),
      new DCCGear("tarot deck", 1),
      1,
      function(character: DCCCharacter): DCCCharacter {
        return character;
      }
    ),
    new DCCOccupation(
      "farrier",
      new DCCWeapon("hammer", "club", "melee", "1d4", 50),
      new DCCGear("steel tongs", 1),
      1,
      function(character: DCCCharacter): DCCCharacter {
        return character;
      }
    ),
    new DCCOccupation(
      "furrier",
      new DCCWeapon("knife", "dagger", "10/20/30", "1d4/1d10", 50),
      new DCCGear("deer pelt", 1),
      1,
      function(character: DCCCharacter): DCCCharacter {
        return character;
      }
    ),
    new DCCOccupation(
      "gambler",
      new DCCWeapon("club", "club", "melee", "1d4", 50),
      new DCCGear("dice", 1),
      1,
      function(character: DCCCharacter): DCCCharacter {
        return character;
      }
    ),
    new DCCOccupation(
      "goatherd",
      new DCCWeapon("crook", "staff", "melee", "1d4", 50),
      new DCCGear("goat", 1),
      1,
      function(character: DCCCharacter): DCCCharacter {
        return character;
      }
    ),
    new DCCOccupation(
      "gongfarmer",
      new DCCWeapon("trowel", "dagger", "10/20/30", "1d4/1d10", 50),
      new DCCGear("sack of night soil", 1),
      1,
      function(character: DCCCharacter): DCCCharacter {
        return character;
      }
    ),
    new DCCOccupation(
      "gravedigger",
      new DCCWeapon("shovel", "staff", "melee", "1d4", 50),
      new DCCGear("trowel", 1),
      2,
      function(character: DCCCharacter): DCCCharacter {
        return character;
      }
    ),
    new DCCOccupation(
      "guild beggar",
      new DCCWeapon("sling", "sling", "40/80/160", "1d4", 50),
      new DCCGear("crutches", 1),
      2,
      function(character: DCCCharacter): DCCCharacter {
        return character;
      }
    ),
    new DCCOccupation(
      "halfling chicken butcher",
      new DCCWeapon("handaxe", "handaxe", "10/20/30", "1d6", 50),
      new DCCGear("chicken meat, 5 lbs.", 1),
      1,
      function(character: DCCCharacter): DCCCharacter {
        character.specialRules.push("Infravision");
        character.speed = 20;
        character.languages.push("Halfling");
        return character;
      }
    ),
    new DCCOccupation(
      "halfling dyer",
      new DCCWeapon("staff", "staff", "melee", "1d4", 50),
      new DCCGear("fabric, 3 yds.", 1),
      2,
      function(character: DCCCharacter): DCCCharacter {
        character.specialRules.push("Infravision");
        character.speed = 20;
        character.languages.push("Halfling");
        return character;
      }
    ),
    new DCCOccupation(
      "halfling glovemaker",
      new DCCWeapon("awl", "dagger", "10/20/30", "1d4/1d10", 50),
      new DCCGear("gloves, 4 pairs", 1),
      1,
      function(character: DCCCharacter): DCCCharacter {
        character.specialRules.push("Infravision");
        character.speed = 20;
        character.languages.push("Halfling");
        return character;
      }
    ),
    new DCCOccupation(
      "halfling witch doctor",
      new DCCWeapon("sling", "sling", "40/80/160", "1d4", 50),
      new DCCGear("hex doll", 1),
      1,
      function(character: DCCCharacter): DCCCharacter {
        character.specialRules.push("Infravision");
        character.speed = 20;
        character.languages.push("Halfling");
        return character;
      }
    ),
    new DCCOccupation(
      "halfling haberdasher",
      new DCCWeapon("scissors", "dagger", "10/20/30", "1d4/1d10", 50),
      new DCCGear("fine suits, 3 sets", 1),
      1,
      function(character: DCCCharacter): DCCCharacter {
        character.specialRules.push("Infravision");
        character.speed = 20;
        character.languages.push("Halfling");
        return character;
      }
    ),
    new DCCOccupation(
      "halfling mariner",
      new DCCWeapon("knife", "dagger", "10/20/30", "1d4/1d10", 50),
      new DCCGear("sailcloth, 2 yds.", 1),
      1,
      function(character: DCCCharacter): DCCCharacter {
        character.specialRules.push("Infravision");
        character.speed = 20;
        character.languages.push("Halfling");
        return character;
      }
    ),
    new DCCOccupation(
      "halfling moneylender",
      new DCCWeapon("short sword", "short sword", "melee", "1d6", 50),
      new DCCGear("loan chest", 1),
      1,
      function(character: DCCCharacter): DCCCharacter {
        character.specialRules.push("Infravision");
        character.speed = 20;
        character.languages.push("Halfling");
        character.currency.cp += 200;
        character.currency.sp += 10;
        character.currency.gp += 5;
        return character;
      }
    ),
    new DCCOccupation(
      "halfling trader",
      new DCCWeapon("short sword", "short sword", "melee", "1d6", 50),
      new DCCGear("coin purse", 1),
      1,
      function(character: DCCCharacter): DCCCharacter {
        character.specialRules.push("Infravision");
        character.speed = 20;
        character.languages.push("Halfling");
        character.currency.sp += 20;
        return character;
      }
    ),
    new DCCOccupation(
      "halfling vagrant",
      new DCCWeapon("club", "club", "melee", "1d4", 50),
      new DCCGear("begging bowl", 1),
      1,
      function(character: DCCCharacter): DCCCharacter {
        character.specialRules.push("Infravision");
        character.speed = 20;
        character.languages.push("Halfling");
        return character;
      }
    ),
    new DCCOccupation(
      "hatter",
      new DCCWeapon("scissors", "dagger", "10/20/30", "1d4/1d10", 50),
      new DCCGear("hat", 1),
      1,
      function(character: DCCCharacter): DCCCharacter {
        return character;
      }
    ),
    new DCCOccupation(
      "healer",
      new DCCWeapon("club", "club", "melee", "1d4", 50),
      new DCCGear("holy water", 1),
      1,
      function(character: DCCCharacter): DCCCharacter {
        return character;
      }
    ),
    new DCCOccupation(
      "herbalist",
      new DCCWeapon("club", "club", "melee", "1d4", 50),
      new DCCGear("herbs, 1 lb.", 1),
      1,
      function(character: DCCCharacter): DCCCharacter {
        return character;
      }
    ),
    new DCCOccupation(
      "herder",
      new DCCWeapon("staff", "staff", "melee", "1d4", 50),
      new DCCGear("herding dog", 1),
      1,
      function(character: DCCCharacter): DCCCharacter {
        return character;
      }
    ),
    new DCCOccupation(
      "hunter",
      new DCCWeapon("shortbow", "shortbow", "50/100/150", "1d6", 50),
      new DCCGear("deer pelt", 1),
      2,
      function(character: DCCCharacter): DCCCharacter {
        return character;
      }
    ),
    new DCCOccupation(
      "indentured servant",
      new DCCWeapon("staff", "staff", "melee", "1d4", 50),
      new DCCGear("locket", 1),
      1,
      function(character: DCCCharacter): DCCCharacter {
        return character;
      }
    ),
    new DCCOccupation(
      "innkeeper",
      new DCCWeapon("cudgel", "club", "melee", "1d4", 50),
      new DCCGear("coin purse", 1),
      1,
      function(character: DCCCharacter): DCCCharacter {
        character.currency.cp += 100;
        return character;
      }
    ),
    new DCCOccupation(
      "jester",
      new DCCWeapon("dart", "dart", "20/40/60", "1d4", 50),
      new DCCGear("silk clothes", 1),
      1,
      function(character: DCCCharacter): DCCCharacter {
        return character;
      }
    ),
    new DCCOccupation(
      "jeweller",
      new DCCWeapon("dagger", "dagger", "10/20/30", "1d4/1d10", 50),
      new DCCGear("gem worth 20 gp", 1),
      1,
      function(character: DCCCharacter): DCCCharacter {
        return character;
      }
    ),
    new DCCOccupation(
      "locksmith",
      new DCCWeapon("dagger", "dagger", "10/20/30", "1d4/1d10", 50),
      new DCCGear("fine tools", 1),
      1,
      function(character: DCCCharacter): DCCCharacter {
        return character;
      }
    ),
    new DCCOccupation(
      "mendicant",
      new DCCWeapon("club", "club", "melee", "1d4", 50),
      new DCCGear("cheese dip", 1),
      1,
      function(character: DCCCharacter): DCCCharacter {
        return character;
      }
    ),
    new DCCOccupation(
      "mercenary",
      new DCCWeapon("longsword", "longsword", "melee", "1d8", 50),
      new DCCGear("hide armor", 1),
      1,
      function(character: DCCCharacter): DCCCharacter {
        character.armorClass += 3;
        return character;
      }
    ),
    new DCCOccupation(
      "merchant",
      new DCCWeapon("dagger", "dagger", "10/20/30", "1d4/1d10", 50),
      new DCCGear("coin purse", 1),
      1,
      function(character: DCCCharacter): DCCCharacter {
        character.currency.cp += 27;
        character.currency.sp += 14;
        character.currency.gp += 4;
        return character;
      }
    ),
    new DCCOccupation(
      "miller",
      new DCCWeapon("club", "club", "melee", "1d4", 50),
      new DCCGear("flour, 1 lb.", 1),
      1,
      function(character: DCCCharacter): DCCCharacter {
        return character;
      }
    ),
    new DCCOccupation(
      "minstrel",
      new DCCWeapon("dagger", "dagger", "10/20/30", "1d4/1d10", 50),
      new DCCGear("ukelele", 1),
      1,
      function(character: DCCCharacter): DCCCharacter {
        return character;
      }
    ),
    new DCCOccupation(
      "noble",
      new DCCWeapon("longsword", "longsword", "melee", "1d8", 50),
      new DCCGear("gold ring worth 10 gp", 1),
      1,
      function(character: DCCCharacter): DCCCharacter {
        return character;
      }
    ),
    new DCCOccupation(
      "orphan",
      new DCCWeapon("club", "club", "melee", "1d4", 50),
      new DCCGear("rag doll", 1),
      1,
      function(character: DCCCharacter): DCCCharacter {
        return character;
      }
    ),
    new DCCOccupation(
      "ostler",
      new DCCWeapon("staff", "staff", "melee", "1d4", 50),
      new DCCGear("bridle", 1),
      1,
      function(character: DCCCharacter): DCCCharacter {
        return character;
      }
    ),
    new DCCOccupation(
      "outlaw",
      new DCCWeapon("short sword", "short sword", "melee", "1d6", 50),
      new DCCGear("leather armor", 1),
      1,
      function(character: DCCCharacter): DCCCharacter {
        character.armorClass += 2;
        return character;
      }
    ),
    new DCCOccupation(
      "potter",
      new DCCWeapon("awl", "dagger", "10/20/30", "1d4/1d10", 50),
      new DCCGear("potting clay, 5 lb.", 1),
      1,
      function(character: DCCCharacter): DCCCharacter {
        return character;
      }
    ),
    new DCCOccupation(
      "quarrier",
      new DCCWeapon("pickaxe", "short sword", "melee", "1d6", 50),
      new DCCGear("bag of stone chips", 1),
      1,
      function(character: DCCCharacter): DCCCharacter {
        return character;
      }
    ),
    new DCCOccupation(
      "rope maker",
      new DCCWeapon("knife", "dagger", "10/20/30", "1d4/1d10", 50),
      new DCCGear("rope, 100'", 1),
      1,
      function(character: DCCCharacter): DCCCharacter {
        return character;
      }
    ),
    new DCCOccupation(
      "rugmaker",
      new DCCWeapon("scissors", "dagger", "10/20/30", "1d4/1d10", 50),
      new DCCGear("small rug", 1),
      1,
      function(character: DCCCharacter): DCCCharacter {
        return character;
      }
    ),
    new DCCOccupation(
      "sailor",
      new DCCWeapon("knife", "dagger", "10/20/30", "1d4/1d10", 50),
      new DCCGear("rope, 50'", 1),
      1,
      function(character: DCCCharacter): DCCCharacter {
        return character;
      }
    ),
    new DCCOccupation(
      "scribe",
      new DCCWeapon("dart", "dart", "20/40/60", "1d4", 50),
      new DCCGear("parchment, 100 sheets", 1),
      1,
      function(character: DCCCharacter): DCCCharacter {
        return character;
      }
    ),
    new DCCOccupation(
      "shaman",
      new DCCWeapon("mace", "mace", "melee", "1d6", 50),
      new DCCGear("herbs, 1 lb.", 1),
      1,
      function(character: DCCCharacter): DCCCharacter {
        return character;
      }
    ),
    new DCCOccupation(
      "shepherd",
      new DCCWeapon("crook", "staff", "melee", "1d4", 50),
      new DCCGear("sheep", 1),
      1,
      function(character: DCCCharacter): DCCCharacter {
        return character;
      }
    ),
    new DCCOccupation(
      "slave",
      new DCCWeapon("club", "club", "melee", "1d4", 50),
      new DCCGear("strange-looking rock", 1),
      1,
      function(character: DCCCharacter): DCCCharacter {
        return character;
      }
    ),
    new DCCOccupation(
      "smuggler",
      new DCCWeapon("sling", "sling", "40/80/160", "1d4", 50),
      new DCCGear("waterproof sack", 1),
      1,
      function(character: DCCCharacter): DCCCharacter {
        return character;
      }
    ),
    new DCCOccupation(
      "soldier",
      new DCCWeapon("spear", "spear", "melee", "1d8", 50),
      new DCCGear("shield", 1),
      1,
      function(character: DCCCharacter): DCCCharacter {
        character.armorClass += 1;
        return character;
      }
    ),
    new DCCOccupation(
      "squire",
      new DCCWeapon("longsword", "longsword", "melee", "1d8", 50),
      new DCCGear("steel helmet", 1),
      2,
      function(character: DCCCharacter): DCCCharacter {
        return character;
      }
    ),
    new DCCOccupation(
      "stablemaster",
      new DCCWeapon("pitchfork", "spear", "melee", "1d8", 50),
      new DCCGear("horse", 1),
      1,
      function(character: DCCCharacter): DCCCharacter {
        return character;
      }
    ),
    new DCCOccupation(
      "swineherd",
      new DCCWeapon("staff", "staff", "melee", "1d4", 50),
      new DCCGear("sow", 1),
      1,
      function(character: DCCCharacter): DCCCharacter {
        return character;
      }
    ),
    new DCCOccupation(
      "tailor",
      new DCCWeapon("scissors", "dagger", "10/20/30", "1d4/1d10", 50),
      new DCCGear("linen, 6 yds.", 1),
      1,
      function(character: DCCCharacter): DCCCharacter {
        return character;
      }
    ),
    new DCCOccupation(
      "tanner",
      new DCCWeapon("knife", "dagger", "10/20/30", "1d4/1d10", 50),
      new DCCGear("sheet of leather", 1),
      1,
      function(character: DCCCharacter): DCCCharacter {
        return character;
      }
    ),
    new DCCOccupation(
      "tax collector",
      new DCCWeapon("longsword", "longsword", "melee", "1d8", 50),
      new DCCGear("coin purse", 1),
      1,
      function(character: DCCCharacter): DCCCharacter {
        character.currency.cp += 100;
        return character;
      }
    ),
    new DCCOccupation(
      "thatcher",
      new DCCWeapon("hammer", "club", "melee", "1d4", 50),
      new DCCGear("thatching, 1 bundle", 1),
      1,
      function(character: DCCCharacter): DCCCharacter {
        return character;
      }
    ),
    new DCCOccupation(
      "trapper",
      new DCCWeapon("sling", "sling", "40/60/180", "1d4", 50),
      new DCCGear("badger pelt", 1),
      2,
      function(character: DCCCharacter): DCCCharacter {
        return character;
      }
    ),
    new DCCOccupation(
      "urchin",
      new DCCWeapon("stick", "club", "melee", "1d4", 50),
      new DCCGear("begging bowl", 1),
      1,
      function(character: DCCCharacter): DCCCharacter {
        return character;
      }
    ),
    new DCCOccupation(
      "wainwright",
      new DCCWeapon("club", "club", "melee", "1d4", 50),
      new DCCGear("pushcart", 1),
      1,
      function(character: DCCCharacter): DCCCharacter {
        return character;
      }
    ),
    new DCCOccupation(
      "watchman",
      new DCCWeapon("club", "club", "melee", "1d4", 50),
      new DCCGear("pocket watch", 1),
      1,
      function(character: DCCCharacter): DCCCharacter {
        return character;
      }
    ),
    new DCCOccupation(
      "weaver",
      new DCCWeapon("dagger", "dagger", "10/20/30", "1d4/1d10", 50),
      new DCCGear("fine suit of clothes", 1),
      1,
      function(character: DCCCharacter): DCCCharacter {
        return character;
      }
    ),
    new DCCOccupation(
      "winemaker",
      new DCCWeapon("sickle", "dagger", "10/20/30", "1d4/1d10", 50),
      new DCCGear("grapes, 1 lb.", 1),
      1,
      function(character: DCCCharacter): DCCCharacter {
        return character;
      }
    ),
    new DCCOccupation(
      "wizard's apprentice",
      new DCCWeapon("dagger", "dagger", "10/20/30", "1d4/1d10", 50),
      new DCCGear("black grimoire", 1),
      1,
      function(character: DCCCharacter): DCCCharacter {
        return character;
      }
    ),
    new DCCOccupation(
      "woodcutter",
      new DCCWeapon("handaxe", "handaxe", "10/20/30", "1d6", 50),
      new DCCGear("bundle of wood", 1),
      3,
      function(character: DCCCharacter): DCCCharacter {
        return character;
      }
    ),
  ];
}
