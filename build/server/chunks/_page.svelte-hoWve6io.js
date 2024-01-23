import { c as create_ssr_component, b as add_attribute, e as escape, f as each } from './ssr-kRdx30EW.js';
import * as RND from '@ironarachne/rng';
import random from 'random';
import seedrandom from 'seedrandom';
import * as MUN from '@ironarachne/made-up-names';
import { a as roll } from './dice-mjdHVU8U.js';
import './sentry-release-injection-file-o9u5woV9.js';

class DCCAttribute {
  value;
  modifier;
  constructor(value) {
    this.value = value;
    const values = [-3, -3, -3, -3, -2, -2, -1, -1, -1, 0, 0, 0, 0, 1, 1, 1, 2, 2, 3];
    this.modifier = values[value];
  }
}
class CoinPurse {
  cp;
  sp;
  gp;
  ep;
  pp;
  constructor() {
    this.cp = 0;
    this.sp = 0;
    this.gp = 0;
    this.ep = 0;
    this.pp = 0;
  }
  toString() {
    let result = "";
    if (this.pp > 0) {
      result += this.pp + " pp ";
    }
    if (this.gp > 0) {
      result += this.gp + " gp ";
    }
    if (this.ep > 0) {
      result += this.ep + " ep ";
    }
    if (this.sp > 0) {
      result += this.sp + " sp ";
    }
    if (this.cp > 0) {
      result += this.cp + " cp ";
    }
    return result.trim();
  }
}
class DCCWeapon {
  name;
  classification;
  damage;
  range;
  value;
  constructor(name, classification, range, damage, value) {
    this.name = name;
    this.classification = classification;
    this.range = range;
    this.damage = damage;
    this.value = value;
  }
}
class DCCLuckyRoll {
  name;
  description;
  modifier;
  apply;
  constructor(name, description, apply) {
    this.name = name;
    this.description = description;
    this.apply = apply;
  }
}
class DCCOccupation {
  name;
  trainedWeapon;
  tradeGoods;
  commonality;
  apply;
  constructor(name, weapon, good, commonality, apply) {
    this.name = name;
    this.trainedWeapon = weapon;
    this.tradeGoods = good;
    this.commonality = commonality;
    this.apply = apply;
  }
}
class DCCCharacter {
  firstName;
  lastName;
  age;
  gender;
  level;
  xp;
  hp;
  speed;
  alignment;
  occupation;
  strength;
  agility;
  stamina;
  personality;
  intelligence;
  luck;
  fortitudeSave;
  reflexSave;
  willpowerSave;
  baseSave;
  luckyRoll;
  spellsKnown;
  wizardMaxSpellLevel;
  clericMaxSpellLevel;
  attackModifier;
  specialRules;
  armorClass;
  currency;
  equipment;
  weapons;
  languages;
  numberOfLanguages;
  constructor() {
    this.level = 0;
    this.xp = 0;
    this.hp = 0;
    this.speed = 30;
    this.baseSave = 0;
    this.specialRules = [];
    this.currency = new CoinPurse();
    this.equipment = [];
    this.weapons = [];
    this.languages = [];
    this.numberOfLanguages = 0;
    this.armorClass = 10;
  }
}
class DCCGear {
  name;
  value;
  constructor(name, value) {
    this.name = name;
    this.value = value;
  }
}
class DCCLanguage {
  name;
  commonality;
  constructor(name, commonality) {
    this.name = name;
    this.commonality = commonality;
  }
}
function getDwarf() {
  return [
    new DCCLanguage("Elf", 6),
    new DCCLanguage("Halfling", 10),
    new DCCLanguage("Gnome", 5),
    new DCCLanguage("Bugbear", 5),
    new DCCLanguage("Goblin", 10),
    new DCCLanguage("Gnoll", 5),
    new DCCLanguage("Hobgoblin", 5),
    new DCCLanguage("Kobold", 10),
    new DCCLanguage("Minotaur", 1),
    new DCCLanguage("Ogre", 4),
    new DCCLanguage("Orc", 4),
    new DCCLanguage("Troglodyte", 6),
    new DCCLanguage("Dragon", 2),
    new DCCLanguage("Giant", 4),
    new DCCLanguage("Bear", 2),
    new DCCLanguage("Undercommon", 2)
  ];
}
function getElf() {
  return [
    new DCCLanguage("Chaos", 5),
    new DCCLanguage("Law", 5),
    new DCCLanguage("Neutrality", 5),
    new DCCLanguage("Dwarf", 4),
    new DCCLanguage("Halfling", 4),
    new DCCLanguage("Goblin", 3),
    new DCCLanguage("Gnoll", 2),
    new DCCLanguage("Harpy", 2),
    new DCCLanguage("Hobgoblin", 2),
    new DCCLanguage("Kobold", 3),
    new DCCLanguage("Lizardman", 1),
    new DCCLanguage("Minotaur", 1),
    new DCCLanguage("Ogre", 1),
    new DCCLanguage("Orc", 4),
    new DCCLanguage("Serpent-man", 1),
    new DCCLanguage("Troglodyte", 5),
    new DCCLanguage("Angelic/Celestial", 5),
    new DCCLanguage("Centaur", 5),
    new DCCLanguage("Demonic/Infernal", 5),
    new DCCLanguage("Dragon", 5),
    new DCCLanguage("Pixie", 5),
    new DCCLanguage("Naga", 3),
    new DCCLanguage("Eagle", 2),
    new DCCLanguage("Horse", 2),
    new DCCLanguage("Undercommon", 4)
  ];
}
function getHalfling() {
  return [
    new DCCLanguage("Dwarf", 10),
    new DCCLanguage("Elf", 5),
    new DCCLanguage("Gnome", 10),
    new DCCLanguage("Bugbear", 5),
    new DCCLanguage("Goblin", 5),
    new DCCLanguage("Hobgoblin", 10),
    new DCCLanguage("Kobold", 10),
    new DCCLanguage("Pixie", 2),
    new DCCLanguage("Ferret", 5),
    new DCCLanguage("Undercommon", 2)
  ];
}
function getHuman() {
  return [
    new DCCLanguage("Dwarf", 10),
    new DCCLanguage("Elf", 6),
    new DCCLanguage("Halfling", 5),
    new DCCLanguage("Gnome", 5),
    new DCCLanguage("Bugbear", 2),
    new DCCLanguage("Goblin", 10),
    new DCCLanguage("Gnoll", 3),
    new DCCLanguage("Hobgoblin", 6),
    new DCCLanguage("Kobold", 10),
    new DCCLanguage("Lizardman", 5),
    new DCCLanguage("Minotaur", 1),
    new DCCLanguage("Ogre", 2),
    new DCCLanguage("Orc", 10),
    new DCCLanguage("Troglodyte", 6),
    new DCCLanguage("Giant", 1)
  ];
}
function all$4() {
  return [
    new DCCLuckyRoll("", "", function() {
    }),
    // we're using index for rolls, so this makes the list start at 1
    new DCCLuckyRoll("Harsh winter", "All attack rolls", function(character) {
      character.attackModifier += this.modifier;
      return character;
    }),
    new DCCLuckyRoll("The bull", "Melee attack rolls", function(character) {
      let rule = `${this.description}: `;
      if (this.modifier > -1) {
        rule += "+";
      }
      rule += `${this.modifier}`;
      character.specialRules.push(rule);
      return character;
    }),
    new DCCLuckyRoll("Fortunate date", "Missile fire attack rolls", function(character) {
      let rule = `${this.description}: `;
      if (this.modifier > -1) {
        rule += "+";
      }
      rule += `${this.modifier}`;
      character.specialRules.push(rule);
      return character;
    }),
    new DCCLuckyRoll("Raised by wolves", "Unarmed attack rolls", function(character) {
      let rule = `${this.description}: `;
      if (this.modifier > -1) {
        rule += "+";
      }
      rule += `${this.modifier}`;
      character.specialRules.push(rule);
      return character;
    }),
    new DCCLuckyRoll("Conceived on horseback", "Mounted attack rolls", function(character) {
      let rule = `${this.description}: `;
      if (this.modifier > -1) {
        rule += "+";
      }
      rule += `${this.modifier}`;
      character.specialRules.push(rule);
      return character;
    }),
    new DCCLuckyRoll("Born on the battlefield", "Damage rolls", function(character) {
      let rule = `${this.description}: `;
      if (this.modifier > -1) {
        rule += "+";
      }
      rule += `${this.modifier}`;
      character.specialRules.push(rule);
      return character;
    }),
    new DCCLuckyRoll("Path of the bear", "Melee damage rolls", function(character) {
      let rule = `${this.description}: `;
      if (this.modifier > -1) {
        rule += "+";
      }
      rule += `${this.modifier}`;
      character.specialRules.push(rule);
      return character;
    }),
    new DCCLuckyRoll("Hawkeye", "Missile fire damage rolls", function(character) {
      let rule = `${this.description}: `;
      if (this.modifier > -1) {
        rule += "+";
      }
      rule += `${this.modifier}`;
      character.specialRules.push(rule);
      return character;
    }),
    new DCCLuckyRoll(
      "Pack hunter",
      "Attack and damage rolls for 0-level starting weapons",
      function(character) {
        let rule = `${this.description}: `;
        if (this.modifier > -1) {
          rule += "+";
        }
        rule += `${this.modifier}`;
        character.specialRules.push(rule);
        return character;
      }
    ),
    new DCCLuckyRoll("Born under the loom", "Skill checks (including thief skills)", function(character) {
      let rule = `${this.description}: `;
      if (this.modifier > -1) {
        rule += "+";
      }
      rule += `${this.modifier}`;
      character.specialRules.push(rule);
      return character;
    }),
    new DCCLuckyRoll("Fox's cunning", "Find/disable traps", function(character) {
      let rule = `${this.description}: `;
      if (this.modifier > -1) {
        rule += "+";
      }
      rule += `${this.modifier}`;
      character.specialRules.push(rule);
      return character;
    }),
    new DCCLuckyRoll("Four-leafed clover", "Find secret doors", function(character) {
      let rule = `${this.description}: `;
      if (this.modifier > -1) {
        rule += "+";
      }
      rule += `${this.modifier}`;
      character.specialRules.push(rule);
      return character;
    }),
    new DCCLuckyRoll("Seventh son", "Spell checks", function(character) {
      let rule = `${this.description}: `;
      if (this.modifier > -1) {
        rule += "+";
      }
      rule += `${this.modifier}`;
      character.specialRules.push(rule);
      return character;
    }),
    new DCCLuckyRoll("The raging storm", "Spell damage", function(character) {
      let rule = `${this.description}: `;
      if (this.modifier > -1) {
        rule += "+";
      }
      rule += `${this.modifier}`;
      character.specialRules.push(rule);
      return character;
    }),
    new DCCLuckyRoll("Righteous heart", "Turn unholy checks", function(character) {
      let rule = `${this.description}: `;
      if (this.modifier > -1) {
        rule += "+";
      }
      rule += `${this.modifier}`;
      character.specialRules.push(rule);
      return character;
    }),
    new DCCLuckyRoll("Survived the plague", "Magical healing", function(character) {
      let rule = `${this.description}: `;
      if (this.modifier > -1) {
        rule += "+";
      }
      rule += `${this.modifier}`;
      character.specialRules.push(rule);
      return character;
    }),
    new DCCLuckyRoll("Lucky sign", "Saving throws", function(character) {
      let rule = `${this.description}: `;
      if (this.modifier > -1) {
        rule += "+";
      }
      rule += `${this.modifier} (taken into account)`;
      character.specialRules.push(rule);
      character.baseSave += this.modifier;
      character.fortitudeSave += this.modifier;
      character.reflexSave += this.modifier;
      character.willpowerSave += this.modifier;
      return character;
    }),
    new DCCLuckyRoll("Guardian angel", "Saving throws to escape traps", function(character) {
      let rule = `${this.description}: `;
      if (this.modifier > -1) {
        rule += "+";
      }
      rule += `${this.modifier}`;
      character.specialRules.push(rule);
      return character;
    }),
    new DCCLuckyRoll("Survived a spider bite", "Saving throws against poison", function(character) {
      let rule = `${this.description}: `;
      if (this.modifier > -1) {
        rule += "+";
      }
      rule += `${this.modifier}`;
      character.specialRules.push(rule);
      return character;
    }),
    new DCCLuckyRoll("Struck by lightning", "Reflex saving throws", function(character) {
      let rule = `${this.description}: `;
      if (this.modifier > -1) {
        rule += "+";
      }
      rule += `${this.modifier} (taken into account)`;
      character.specialRules.push(rule);
      character.reflexSave += this.modifier;
      return character;
    }),
    new DCCLuckyRoll("Lived through famine", "Fortitude saving throws", function(character) {
      let rule = `${this.description}: `;
      if (this.modifier > -1) {
        rule += "+";
      }
      rule += `${this.modifier} (taken into account)`;
      character.specialRules.push(rule);
      character.fortitudeSave += this.modifier;
      return character;
    }),
    new DCCLuckyRoll("Resisted temptation", "Willpower saving throws", function(character) {
      let rule = `${this.description}: `;
      if (this.modifier > -1) {
        rule += "+";
      }
      rule += `${this.modifier} (taken into account)`;
      character.specialRules.push(rule);
      character.willpowerSave += this.modifier;
      return character;
    }),
    new DCCLuckyRoll("Charmed house", "Armor Class", function(character) {
      let rule = `${this.description}: `;
      if (this.modifier > -1) {
        rule += "+";
      }
      rule += `${this.modifier} (taken into account)`;
      character.specialRules.push(rule);
      character.armorClass += this.modifier;
      return character;
    }),
    new DCCLuckyRoll("Speed of the cobra", "Initiative", function(character) {
      let rule = `${this.description}: `;
      if (this.modifier > -1) {
        rule += "+";
      }
      rule += `${this.modifier}`;
      character.specialRules.push(rule);
      return character;
    }),
    new DCCLuckyRoll("Bountiful harvest", "Hit points (applies at each level)", function(character) {
      let rule = `${this.description}: `;
      if (this.modifier > -1) {
        rule += "+";
      }
      rule += `${this.modifier} (taken into account)`;
      character.specialRules.push(rule);
      character.hp += this.modifier;
      return character;
    }),
    new DCCLuckyRoll("Warrior's arm", "Critical hit tables", function(character) {
      let rule = `${this.description}: `;
      if (this.modifier > -1) {
        rule += "+";
      }
      rule += `${this.modifier}`;
      character.specialRules.push(rule);
      return character;
    }),
    new DCCLuckyRoll("Unholy house", "Corruption rolls", function(character) {
      let rule = `${this.description}: `;
      if (this.modifier > -1) {
        rule += "+";
      }
      rule += `${this.modifier}`;
      character.specialRules.push(rule);
      return character;
    }),
    new DCCLuckyRoll("The Broken Star", "Fumbles", function(character) {
      let rule = `${this.description}: `;
      if (this.modifier > -1) {
        rule += "+";
      }
      rule += `${this.modifier}`;
      character.specialRules.push(rule);
      return character;
    }),
    new DCCLuckyRoll("Birdsong", "Number of languages", function(character) {
      let rule = `${this.description}: `;
      if (this.modifier > -1) {
        rule += "+";
      }
      rule += `${this.modifier} (taken into account)`;
      character.specialRules.push(rule);
      character.numberOfLanguages += this.modifier;
      if (character.numberOfLanguages < 0) {
        character.numberOfLanguages = 0;
      }
      return character;
    }),
    new DCCLuckyRoll("Wild child", "Speed (each +1/-1 = +5'/-5' speed)", function(character) {
      let rule = `${this.description}: `;
      if (this.modifier > -1) {
        rule += "+";
      }
      rule += `${this.modifier} (taken into account)`;
      character.specialRules.push(rule);
      character.speed += this.modifier * 5;
      return character;
    })
  ];
}
function all$3() {
  return [
    new DCCOccupation(
      "dwarven apothecarist",
      new DCCWeapon("cudgel", "staff", "melee", "1d4", 50),
      new DCCGear("steel vial", 1),
      1,
      function(character) {
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
      function(character) {
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
      function(character) {
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
      function(character) {
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
      function(character) {
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
      function(character) {
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
      function(character) {
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
      function(character) {
        character.specialRules.push("Infravision");
        character.speed = 20;
        character.languages.push("Dwarf");
        return character;
      }
    )
  ];
}
function all$2() {
  return [
    new DCCOccupation(
      "elven artisan",
      new DCCWeapon("staff", "staff", "melee", "1d4", 50),
      new DCCGear("clay, 1 lb.", 1),
      1,
      function(character) {
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
      function(character) {
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
      function(character) {
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
      function(character) {
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
      function(character) {
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
      function(character) {
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
      function(character) {
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
      function(character) {
        character.specialRules.push("Sensitive to iron");
        character.specialRules.push("Heightened senses");
        character.languages.push("Elf");
        return character;
      }
    )
  ];
}
function all$1() {
  return [
    new DCCOccupation(
      "halfling chicken butcher",
      new DCCWeapon("handaxe", "handaxe", "10/20/30", "1d6", 50),
      new DCCGear("chicken meat, 5 lbs.", 1),
      1,
      function(character) {
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
      function(character) {
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
      function(character) {
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
      function(character) {
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
      function(character) {
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
      function(character) {
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
      function(character) {
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
      function(character) {
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
      function(character) {
        character.specialRules.push("Infravision");
        character.speed = 20;
        character.languages.push("Halfling");
        return character;
      }
    )
  ];
}
function all() {
  return [
    new DCCOccupation(
      "alchemist",
      new DCCWeapon("staff", "staff", "melee", "1d4", 50),
      new DCCGear("oil, 1 flask", 5),
      1,
      function(character) {
        return character;
      }
    ),
    new DCCOccupation(
      "animal trainer",
      new DCCWeapon("club", "club", "melee", "1d4", 50),
      new DCCGear("pony", 1),
      1,
      function(character) {
        return character;
      }
    ),
    new DCCOccupation(
      "armorer",
      new DCCWeapon("hammer", "club", "melee", "1d4", 50),
      new DCCGear("iron helmet", 1),
      1,
      function(character) {
        return character;
      }
    ),
    new DCCOccupation(
      "astrologer",
      new DCCWeapon("dagger", "dagger", "10/20/30", "1d4/1d10", 50),
      new DCCGear("spyglass", 1),
      1,
      function(character) {
        return character;
      }
    ),
    new DCCOccupation(
      "baker",
      new DCCWeapon("rolling pin", "club", "melee", "1d4", 50),
      new DCCGear("flour, 1 lb.", 1),
      1,
      function(character) {
        return character;
      }
    ),
    new DCCOccupation(
      "barber",
      new DCCWeapon("razor", "dagger", "10/20/30", "1d4/1d10", 50),
      new DCCGear("scissors", 1),
      1,
      function(character) {
        return character;
      }
    ),
    new DCCOccupation(
      "beadle",
      new DCCWeapon("staff", "staff", "melee", "1d4", 50),
      new DCCGear("holy symbol", 1),
      1,
      function(character) {
        return character;
      }
    ),
    new DCCOccupation(
      "beekeeper",
      new DCCWeapon("staff", "staff", "melee", "1d4", 50),
      new DCCGear("jar of honey", 1),
      1,
      function(character) {
        return character;
      }
    ),
    new DCCOccupation(
      "blacksmith",
      new DCCWeapon("hammer", "club", "melee", "1d4", 50),
      new DCCGear("steel tongs", 1),
      1,
      function(character) {
        return character;
      }
    ),
    new DCCOccupation(
      "bowyer",
      new DCCWeapon("shortbow", "shortbow", "50/100/150", "1d6", 50),
      new DCCGear("sinew, 10'", 1),
      1,
      function(character) {
        return character;
      }
    ),
    new DCCOccupation(
      "butcher",
      new DCCWeapon("cleaver", "handaxe", "10/20/30", "1d6", 50),
      new DCCGear("side of beef", 1),
      1,
      function(character) {
        return character;
      }
    ),
    new DCCOccupation(
      "brewer",
      new DCCWeapon("vat spoon", "staff", "melee", "1d4", 50),
      new DCCGear("barrel of ale", 1),
      1,
      function(character) {
        return character;
      }
    ),
    new DCCOccupation(
      "caravan guard",
      new DCCWeapon("short sword", "short sword", "melee", "1d6", 50),
      new DCCGear("linen, 1 yard", 1),
      1,
      function(character) {
        return character;
      }
    ),
    new DCCOccupation(
      "carpenter",
      new DCCWeapon("handaxe", "handaxe", "10/20/30", "1d6", 50),
      new DCCGear("pole, 10'", 1),
      1,
      function(character) {
        return character;
      }
    ),
    new DCCOccupation(
      "cheesemaker",
      new DCCWeapon("cudgel", "staff", "melee", "1d4", 50),
      new DCCGear("stinky cheese", 1),
      1,
      function(character) {
        return character;
      }
    ),
    new DCCOccupation(
      "cobbler",
      new DCCWeapon("awl", "dagger", "10/20/30", "1d4/1d10", 50),
      new DCCGear("shoehorn", 1),
      1,
      function(character) {
        return character;
      }
    ),
    new DCCOccupation(
      "confidence artist",
      new DCCWeapon("dagger", "dagger", "10/20/30", "1d4/1d10", 50),
      new DCCGear("quality cloak", 1),
      1,
      function(character) {
        return character;
      }
    ),
    new DCCOccupation(
      "cook",
      new DCCWeapon("staff", "staff", "melee", "1d4", 50),
      new DCCGear("spices, 1 lb.", 1),
      1,
      function(character) {
        return character;
      }
    ),
    new DCCOccupation(
      "cooper",
      new DCCWeapon("crowbar", "club", "melee", "1d4", 50),
      new DCCGear("barrel", 1),
      1,
      function(character) {
        return character;
      }
    ),
    new DCCOccupation(
      "costermonger",
      new DCCWeapon("knife", "dagger", "10/20/30", "1d4/1d10", 50),
      new DCCGear("fruit", 1),
      1,
      function(character) {
        return character;
      }
    ),
    new DCCOccupation(
      "cutpurse",
      new DCCWeapon("dagger", "dagger", "10/20/30", "1d4/1d10", 50),
      new DCCGear("small chest", 1),
      1,
      function(character) {
        return character;
      }
    ),
    new DCCOccupation(
      "ditch digger",
      new DCCWeapon("shovel", "staff", "melee", "1d4", 50),
      new DCCGear("fine dirt, 1 lb.", 1),
      1,
      function(character) {
        return character;
      }
    ),
    new DCCOccupation(
      "dock worker",
      new DCCWeapon("pole", "staff", "melee", "1d4", 50),
      new DCCGear("1 late RPG book", 1),
      1,
      function(character) {
        return character;
      }
    ),
    new DCCOccupation(
      "farmer",
      new DCCWeapon("pitchfork", "spear", "melee", "1d8", 50),
      new DCCGear("hen", 1),
      20,
      function(character) {
        return character;
      }
    ),
    new DCCOccupation(
      "fisherman",
      new DCCWeapon("knife", "dagger", "10/20/30", "1d4/1d10", 50),
      new DCCGear("fishing pole", 1),
      1,
      function(character) {
        return character;
      }
    ),
    new DCCOccupation(
      "fortune-teller",
      new DCCWeapon("dagger", "dagger", "10/20/30", "1d4/1d10", 50),
      new DCCGear("tarot deck", 1),
      1,
      function(character) {
        return character;
      }
    ),
    new DCCOccupation(
      "farrier",
      new DCCWeapon("hammer", "club", "melee", "1d4", 50),
      new DCCGear("steel tongs", 1),
      1,
      function(character) {
        return character;
      }
    ),
    new DCCOccupation(
      "furrier",
      new DCCWeapon("knife", "dagger", "10/20/30", "1d4/1d10", 50),
      new DCCGear("deer pelt", 1),
      1,
      function(character) {
        return character;
      }
    ),
    new DCCOccupation(
      "gambler",
      new DCCWeapon("club", "club", "melee", "1d4", 50),
      new DCCGear("dice", 1),
      1,
      function(character) {
        return character;
      }
    ),
    new DCCOccupation(
      "goatherd",
      new DCCWeapon("crook", "staff", "melee", "1d4", 50),
      new DCCGear("goat", 1),
      1,
      function(character) {
        return character;
      }
    ),
    new DCCOccupation(
      "gongfarmer",
      new DCCWeapon("trowel", "dagger", "10/20/30", "1d4/1d10", 50),
      new DCCGear("sack of night soil", 1),
      1,
      function(character) {
        return character;
      }
    ),
    new DCCOccupation(
      "gravedigger",
      new DCCWeapon("shovel", "staff", "melee", "1d4", 50),
      new DCCGear("trowel", 1),
      2,
      function(character) {
        return character;
      }
    ),
    new DCCOccupation(
      "guild beggar",
      new DCCWeapon("sling", "sling", "40/80/160", "1d4", 50),
      new DCCGear("crutches", 1),
      2,
      function(character) {
        return character;
      }
    ),
    new DCCOccupation(
      "hatter",
      new DCCWeapon("scissors", "dagger", "10/20/30", "1d4/1d10", 50),
      new DCCGear("hat", 1),
      1,
      function(character) {
        return character;
      }
    ),
    new DCCOccupation(
      "healer",
      new DCCWeapon("club", "club", "melee", "1d4", 50),
      new DCCGear("holy water", 1),
      1,
      function(character) {
        return character;
      }
    ),
    new DCCOccupation(
      "herbalist",
      new DCCWeapon("club", "club", "melee", "1d4", 50),
      new DCCGear("herbs, 1 lb.", 1),
      1,
      function(character) {
        return character;
      }
    ),
    new DCCOccupation(
      "herder",
      new DCCWeapon("staff", "staff", "melee", "1d4", 50),
      new DCCGear("herding dog", 1),
      1,
      function(character) {
        return character;
      }
    ),
    new DCCOccupation(
      "hunter",
      new DCCWeapon("shortbow", "shortbow", "50/100/150", "1d6", 50),
      new DCCGear("deer pelt", 1),
      2,
      function(character) {
        return character;
      }
    ),
    new DCCOccupation(
      "indentured servant",
      new DCCWeapon("staff", "staff", "melee", "1d4", 50),
      new DCCGear("locket", 1),
      1,
      function(character) {
        return character;
      }
    ),
    new DCCOccupation(
      "innkeeper",
      new DCCWeapon("cudgel", "club", "melee", "1d4", 50),
      new DCCGear("coin purse", 1),
      1,
      function(character) {
        character.currency.cp += 100;
        return character;
      }
    ),
    new DCCOccupation(
      "jester",
      new DCCWeapon("dart", "dart", "20/40/60", "1d4", 50),
      new DCCGear("silk clothes", 1),
      1,
      function(character) {
        return character;
      }
    ),
    new DCCOccupation(
      "jeweller",
      new DCCWeapon("dagger", "dagger", "10/20/30", "1d4/1d10", 50),
      new DCCGear("gem worth 20 gp", 1),
      1,
      function(character) {
        return character;
      }
    ),
    new DCCOccupation(
      "locksmith",
      new DCCWeapon("dagger", "dagger", "10/20/30", "1d4/1d10", 50),
      new DCCGear("fine tools", 1),
      1,
      function(character) {
        return character;
      }
    ),
    new DCCOccupation(
      "mendicant",
      new DCCWeapon("club", "club", "melee", "1d4", 50),
      new DCCGear("cheese dip", 1),
      1,
      function(character) {
        return character;
      }
    ),
    new DCCOccupation(
      "mercenary",
      new DCCWeapon("longsword", "longsword", "melee", "1d8", 50),
      new DCCGear("hide armor", 1),
      1,
      function(character) {
        character.armorClass += 3;
        return character;
      }
    ),
    new DCCOccupation(
      "merchant",
      new DCCWeapon("dagger", "dagger", "10/20/30", "1d4/1d10", 50),
      new DCCGear("coin purse", 1),
      1,
      function(character) {
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
      function(character) {
        return character;
      }
    ),
    new DCCOccupation(
      "minstrel",
      new DCCWeapon("dagger", "dagger", "10/20/30", "1d4/1d10", 50),
      new DCCGear("ukelele", 1),
      1,
      function(character) {
        return character;
      }
    ),
    new DCCOccupation(
      "noble",
      new DCCWeapon("longsword", "longsword", "melee", "1d8", 50),
      new DCCGear("gold ring worth 10 gp", 1),
      1,
      function(character) {
        return character;
      }
    ),
    new DCCOccupation(
      "orphan",
      new DCCWeapon("club", "club", "melee", "1d4", 50),
      new DCCGear("rag doll", 1),
      1,
      function(character) {
        return character;
      }
    ),
    new DCCOccupation(
      "ostler",
      new DCCWeapon("staff", "staff", "melee", "1d4", 50),
      new DCCGear("bridle", 1),
      1,
      function(character) {
        return character;
      }
    ),
    new DCCOccupation(
      "outlaw",
      new DCCWeapon("short sword", "short sword", "melee", "1d6", 50),
      new DCCGear("leather armor", 1),
      1,
      function(character) {
        character.armorClass += 2;
        return character;
      }
    ),
    new DCCOccupation(
      "potter",
      new DCCWeapon("awl", "dagger", "10/20/30", "1d4/1d10", 50),
      new DCCGear("potting clay, 5 lb.", 1),
      1,
      function(character) {
        return character;
      }
    ),
    new DCCOccupation(
      "quarrier",
      new DCCWeapon("pickaxe", "short sword", "melee", "1d6", 50),
      new DCCGear("bag of stone chips", 1),
      1,
      function(character) {
        return character;
      }
    ),
    new DCCOccupation(
      "rope maker",
      new DCCWeapon("knife", "dagger", "10/20/30", "1d4/1d10", 50),
      new DCCGear("rope, 100'", 1),
      1,
      function(character) {
        return character;
      }
    ),
    new DCCOccupation(
      "rugmaker",
      new DCCWeapon("scissors", "dagger", "10/20/30", "1d4/1d10", 50),
      new DCCGear("small rug", 1),
      1,
      function(character) {
        return character;
      }
    ),
    new DCCOccupation(
      "sailor",
      new DCCWeapon("knife", "dagger", "10/20/30", "1d4/1d10", 50),
      new DCCGear("rope, 50'", 1),
      1,
      function(character) {
        return character;
      }
    ),
    new DCCOccupation(
      "scribe",
      new DCCWeapon("dart", "dart", "20/40/60", "1d4", 50),
      new DCCGear("parchment, 100 sheets", 1),
      1,
      function(character) {
        return character;
      }
    ),
    new DCCOccupation(
      "shaman",
      new DCCWeapon("mace", "mace", "melee", "1d6", 50),
      new DCCGear("herbs, 1 lb.", 1),
      1,
      function(character) {
        return character;
      }
    ),
    new DCCOccupation(
      "shepherd",
      new DCCWeapon("crook", "staff", "melee", "1d4", 50),
      new DCCGear("sheep", 1),
      1,
      function(character) {
        return character;
      }
    ),
    new DCCOccupation(
      "slave",
      new DCCWeapon("club", "club", "melee", "1d4", 50),
      new DCCGear("strange-looking rock", 1),
      1,
      function(character) {
        return character;
      }
    ),
    new DCCOccupation(
      "smuggler",
      new DCCWeapon("sling", "sling", "40/80/160", "1d4", 50),
      new DCCGear("waterproof sack", 1),
      1,
      function(character) {
        return character;
      }
    ),
    new DCCOccupation(
      "soldier",
      new DCCWeapon("spear", "spear", "melee", "1d8", 50),
      new DCCGear("shield", 1),
      1,
      function(character) {
        character.armorClass += 1;
        return character;
      }
    ),
    new DCCOccupation(
      "squire",
      new DCCWeapon("longsword", "longsword", "melee", "1d8", 50),
      new DCCGear("steel helmet", 1),
      2,
      function(character) {
        return character;
      }
    ),
    new DCCOccupation(
      "stablemaster",
      new DCCWeapon("pitchfork", "spear", "melee", "1d8", 50),
      new DCCGear("horse", 1),
      1,
      function(character) {
        return character;
      }
    ),
    new DCCOccupation(
      "swineherd",
      new DCCWeapon("staff", "staff", "melee", "1d4", 50),
      new DCCGear("sow", 1),
      1,
      function(character) {
        return character;
      }
    ),
    new DCCOccupation(
      "tailor",
      new DCCWeapon("scissors", "dagger", "10/20/30", "1d4/1d10", 50),
      new DCCGear("linen, 6 yds.", 1),
      1,
      function(character) {
        return character;
      }
    ),
    new DCCOccupation(
      "tanner",
      new DCCWeapon("knife", "dagger", "10/20/30", "1d4/1d10", 50),
      new DCCGear("sheet of leather", 1),
      1,
      function(character) {
        return character;
      }
    ),
    new DCCOccupation(
      "tax collector",
      new DCCWeapon("longsword", "longsword", "melee", "1d8", 50),
      new DCCGear("coin purse", 1),
      1,
      function(character) {
        character.currency.cp += 100;
        return character;
      }
    ),
    new DCCOccupation(
      "thatcher",
      new DCCWeapon("hammer", "club", "melee", "1d4", 50),
      new DCCGear("thatching, 1 bundle", 1),
      1,
      function(character) {
        return character;
      }
    ),
    new DCCOccupation(
      "trapper",
      new DCCWeapon("sling", "sling", "40/60/180", "1d4", 50),
      new DCCGear("badger pelt", 1),
      2,
      function(character) {
        return character;
      }
    ),
    new DCCOccupation(
      "urchin",
      new DCCWeapon("stick", "club", "melee", "1d4", 50),
      new DCCGear("begging bowl", 1),
      1,
      function(character) {
        return character;
      }
    ),
    new DCCOccupation(
      "wainwright",
      new DCCWeapon("club", "club", "melee", "1d4", 50),
      new DCCGear("pushcart", 1),
      1,
      function(character) {
        return character;
      }
    ),
    new DCCOccupation(
      "watchman",
      new DCCWeapon("club", "club", "melee", "1d4", 50),
      new DCCGear("pocket watch", 1),
      1,
      function(character) {
        return character;
      }
    ),
    new DCCOccupation(
      "weaver",
      new DCCWeapon("dagger", "dagger", "10/20/30", "1d4/1d10", 50),
      new DCCGear("fine suit of clothes", 1),
      1,
      function(character) {
        return character;
      }
    ),
    new DCCOccupation(
      "winemaker",
      new DCCWeapon("sickle", "dagger", "10/20/30", "1d4/1d10", 50),
      new DCCGear("grapes, 1 lb.", 1),
      1,
      function(character) {
        return character;
      }
    ),
    new DCCOccupation(
      "wizard's apprentice",
      new DCCWeapon("dagger", "dagger", "10/20/30", "1d4/1d10", 50),
      new DCCGear("black grimoire", 1),
      1,
      function(character) {
        return character;
      }
    ),
    new DCCOccupation(
      "woodcutter",
      new DCCWeapon("handaxe", "handaxe", "10/20/30", "1d6", 50),
      new DCCGear("bundle of wood", 1),
      3,
      function(character) {
        return character;
      }
    )
  ];
}
function get(allowedOccupations) {
  let occupations = [];
  if (allowedOccupations.includes("dwarf")) {
    occupations = occupations.concat(all$3());
  }
  if (allowedOccupations.includes("elf")) {
    occupations = occupations.concat(all$2());
  }
  if (allowedOccupations.includes("halfling")) {
    occupations = occupations.concat(all$1());
  }
  if (allowedOccupations.includes("human")) {
    occupations = occupations.concat(all());
  }
  return occupations;
}
class DCCCharacterGenerator {
  config;
  constructor(config) {
    this.config = config;
  }
  generate() {
    let character = new DCCCharacter();
    character.strength = new DCCAttribute(roll("3d6"));
    character.agility = new DCCAttribute(roll("3d6"));
    character.stamina = new DCCAttribute(roll("3d6"));
    character.personality = new DCCAttribute(roll("3d6"));
    character.intelligence = new DCCAttribute(roll("3d6"));
    character.luck = new DCCAttribute(roll("3d6"));
    character.numberOfLanguages = character.intelligence.modifier > 0 ? character.intelligence.modifier : 0;
    character.luckyRoll = randomLuckyRoll(character.luck.modifier);
    character.hp = roll("1d4") + character.stamina.modifier;
    character.spellsKnown = getSpellsKnown(character.intelligence.value);
    character.wizardMaxSpellLevel = getMaxSpellLevel(character.intelligence.value);
    character.clericMaxSpellLevel = getMaxSpellLevel(character.personality.value);
    character.baseSave = 0;
    character.fortitudeSave = character.baseSave + character.stamina.modifier;
    character.willpowerSave = character.baseSave + character.personality.modifier;
    character.reflexSave = character.baseSave + character.agility.modifier;
    character.gender = RND.item(["male", "female"]);
    character.lastName = this.config.nameGeneratorFamily.generate(1)[0];
    character.firstName = this.config.nameGeneratorFemale.generate(1)[0];
    if (character.gender == "male") {
      character.firstName = this.config.nameGeneratorMale.generate(1)[0];
    }
    character.age = random.int(16, 22);
    character.xp = 0;
    character.level = 0;
    character.alignment = RND.item(["Law", "Chaos", "Neutrality"]);
    character.occupation = randomOccupation(this.config.allowedOccupations);
    character.equipment.push(character.occupation.trainedWeapon);
    character.equipment.push(character.occupation.tradeGoods);
    character.weapons.push(character.occupation.trainedWeapon);
    character.equipment.push(randomEquipment());
    character.currency.cp = roll("5d12");
    character.languages.push("Common");
    character = character.occupation.apply(character);
    character = character.luckyRoll.apply(character);
    if (character.occupation.name.includes("elven")) {
      let genSet = MUN.getSetByName("elf", MUN.allSets());
      character.lastName = genSet.family.generate(1)[0];
      if (character.gender == "male") {
        character.firstName = genSet.male.generate(1)[0];
      } else {
        character.firstName = genSet.female.generate(1)[0];
      }
    } else if (character.occupation.name.includes("dwarven")) {
      let genSet = MUN.getSetByName("dwarf", MUN.allSets());
      if (character.gender == "male") {
        character.firstName = genSet.male.generate(1)[0];
      } else {
        character.firstName = genSet.female.generate(1)[0];
      }
    } else if (character.occupation.name.includes("halfling")) {
      let genSet = MUN.getSetByName("halfling", MUN.allSets());
      if (genSet.family === null) {
        throw new Error("No family name generator found for halflings.");
      }
      character.lastName = genSet.family.generate(1)[0];
      if (genSet.female === null) {
        throw new Error("No female name generator found for halflings.");
      }
      if (genSet.male === null) {
        throw new Error("No male name generator found for halflings.");
      }
      if (character.gender == "male") {
        character.firstName = genSet.male.generate(1)[0];
      } else {
        character.firstName = genSet.female.generate(1)[0];
      }
    }
    if (character.hp < 1) {
      character.hp = 1;
    }
    character.languages = getLanguages(character);
    return character;
  }
}
function getLanguages(character) {
  let languages = character.languages;
  let possibleLanguages = getHuman();
  if (character.occupation.name.includes("dwarven")) {
    possibleLanguages = getDwarf();
    possibleLanguages.push(new DCCLanguage(character.alignment, 20));
  } else if (character.occupation.name.includes("elven")) {
    possibleLanguages = getElf();
    possibleLanguages.push(new DCCLanguage(character.alignment, 20));
  } else if (character.occupation.name.includes("halfling")) {
    possibleLanguages = getHalfling();
    possibleLanguages.push(new DCCLanguage(character.alignment, 25));
  } else {
    possibleLanguages.push(new DCCLanguage(character.alignment, 20));
  }
  for (let i = 0; i < character.numberOfLanguages; i++) {
    let language = RND.weighted(possibleLanguages);
    if (!languages.includes(language.name)) {
      languages.push(language.name);
    } else {
      i++;
    }
  }
  return languages;
}
function getMaxSpellLevel(score) {
  const values = [0, 0, 0, 0, 1, 1, 1, 1, 2, 2, 3, 3, 4, 4, 4, 5, 5, 5, 5];
  return values[score];
}
function getSpellsKnown(intScore) {
  const known = [-9, -9, -9, -9, -2, -2 - 1, -1, 0, 0, 0, 0, 0, 0, 1, 1, 1, 2, 2];
  return known[intScore];
}
function randomEquipment() {
  return RND.item([
    new DCCGear("backpack", 1),
    new DCCGear("candle", 1),
    new DCCGear("chain, 10'", 1),
    new DCCGear("chalk, 1 piece", 1),
    new DCCGear("chest, empty", 1),
    new DCCGear("crowbar", 1),
    new DCCGear("flask, empty", 1),
    new DCCGear("flint and steel", 1),
    new DCCGear("grappling hook", 1),
    new DCCGear("hammer, small", 1),
    new DCCGear("holy symbol", 1),
    new DCCGear("holy water, 1 vial", 1),
    new DCCGear("iron spike", 1),
    new DCCGear("lantern", 1),
    new DCCGear("mirror, hand-sized", 1),
    new DCCGear("oil, 1 flask", 1),
    new DCCGear("pole, 10-foot", 1),
    new DCCGear("rations, 1 day", 1),
    new DCCGear("rope, 50'", 1),
    new DCCGear("sack, large", 1),
    new DCCGear("sack, small", 1),
    new DCCGear("thieves' tools", 1),
    new DCCGear("torch", 1),
    new DCCGear("waterskin", 1)
  ]);
}
function randomLuckyRoll(modifier) {
  const rolls = all$4();
  let roll$1 = rolls[roll("1d30")];
  roll$1.modifier = modifier;
  return roll$1;
}
function randomOccupation(allowedOccupations) {
  const occupations = get(allowedOccupations);
  let occupation = RND.weighted(occupations);
  return occupation;
}
class DCCCharacterGeneratorConfig {
  nameGeneratorMale;
  nameGeneratorFemale;
  nameGeneratorFamily;
  allowedOccupations;
  constructor() {
    let genSet = MUN.getSetByName("human", MUN.fantasyRaceSets());
    this.nameGeneratorFamily = genSet.family;
    this.nameGeneratorFemale = genSet.female;
    this.nameGeneratorMale = genSet.male;
    this.allowedOccupations = ["dwarf", "elf", "halfling", "human"];
  }
}
const css = {
  code: 'div.svelte-4q74qx.svelte-4q74qx,h1.svelte-4q74qx.svelte-4q74qx,h2.svelte-4q74qx.svelte-4q74qx,h3.svelte-4q74qx.svelte-4q74qx,p.svelte-4q74qx.svelte-4q74qx,strong.svelte-4q74qx.svelte-4q74qx,ul.svelte-4q74qx.svelte-4q74qx,li.svelte-4q74qx.svelte-4q74qx,label.svelte-4q74qx.svelte-4q74qx,section.svelte-4q74qx.svelte-4q74qx{margin:0;padding:0;border:0;font-size:100%;font:inherit;vertical-align:baseline}section.svelte-4q74qx.svelte-4q74qx{display:block}ul.svelte-4q74qx.svelte-4q74qx{list-style:none}@font-face{font-family:"alienleague";src:url("$lib/assets/fonts/alienleagueregular-9d3z-webfont.woff2") format("woff2");font-weight:normal;font-style:normal}@font-face{font-family:"azonix";src:url("$lib/assets/fonts/azonix-webfont.woff2") format("woff2");font-weight:normal;font-style:normal}h1.svelte-4q74qx.svelte-4q74qx,h2.svelte-4q74qx.svelte-4q74qx,h3.svelte-4q74qx.svelte-4q74qx{font-family:system-ui, Helvetica, sans-serif;margin:0.5rem 0}h1.svelte-4q74qx.svelte-4q74qx{color:#000;font-weight:700;font-size:2.5rem;line-height:2.5rem;padding:3px}h2.svelte-4q74qx.svelte-4q74qx{color:#000;font-weight:500;font-size:2.25rem;line-height:2.25rem;padding:3px}h3.svelte-4q74qx.svelte-4q74qx{font-size:2rem;line-height:2rem}p.svelte-4q74qx.svelte-4q74qx{margin:1rem 0}label.svelte-4q74qx.svelte-4q74qx{font-weight:700;margin-right:1rem}input.svelte-4q74qx.svelte-4q74qx{font-size:1rem;line-height:1rem;padding:0.25rem}div.input-group.svelte-4q74qx.svelte-4q74qx{margin-bottom:1rem}ul.svelte-4q74qx li.svelte-4q74qx{list-style-type:disc;margin-left:2rem}strong.svelte-4q74qx.svelte-4q74qx{font-weight:700}section.main.svelte-4q74qx.svelte-4q74qx{padding:0.5rem}#seed.svelte-4q74qx.svelte-4q74qx{font-family:monospace}.fantasy.svelte-4q74qx button.svelte-4q74qx{background:rgb(92, 86, 73);background:linear-gradient(165deg, rgb(92, 86, 73) 0%, rgb(10, 10, 10) 100%);border:3px solid #5c5031;border-radius:3px;color:#fff;line-height:1rem;margin:0.1rem;padding:0.5rem 1rem}.fantasy.svelte-4q74qx button.svelte-4q74qx:active{background:rgb(92, 86, 73);background:linear-gradient(339deg, rgb(92, 86, 73) 0%, rgb(10, 10, 10) 100%);color:#76e841;transform:translateY(2px)}.fantasy.svelte-4q74qx button.svelte-4q74qx:disabled{background:#666;color:#777;border-color:#999}',
  map: null
};
function dMod(modifier) {
  if (modifier > -1) {
    return `+${modifier}`;
  }
  return `${modifier}`;
}
const Page = create_ssr_component(($$result, $$props, $$bindings, slots) => {
  let allowDwarves = true;
  let allowElves = true;
  let allowHalflings = true;
  let allowHumans = true;
  let seed = RND.randomString(13);
  let genConfig = new DCCCharacterGeneratorConfig();
  let charGen = new DCCCharacterGenerator(genConfig);
  let character = charGen.generate();
  let spellsKnown = getSpellsKnown2();
  function generate() {
    random.use(seedrandom(seed));
    let allowedOccupations = [];
    {
      allowedOccupations.push("dwarf");
    }
    {
      allowedOccupations.push("elf");
    }
    {
      allowedOccupations.push("halfling");
    }
    {
      allowedOccupations.push("human");
    }
    charGen.config.allowedOccupations = allowedOccupations;
    character = charGen.generate();
    spellsKnown = getSpellsKnown2();
  }
  function getSpellsKnown2() {
    if (character.spellsKnown == -9) {
      return "No spellcasting possible";
    }
    if (character.spellsKnown > -1) {
      return `+${character.spellsKnown}`;
    }
    return `${character.spellsKnown}`;
  }
  function newSeed() {
    seed = RND.randomString(13);
    generate();
  }
  newSeed();
  $$result.css.add(css);
  return `${$$result.head += `<!-- HEAD_svelte-3c3b5j_START -->${$$result.title = `<title>Dungeon Crawl Classics Character Generator | Iron Arachne</title>`, ""}<!-- HEAD_svelte-3c3b5j_END -->`, ""} <section class="fantasy main svelte-4q74qx"><h1 class="svelte-4q74qx" data-svelte-h="svelte-wwqmdk">Dungeon Crawl Classics Character Generator</h1> <p class="svelte-4q74qx" data-svelte-h="svelte-lsqcoq">This is a DCC 0-level character generator.</p> <div class="input-group svelte-4q74qx"><label for="seed" class="svelte-4q74qx" data-svelte-h="svelte-1akft3f">Random Seed</label> <input type="text" name="seed" id="seed" class="svelte-4q74qx"${add_attribute("value", seed, 0)}></div> <div class="input-group svelte-4q74qx"><label for="allowDwarves" class="svelte-4q74qx" data-svelte-h="svelte-1hdz7b6">Allow Dwarves</label> <input type="checkbox" name="allowDwarves" id="allowDwarves" class="svelte-4q74qx"${add_attribute("checked", allowDwarves, 1)}></div> <div class="input-group svelte-4q74qx"><label for="allowElves" class="svelte-4q74qx" data-svelte-h="svelte-p0wbn4">Allow Elves</label> <input type="checkbox" name="allowElves" id="allowElves" class="svelte-4q74qx"${add_attribute("checked", allowElves, 1)}></div> <div class="input-group svelte-4q74qx"><label for="allowHalflings" class="svelte-4q74qx" data-svelte-h="svelte-1r9g74m">Allow Halflings</label> <input type="checkbox" name="allowHalflings" id="allowHalflings" class="svelte-4q74qx"${add_attribute("checked", allowHalflings, 1)}></div> <div class="input-group svelte-4q74qx"><label for="allowHumans" class="svelte-4q74qx" data-svelte-h="svelte-1om8stw">Allow Humans</label> <input type="checkbox" name="allowHumans" id="allowHumans" class="svelte-4q74qx"${add_attribute("checked", allowHumans, 1)}></div> <button class="svelte-4q74qx" data-svelte-h="svelte-1u7zbd5">Generate From Seed</button> <button class="svelte-4q74qx" data-svelte-h="svelte-192mxrq">Random Seed (and Generate)</button> <h2 class="svelte-4q74qx">${escape(character.firstName)} ${escape(character.lastName)}</h2> <p class="svelte-4q74qx">A level ${escape(character.level)} ${escape(character.occupation.name)}</p> <p class="svelte-4q74qx"><strong class="svelte-4q74qx" data-svelte-h="svelte-ux976c">XP:</strong> ${escape(character.xp)}</p> <p class="svelte-4q74qx"><strong class="svelte-4q74qx" data-svelte-h="svelte-1cs6kjo">HP:</strong> ${escape(character.hp)}</p> <p class="svelte-4q74qx"><strong class="svelte-4q74qx" data-svelte-h="svelte-6el7vw">AC:</strong> ${escape(character.armorClass)}</p> <p class="svelte-4q74qx"><strong class="svelte-4q74qx" data-svelte-h="svelte-c9vwy7">Currency:</strong> ${escape(character.currency)}</p> <p class="svelte-4q74qx"><strong class="svelte-4q74qx" data-svelte-h="svelte-1e50fa1">Alignment:</strong> ${escape(character.alignment)}</p> <p class="svelte-4q74qx"><strong class="svelte-4q74qx" data-svelte-h="svelte-ah8i3p">Gender:</strong> ${escape(character.gender)}</p> <p class="svelte-4q74qx"><strong class="svelte-4q74qx" data-svelte-h="svelte-68jrmf">Speed:</strong> ${escape(character.speed)}&#39;</p> <h3 class="svelte-4q74qx" data-svelte-h="svelte-1o8svp9">Attributes</h3> <p class="svelte-4q74qx"><strong class="svelte-4q74qx" data-svelte-h="svelte-1ktn8k1">Strength:</strong> ${escape(character.strength.value)} (${escape(dMod(character.strength.modifier))})</p> <p class="svelte-4q74qx"><strong class="svelte-4q74qx" data-svelte-h="svelte-1sswezn">Agility:</strong> ${escape(character.agility.value)} (${escape(dMod(character.agility.modifier))})</p> <p class="svelte-4q74qx"><strong class="svelte-4q74qx" data-svelte-h="svelte-1bqqnq1">Stamina:</strong> ${escape(character.stamina.value)} (${escape(dMod(character.stamina.modifier))})</p> <p class="svelte-4q74qx"><strong class="svelte-4q74qx" data-svelte-h="svelte-av6ofe">Personality:</strong> ${escape(character.personality.value)} (${escape(dMod(character.personality.modifier))})</p> <p class="svelte-4q74qx"><strong class="svelte-4q74qx" data-svelte-h="svelte-1cgat6v">Intelligence:</strong> ${escape(character.intelligence.value)} (${escape(dMod(character.intelligence.modifier))})</p> <p class="svelte-4q74qx"><strong class="svelte-4q74qx" data-svelte-h="svelte-1p9e0dl">Luck:</strong> ${escape(character.luck.value)} (${escape(dMod(character.luck.modifier))})</p> <h3 class="svelte-4q74qx" data-svelte-h="svelte-1m7o6yd">Other Stats</h3> <p class="svelte-4q74qx"><strong class="svelte-4q74qx" data-svelte-h="svelte-1o0h8zf">Lucky Roll:</strong> ${escape(character.luckyRoll.name)}: ${escape(character.luckyRoll.description)}: ${escape(dMod(character.luckyRoll.modifier))}</p> <h3 class="svelte-4q74qx" data-svelte-h="svelte-b2binz">Saving Throws</h3> <p class="svelte-4q74qx"><strong class="svelte-4q74qx" data-svelte-h="svelte-1mm30re">Fortitude:</strong> ${escape(dMod(character.fortitudeSave))}</p> <p class="svelte-4q74qx"><strong class="svelte-4q74qx" data-svelte-h="svelte-12gsxti">Reflex:</strong> ${escape(dMod(character.reflexSave))}</p> <p class="svelte-4q74qx"><strong class="svelte-4q74qx" data-svelte-h="svelte-10zp62h">Willpower:</strong> ${escape(dMod(character.willpowerSave))}</p> <h3 class="svelte-4q74qx" data-svelte-h="svelte-120avzz">Spellcasting</h3> <p class="svelte-4q74qx"><strong class="svelte-4q74qx" data-svelte-h="svelte-1oaq994">Spells Known:</strong> ${escape(spellsKnown)}</p> <p class="svelte-4q74qx"><strong class="svelte-4q74qx" data-svelte-h="svelte-5ct56d">Wizard Max Spell Level:</strong> ${escape(character.wizardMaxSpellLevel)}</p> <p class="svelte-4q74qx"><strong class="svelte-4q74qx" data-svelte-h="svelte-267j3q">Cleric Max Spell Level:</strong> ${escape(character.clericMaxSpellLevel)}</p> <h3 class="svelte-4q74qx" data-svelte-h="svelte-bqayn1">Weapons</h3> <ul class="svelte-4q74qx">${each(character.weapons, (weapon) => {
    return `<li class="svelte-4q74qx">${escape(weapon.name)}: ${escape(weapon.damage)} dmg, ${escape(weapon.range)} range</li>`;
  })}</ul> <h3 class="svelte-4q74qx" data-svelte-h="svelte-j2plrj">Languages</h3> <ul class="svelte-4q74qx">${each(character.languages, (language) => {
    return `<li class="svelte-4q74qx">${escape(language)}</li>`;
  })}</ul> <h3 class="svelte-4q74qx" data-svelte-h="svelte-dur2iy">Equipment</h3> <ul class="svelte-4q74qx">${each(character.equipment, (item) => {
    return `<li class="svelte-4q74qx">${escape(item.name)}</li>`;
  })}</ul> <h3 class="svelte-4q74qx" data-svelte-h="svelte-4whxcy">Special Rules</h3> <ul class="svelte-4q74qx">${each(character.specialRules, (rule) => {
    return `<li class="svelte-4q74qx">${escape(rule)}</li>`;
  })}</ul></section>`;
});

export { Page as default };
//# sourceMappingURL=_page.svelte-hoWve6io.js.map
