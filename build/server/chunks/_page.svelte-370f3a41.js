import { c as create_ssr_component, b as add_attribute, e as escape, f as each } from './ssr-93f4de0f.js';
import * as RND from '@ironarachne/rng';
import { v as valueToCoins } from './currency-388f888b.js';
import random from 'random';
import seedrandom from 'seedrandom';
import { a as roll } from './dice-dc54744c.js';
import './sentry-release-injection-file-2a50013d.js';
import * as Words from '@ironarachne/words';

class ADNDArmor {
  name;
  ac;
  weight;
  cost;
  constructor(name, ac, weight, cost) {
    this.name = name;
    this.ac = ac;
    this.weight = weight;
    this.cost = cost;
  }
}
class SpellFilter {
  name;
  level;
  casterClass;
  requiredTags;
  bannedTags;
  constructor(name = "", level = -1, casterClass = "", requiredTags = [], bannedTags = []) {
    this.name = name;
    this.level = level;
    this.casterClass = casterClass;
    this.requiredTags = requiredTags;
    this.bannedTags = bannedTags;
  }
}
class ADNDClass {
  name;
  group;
  hitDice;
  // dice expression
  minStrength;
  minDexterity;
  minConstitution;
  minIntelligence;
  minWisdom;
  minCharisma;
  abilities;
  primeRequisites;
  allowedAlignments;
  hasSpells;
  allowedSpellTypes;
  spellList;
  allowedWeapons;
  allowedArmor;
  initialWP;
  initialNWP;
  wpPenalty;
  apply;
  constructor(name, group, hitDice, minStrength, minDexterity, minConstitution, minIntelligence, minWisdom, minCharisma, primeRequisites, abilities, allowedAlignments, hasSpells, allowedSpellTypes, spellList, allowedWeapons = [], allowedArmor = [], initialWP, initialNWP, wpPenalty, apply) {
    this.name = name;
    this.group = group;
    this.hitDice = hitDice;
    this.minStrength = minStrength;
    this.minDexterity = minDexterity;
    this.minConstitution = minConstitution;
    this.minIntelligence = minIntelligence;
    this.minWisdom = minWisdom;
    this.minCharisma = minCharisma;
    this.abilities = abilities;
    this.primeRequisites = primeRequisites;
    this.allowedAlignments = allowedAlignments;
    this.hasSpells = hasSpells;
    this.allowedSpellTypes = allowedSpellTypes;
    this.spellList = spellList;
    this.allowedWeapons = allowedWeapons;
    this.allowedArmor = allowedArmor;
    this.initialWP = initialWP;
    this.initialNWP = initialNWP;
    this.wpPenalty = wpPenalty;
    this.apply = apply;
  }
}
class ADNDRace {
  name;
  adjective;
  apply;
  minStrength;
  maxStrength;
  minDexterity;
  maxDexterity;
  minConstitution;
  maxConstitution;
  minIntelligence;
  maxIntelligence;
  minWisdom;
  maxWisdom;
  minCharisma;
  maxCharisma;
  baseHeightMale;
  baseHeightFemale;
  baseWeightMale;
  baseWeightFemale;
  heightModifier;
  // dice expression
  weightModifier;
  // dice expression
  baseAge;
  baseMovement;
  ageModifier;
  // dice expression
  availableInitialLanguages;
  allowedClasses;
  constructor(name, adjective, apply, minStrength, maxStrength, minDexterity, maxDexterity, minConstitution, maxConstitution, minIntelligence, maxIntelligence, minWisdom, maxWisdom, minCharisma, maxCharisma, baseHeightMale, baseHeightFemale, baseWeightMale, baseWeightFemale, heightModifier, weightModifier, baseAge, baseMovement, ageModifier, availableInitialLanguages, allowedClasses) {
    this.name = name;
    this.adjective = adjective;
    this.apply = apply;
    this.minCharisma = minCharisma;
    this.maxCharisma = maxCharisma;
    this.minConstitution = minConstitution;
    this.maxConstitution = maxConstitution;
    this.minDexterity = minDexterity;
    this.maxDexterity = maxDexterity;
    this.minIntelligence = minIntelligence;
    this.maxIntelligence = maxIntelligence;
    this.minStrength = minStrength;
    this.maxStrength = maxStrength;
    this.minWisdom = minWisdom;
    this.maxWisdom = maxWisdom;
    this.heightModifier = heightModifier;
    this.baseHeightMale = baseHeightMale;
    this.baseHeightFemale = baseHeightFemale;
    this.baseWeightMale = baseWeightMale;
    this.baseWeightFemale = baseWeightFemale;
    this.heightModifier = heightModifier;
    this.weightModifier = weightModifier;
    this.baseAge = baseAge;
    this.baseMovement = baseMovement;
    this.ageModifier = ageModifier;
    this.name = name;
    this.availableInitialLanguages = availableInitialLanguages;
    this.allowedClasses = allowedClasses;
  }
}
class ADNDSpell {
  name;
  casterClass;
  level;
  tags;
  constructor(name, casterClass, level, tags) {
    this.name = name;
    this.casterClass = casterClass;
    this.level = level;
    this.tags = tags;
  }
}
class ADNDWeapon {
  name;
  damageType;
  // bludgeoning, piercing, slashing
  damageSM;
  // dice expression
  damageL;
  // dice expression
  cost;
  // in copper pieces
  weight;
  // in pounds
  size;
  // small, medium, large
  speedFactor;
  category;
  usesAmmo;
  constructor(name, cost, weight, size, damageType, speedFactor, damageSM, damageL, category, usesAmmo = false) {
    this.name = name;
    this.damageType = damageType;
    this.damageSM = damageSM;
    this.damageL = damageL;
    this.cost = cost;
    this.weight = weight;
    this.size = size;
    this.speedFactor = speedFactor;
    this.category = category;
    this.usesAmmo = usesAmmo;
  }
}
class ADNDCharacter {
  firstName;
  lastName;
  race;
  class;
  level;
  strength;
  exceptionalStrength;
  dexterity;
  constitution;
  intelligence;
  wisdom;
  charisma;
  age;
  height;
  weight;
  xp;
  hp;
  thaco;
  ac;
  currency;
  // in copper pieces
  hitProbability;
  damageAdjustment;
  weightAllowance;
  maxPress;
  openDoors;
  bendBarsLiftGates;
  reactionAdjustment;
  missileAttackAdjustment;
  defensiveAdjustment;
  hitPointAdjustment;
  warriorHitPointAdjustment;
  systemShock;
  resurrectionSurvival;
  poisonSave;
  regeneration;
  numberOfLanguages;
  spellLevel;
  chanceToLearnSpell;
  maximumNumberOfSpellsPerLevel;
  illusionImmunity;
  magicalDefenseAdjustment;
  bonusSpells;
  chanceOfSpellFailure;
  spellImmunity;
  maximumNumberOfHenchmen;
  loyaltyBase;
  npcReactionAdjustment;
  abilities;
  alignment;
  poisonSavingThrow;
  rodSavingThrow;
  petrificationSavingThrow;
  breathSavingThrow;
  spellSavingThrow;
  spells;
  armor;
  weapons;
  constructor() {
    this.firstName = "";
    this.lastName = "";
    this.level = 1;
    this.xp = 0;
    this.ac = 10;
    this.currency = 0;
    this.exceptionalStrength = -1;
    this.hitProbability = "normal";
    this.damageAdjustment = "none";
    this.regeneration = "nil";
    this.chanceToLearnSpell = -1;
    this.bonusSpells = [];
    this.spellImmunity = [];
    this.abilities = [];
    this.spells = [];
    this.armor = [];
    this.weapons = [];
  }
}
function getFilteredSpells(filter, spells) {
  let result = [];
  for (let i = 0; i < spells.length; i++) {
    let meetsLevelCriterion = false;
    let meetsClassCriterion = false;
    let meetsBannedTagsCriterion = false;
    let meetsRequiredTagsCriterion = false;
    if (filter.level != -1 && spells[i].level == filter.level || filter.level == -1) {
      meetsLevelCriterion = true;
    }
    if (filter.casterClass == spells[i].casterClass) {
      meetsClassCriterion = true;
    }
    if (filter.bannedTags.length > 0) {
      let countOfBannedTags = 0;
      for (let j = 0; j < filter.bannedTags.length; j++) {
        if (spells[i].tags.indexOf(filter.bannedTags[j]) != -1) {
          countOfBannedTags++;
        }
      }
      if (countOfBannedTags == 0) {
        meetsBannedTagsCriterion = true;
      }
    } else {
      meetsBannedTagsCriterion = true;
    }
    if (filter.requiredTags.length > 0) {
      for (let j = 0; j < filter.requiredTags.length; j++) {
        if (spells[i].tags.indexOf(filter.requiredTags[j]) != -1) {
          meetsRequiredTagsCriterion = true;
        }
      }
    } else {
      meetsRequiredTagsCriterion = true;
    }
    if (meetsLevelCriterion && meetsClassCriterion && meetsBannedTagsCriterion && meetsRequiredTagsCriterion) {
      result.push(spells[i]);
    }
  }
  return result;
}
function getAll$2() {
  return [
    new ADNDSpell("Animal Friendship", "priest", 1, ["animal", "enchantment", "charm"]),
    new ADNDSpell("Bless", "priest", 1, ["conjuration", "summoning", "all"]),
    new ADNDSpell("Combine", "priest", 1, ["evocation", "all"]),
    new ADNDSpell("Command", "priest", 1, ["enchantment", "charm"]),
    new ADNDSpell("Create Water", "priest", 1, ["alteration", "elemental", "water"]),
    new ADNDSpell("Cure Light Wounds", "priest", 1, ["necromancy", "healing"]),
    new ADNDSpell("Detect Evil", "priest", 1, ["divination", "all"]),
    new ADNDSpell("Detect Magic", "priest", 1, ["divination"]),
    new ADNDSpell("Detect Poison", "priest", 1, ["divination"]),
    new ADNDSpell("Detect Snares and Pits", "priest", 1, ["divination"]),
    new ADNDSpell("Endure Cold/Endure Heat", "priest", 1, ["alteration", "protection"]),
    new ADNDSpell("Entangle", "priest", 1, ["alteration", "plant"]),
    new ADNDSpell("Faerie Fire", "priest", 1, ["alteration", "weather"]),
    new ADNDSpell("Invisibility to Animals", "priest", 1, ["alteration", "animal"]),
    new ADNDSpell("Invisibility to Undead", "priest", 1, ["abjuration", "necromantic"]),
    new ADNDSpell("Light", "priest", 1, ["alteration", "sun"]),
    new ADNDSpell("Locate Animals or Plants", "priest", 1, ["divination", "animal", "plant"]),
    new ADNDSpell("Magical Stone", "priest", 1, ["enchantment", "combat"]),
    new ADNDSpell("Pass without Trace", "priest", 1, ["enchantment", "charm", "plant"]),
    new ADNDSpell("Protection from Evil", "priest", 1, ["abjuration", "protection"]),
    new ADNDSpell("Purify Food and Drink", "priest", 1, ["alteration", "all"]),
    new ADNDSpell("Remove Fear", "priest", 1, ["abjuration", "charm"]),
    new ADNDSpell("Sanctuary", "priest", 1, ["abjuration", "protection"]),
    new ADNDSpell("Shillelagh", "priest", 1, ["alteration", "combat", "plant"]),
    new ADNDSpell("Affect Normal Fires", "wizard", 1, ["alteration"]),
    new ADNDSpell("Alarm", "wizard", 1, ["abjuration", "evocation"]),
    new ADNDSpell("Armor", "wizard", 1, ["conjuration"]),
    new ADNDSpell("Audible Glamer", "wizard", 1, ["illusion", "phantasm"]),
    new ADNDSpell("Burning Hands", "wizard", 1, ["alteration"]),
    new ADNDSpell("Cantrip", "wizard", 1, ["all"]),
    new ADNDSpell("Change Self", "wizard", 1, ["illusion", "phantasm"]),
    new ADNDSpell("Charm Person", "wizard", 1, ["enchantment", "charm"]),
    new ADNDSpell("Chill Touch", "wizard", 1, ["necromancy"]),
    new ADNDSpell("Color Spray", "wizard", 1, ["alteration"]),
    new ADNDSpell("Comprehend Languages", "wizard", 1, ["alteration"]),
    new ADNDSpell("Dancing Lights", "wizard", 1, ["alteration"]),
    new ADNDSpell("Detect Magic", "wizard", 1, ["divination"]),
    new ADNDSpell("Detect Undead", "wizard", 1, ["divination", "necromancy"]),
    new ADNDSpell("Enlarge", "wizard", 1, ["alteration"]),
    new ADNDSpell("Erase", "wizard", 1, ["alteration"]),
    new ADNDSpell("Feather Fall", "wizard", 1, ["alteration"]),
    new ADNDSpell("Find Familiar", "wizard", 1, ["conjuration", "summoning"]),
    new ADNDSpell("Friends", "wizard", 1, ["enchantment", "charm"]),
    new ADNDSpell("Gaze Reflection", "wizard", 1, ["alteration"]),
    new ADNDSpell("Grease", "wizard", 1, ["conjuration"]),
    new ADNDSpell("Hold Portal", "wizard", 1, ["alteration"]),
    new ADNDSpell("Hypnotism", "wizard", 1, ["enchantment", "charm"]),
    new ADNDSpell("Identify", "wizard", 1, ["divination"]),
    new ADNDSpell("Jump", "wizard", 1, ["alteration"]),
    new ADNDSpell("Light", "wizard", 1, ["alteration"]),
    new ADNDSpell("Magic Missile", "wizard", 1, ["evocation"]),
    new ADNDSpell("Mending", "wizard", 1, ["alteration"]),
    new ADNDSpell("Message", "wizard", 1, ["alteration"]),
    new ADNDSpell("Mount", "wizard", 1, ["conjuration", "summoning"]),
    new ADNDSpell("Nystul's Magic Aura", "wizard", 1, ["illusion", "phantasm"]),
    new ADNDSpell("Phantasmal Force", "wizard", 1, ["illusion", "phantasm"]),
    new ADNDSpell("Protection from Evil", "wizard", 1, ["abjuration"]),
    new ADNDSpell("Read Magic", "wizard", 1, ["divination"]),
    new ADNDSpell("Shield", "wizard", 1, ["evocation"]),
    new ADNDSpell("Shocking Grasp", "wizard", 1, ["alteration"]),
    new ADNDSpell("Sleep", "wizard", 1, ["enchantment", "charm"]),
    new ADNDSpell("Spider Climb", "wizard", 1, ["alteration"]),
    new ADNDSpell("Spook", "wizard", 1, ["illusion", "phantasm"]),
    new ADNDSpell("Taunt", "wizard", 1, ["enchantment"]),
    new ADNDSpell("Tenser's Floating Disk", "wizard", 1, ["evocation"]),
    new ADNDSpell("Unseen Servant", "wizard", 1, ["conjuration"]),
    new ADNDSpell("Ventriloquism", "wizard", 1, ["illusion", "phantasm"]),
    new ADNDSpell("Wall of Fog", "wizard", 1, ["evocation"]),
    new ADNDSpell("Wizard Mark", "wizard", 1, ["alteration"])
  ];
}
const abjurer = new ADNDClass(
  "abjurer",
  "wizard",
  "1d4",
  -1,
  -1,
  -1,
  9,
  15,
  -1,
  ["intelligence"],
  ["Create magical items", "Cast wizard spells"],
  [
    "lawful good",
    "lawful neutral",
    "lawful evil",
    "neutral good",
    "true neutral",
    "neutral evil",
    "chaotic evil",
    "chaotic neutral",
    "chaotic good"
  ],
  true,
  ["wizard"],
  [
    {
      filter: new SpellFilter("", 1, "wizard", ["abjuration"], []),
      count: 1
    },
    {
      filter: new SpellFilter("", 1, "wizard", [], ["alteration", "illusion"]),
      count: 1
    }
  ],
  ["dagger", "staff", "dart", "knife", "sling"],
  ["none"],
  1,
  4,
  -5,
  function(character) {
    let allSpells = getAll$2();
    for (let i = 0; i < this.spellList.length; i++) {
      let filteredSpells = getFilteredSpells(this.spellList[i].filter, allSpells);
      filteredSpells = RND.shuffle(filteredSpells);
      for (let j = 0; j < this.spellList[i].count; j++) {
        character.spells.push(filteredSpells.pop());
      }
    }
    return character;
  }
);
function distributePoints(skillList, extraPoints) {
  while (extraPoints > 0) {
    let skillIndex = random.int(0, skillList.length - 1);
    let skill = skillList[skillIndex];
    if (skill.points < 30) {
      let cap = 30 - skill.points > 30 ? 30 : 30 - skill.points;
      let points = random.int(1, cap);
      skill.points += points;
      extraPoints -= points;
    }
  }
  return skillList;
}
function modifyForDexterity(skillList, dexterity) {
  let dexterityAdjustments = {
    9: {
      "Pick Pockets": -15,
      "Open Locks": -10,
      "Find/Remove Traps": -10,
      "Move Silently": -20,
      "Hide in Shadows": -10,
      "Detect Noise": 0,
      "Climb Walls": 0,
      "Read Languages": 0
    },
    10: {
      "Pick Pockets": -10,
      "Open Locks": -5,
      "Find/Remove Traps": -10,
      "Move Silently": -15,
      "Hide in Shadows": -5,
      "Detect Noise": 0,
      "Climb Walls": 0,
      "Read Languages": 0
    },
    11: {
      "Pick Pockets": -5,
      "Open Locks": 0,
      "Find/Remove Traps": -5,
      "Move Silently": -10,
      "Hide in Shadows": 0,
      "Detect Noise": 0,
      "Climb Walls": 0,
      "Read Languages": 0
    },
    12: {
      "Pick Pockets": 0,
      "Open Locks": 0,
      "Find/Remove Traps": 0,
      "Move Silently": -5,
      "Hide in Shadows": 0,
      "Detect Noise": 0,
      "Climb Walls": 0,
      "Read Languages": 0
    },
    13: {
      "Pick Pockets": 0,
      "Open Locks": 0,
      "Find/Remove Traps": 0,
      "Move Silently": 0,
      "Hide in Shadows": 0,
      "Detect Noise": 0,
      "Climb Walls": 0,
      "Read Languages": 0
    },
    14: {
      "Pick Pockets": 0,
      "Open Locks": 0,
      "Find/Remove Traps": 0,
      "Move Silently": 0,
      "Hide in Shadows": 0,
      "Detect Noise": 0,
      "Climb Walls": 0,
      "Read Languages": 0
    },
    15: {
      "Pick Pockets": 0,
      "Open Locks": 0,
      "Find/Remove Traps": 0,
      "Move Silently": 0,
      "Hide in Shadows": 0,
      "Detect Noise": 0,
      "Climb Walls": 0,
      "Read Languages": 0
    },
    16: {
      "Pick Pockets": 0,
      "Open Locks": 5,
      "Find/Remove Traps": 0,
      "Move Silently": 0,
      "Hide in Shadows": 0,
      "Detect Noise": 0,
      "Climb Walls": 0,
      "Read Languages": 0
    },
    17: {
      "Pick Pockets": 5,
      "Open Locks": 10,
      "Find/Remove Traps": 0,
      "Move Silently": 5,
      "Hide in Shadows": 5,
      "Detect Noise": 0,
      "Climb Walls": 0,
      "Read Languages": 0
    },
    18: {
      "Pick Pockets": 10,
      "Open Locks": 15,
      "Find/Remove Traps": 5,
      "Move Silently": 10,
      "Hide in Shadows": 10,
      "Detect Noise": 0,
      "Climb Walls": 0,
      "Read Languages": 0
    },
    19: {
      "Pick Pockets": 15,
      "Open Locks": 20,
      "Find/Remove Traps": 10,
      "Move Silently": 15,
      "Hide in Shadows": 15,
      "Detect Noise": 0,
      "Climb Walls": 0,
      "Read Languages": 0
    }
  };
  for (let i = 0; i < skillList.length; i++) {
    skillList[i].value += dexterityAdjustments[dexterity][skillList[i].name];
  }
  return skillList;
}
function modifyForRace(skillList, raceName) {
  let racialAdjustments = {
    dwarf: {
      "Pick Pockets": 0,
      "Open Locks": 10,
      "Find/Remove Traps": 15,
      "Move Silently": 0,
      "Hide in Shadows": 0,
      "Detect Noise": 0,
      "Climb Walls": -10,
      "Read Languages": -5
    },
    elf: {
      "Pick Pockets": 5,
      "Open Locks": -5,
      "Find/Remove Traps": 0,
      "Move Silently": 5,
      "Hide in Shadows": 10,
      "Detect Noise": 5,
      "Climb Walls": 0,
      "Read Languages": 0
    },
    gnome: {
      "Pick Pockets": 0,
      "Open Locks": 5,
      "Find/Remove Traps": 10,
      "Move Silently": 5,
      "Hide in Shadows": 5,
      "Detect Noise": 10,
      "Climb Walls": -15,
      "Read Languages": 0
    },
    halfling: {
      "Pick Pockets": 5,
      "Open Locks": 5,
      "Find/Remove Traps": 5,
      "Move Silently": 10,
      "Hide in Shadows": 15,
      "Detect Noise": 5,
      "Climb Walls": -15,
      "Read Languages": -5
    },
    "half-elf": {
      "Pick Pockets": 10,
      "Open Locks": 0,
      "Find/Remove Traps": 0,
      "Move Silently": 0,
      "Hide in Shadows": 5,
      "Detect Noise": 0,
      "Climb Walls": 0,
      "Read Languages": 0
    },
    human: {
      "Pick Pockets": 0,
      "Open Locks": 0,
      "Find/Remove Traps": 0,
      "Move Silently": 0,
      "Hide in Shadows": 0,
      "Detect Noise": 0,
      "Climb Walls": 0,
      "Read Languages": 0
    }
  };
  for (let i = 0; i < skillList.length; i++) {
    skillList[i].value += racialAdjustments[raceName][skillList[i].name];
  }
  return skillList;
}
const bard = new ADNDClass(
  "bard",
  "rogue",
  "1d6",
  -1,
  12,
  -1,
  13,
  -1,
  15,
  ["dexterity", "charisma"],
  ["Climb walls", "Detect noise", "Pick pockets", "Read languages", "Influence reactions"],
  ["lawful neutral", "neutral good", "true neutral", "neutral evil", "chaotic neutral"],
  false,
  [],
  [],
  ["any"],
  ["padded", "leather", "studded leather", "chain mail"],
  2,
  3,
  -3,
  function(character) {
    let skills = [
      { name: "Pick Pockets", value: 10, points: 0 },
      { name: "Detect Noise", value: 20, points: 0 },
      { name: "Climb Walls", value: 50, points: 0 },
      { name: "Read Languages", value: 5, points: 0 }
    ];
    skills = RND.shuffle(skills);
    skills = modifyForDexterity(skills, character.dexterity);
    let raceName = character.race.name;
    if (character.race.name.includes("halfling")) {
      raceName = "halfling";
    }
    skills = modifyForRace(skills, raceName);
    skills = distributePoints(skills, 20);
    for (let i = 0; i < skills.length; i++) {
      character.abilities.push(`${skills[i].name}: ${skills[i].value}%`);
    }
    return character;
  }
);
const cleric = new ADNDClass(
  "cleric",
  "priest",
  "1d8",
  -1,
  -1,
  -1,
  -1,
  9,
  -1,
  ["wisdom"],
  ["Cast priest spells", "Turn undead"],
  [
    "lawful good",
    "lawful neutral",
    "lawful evil",
    "neutral good",
    "true neutral",
    "neutral evil",
    "chaotic evil",
    "chaotic neutral",
    "chaotic good"
  ],
  true,
  ["priest"],
  [
    {
      filter: new SpellFilter("", 1, "priest", [], ["plant", "animal", "weather", "elemental"]),
      count: 1
    }
  ],
  ["bludgeoning"],
  ["any"],
  2,
  4,
  -3,
  function(character) {
    let allSpells = getAll$2();
    for (let i = 0; i < this.spellList.length; i++) {
      let filteredSpells = getFilteredSpells(this.spellList[i].filter, allSpells);
      filteredSpells = RND.shuffle(filteredSpells);
      for (let j = 0; j < this.spellList[i].count; j++) {
        let filteredSpell = filteredSpells.pop();
        if (filteredSpell === void 0) {
          throw new Error("Spell is undefined.");
        }
        character.spells.push(filteredSpell);
      }
    }
    return character;
  }
);
const conjurer = new ADNDClass(
  "conjurer",
  "wizard",
  "1d4",
  -1,
  -1,
  15,
  9,
  -1,
  -1,
  ["intelligence"],
  ["Create magical items", "Cast wizard spells"],
  [
    "lawful good",
    "lawful neutral",
    "lawful evil",
    "neutral good",
    "true neutral",
    "neutral evil",
    "chaotic evil",
    "chaotic neutral",
    "chaotic good"
  ],
  true,
  ["wizard"],
  [
    {
      filter: new SpellFilter("", 1, "wizard", ["conjuration", "summoning"], []),
      count: 1
    },
    {
      filter: new SpellFilter(
        "",
        1,
        "wizard",
        [],
        ["greater divination", "invocation", "evocation"]
      ),
      count: 1
    }
  ],
  ["dagger", "staff", "dart", "knife", "sling"],
  ["none"],
  1,
  4,
  -5,
  function(character) {
    let allSpells = getAll$2();
    for (let i = 0; i < this.spellList.length; i++) {
      let filteredSpells = getFilteredSpells(this.spellList[i].filter, allSpells);
      filteredSpells = RND.shuffle(filteredSpells);
      for (let j = 0; j < this.spellList[i].count; j++) {
        let filteredSpell = filteredSpells.pop();
        if (filteredSpell === void 0) {
          throw new Error("Spell is undefined.");
        }
        character.spells.push(filteredSpell);
      }
    }
    return character;
  }
);
const diviner = new ADNDClass(
  "diviner",
  "wizard",
  "1d4",
  -1,
  -1,
  -1,
  9,
  16,
  -1,
  ["intelligence"],
  ["Create magical items", "Cast wizard spells"],
  [
    "lawful good",
    "lawful neutral",
    "lawful evil",
    "neutral good",
    "true neutral",
    "neutral evil",
    "chaotic evil",
    "chaotic neutral",
    "chaotic good"
  ],
  true,
  ["wizard"],
  [
    {
      filter: new SpellFilter("", 1, "wizard", ["divination"], []),
      count: 1
    },
    {
      filter: new SpellFilter("", 1, "wizard", [], ["conjuration", "summoning"]),
      count: 1
    }
  ],
  ["dagger", "staff", "dart", "knife", "sling"],
  ["none"],
  1,
  4,
  -5,
  function(character) {
    let allSpells = getAll$2();
    for (let i = 0; i < this.spellList.length; i++) {
      let filteredSpells = getFilteredSpells(this.spellList[i].filter, allSpells);
      filteredSpells = RND.shuffle(filteredSpells);
      for (let j = 0; j < this.spellList[i].count; j++) {
        let filteredSpell = filteredSpells.pop();
        if (filteredSpell === void 0) {
          throw new Error("Spell is undefined.");
        }
        character.spells.push(filteredSpell);
      }
    }
    return character;
  }
);
const druid = new ADNDClass(
  "druid",
  "priest",
  "1d8",
  -1,
  -1,
  -1,
  -1,
  12,
  15,
  ["wisdom"],
  [
    "Cast priest spells",
    "Speak druidic",
    "+2 bonus to saving throws vs. fire or electrical attacks"
  ],
  [
    "lawful good",
    "lawful neutral",
    "lawful evil",
    "neutral good",
    "true neutral",
    "neutral evil",
    "chaotic evil",
    "chaotic neutral",
    "chaotic good"
  ],
  true,
  ["priest"],
  [
    {
      filter: new SpellFilter(
        "",
        1,
        "priest",
        ["plant", "animal", "healing", "weather", "elemental"],
        []
      ),
      count: 1
    }
  ],
  ["club", "sickle", "spear", "scimitar", "dagger", "staff", "dart", "sling"],
  ["leather", "studded leather", "wooden shield"],
  2,
  4,
  -3,
  function(character) {
    let allSpells = getAll$2();
    for (let i = 0; i < this.spellList.length; i++) {
      let filteredSpells = getFilteredSpells(this.spellList[i].filter, allSpells);
      filteredSpells = RND.shuffle(filteredSpells);
      for (let j = 0; j < this.spellList[i].count; j++) {
        let filteredSpell = filteredSpells.pop();
        if (filteredSpell === void 0) {
          throw new Error("Spell is undefined.");
        }
        character.spells.push(filteredSpell);
      }
    }
    return character;
  }
);
const enchanter = new ADNDClass(
  "enchanter",
  "wizard",
  "1d4",
  -1,
  -1,
  -1,
  9,
  -1,
  16,
  ["intelligence"],
  ["Create magical items", "Cast wizard spells"],
  [
    "lawful good",
    "lawful neutral",
    "lawful evil",
    "neutral good",
    "true neutral",
    "neutral evil",
    "chaotic evil",
    "chaotic neutral",
    "chaotic good"
  ],
  true,
  ["wizard"],
  [
    {
      filter: new SpellFilter("", 1, "wizard", ["enchantment", "charm"], []),
      count: 1
    },
    {
      filter: new SpellFilter("", 1, "wizard", [], ["invocation", "evocation", "necromancy"]),
      count: 1
    }
  ],
  ["dagger", "staff", "dart", "knife", "sling"],
  ["none"],
  1,
  4,
  -5,
  function(character) {
    let allSpells = getAll$2();
    for (let i = 0; i < this.spellList.length; i++) {
      let filteredSpells = getFilteredSpells(this.spellList[i].filter, allSpells);
      filteredSpells = RND.shuffle(filteredSpells);
      for (let j = 0; j < this.spellList[i].count; j++) {
        let filteredSpell = filteredSpells.pop();
        if (filteredSpell === void 0) {
          throw new Error("Spell is undefined.");
        }
        character.spells.push(filteredSpell);
      }
    }
    return character;
  }
);
const fighter = new ADNDClass(
  "fighter",
  "warrior",
  "1d10",
  9,
  -1,
  -1,
  -1,
  -1,
  -1,
  ["strength"],
  [],
  [
    "lawful good",
    "lawful neutral",
    "lawful evil",
    "neutral good",
    "true neutral",
    "neutral evil",
    "chaotic evil",
    "chaotic neutral",
    "chaotic good"
  ],
  false,
  [],
  [],
  ["any"],
  ["any"],
  4,
  3,
  -2,
  function(character) {
    return character;
  }
);
const illusionist = new ADNDClass(
  "illusionist",
  "wizard",
  "1d4",
  -1,
  16,
  -1,
  9,
  -1,
  -1,
  ["intelligence"],
  [
    "Create magical items",
    "Cast wizard spells (other than abjuration, invocation, evocation, or necromancy)"
  ],
  [
    "lawful good",
    "lawful neutral",
    "lawful evil",
    "neutral good",
    "true neutral",
    "neutral evil",
    "chaotic evil",
    "chaotic neutral",
    "chaotic good"
  ],
  true,
  ["wizard"],
  [
    {
      filter: new SpellFilter("", 1, "wizard", ["illusion"], []),
      count: 1
    },
    {
      filter: new SpellFilter(
        "",
        1,
        "wizard",
        [],
        ["abjuration", "invocation", "evocation", "necromancy"]
      ),
      count: 1
    }
  ],
  ["dagger", "staff", "dart", "knife", "sling"],
  ["none"],
  1,
  4,
  -5,
  function(character) {
    let allSpells = getAll$2();
    for (let i = 0; i < this.spellList.length; i++) {
      let filteredSpells = getFilteredSpells(this.spellList[i].filter, allSpells);
      filteredSpells = RND.shuffle(filteredSpells);
      for (let j = 0; j < this.spellList[i].count; j++) {
        let filteredSpell = filteredSpells.pop();
        if (filteredSpell === void 0) {
          throw new Error("Spell is undefined.");
        }
        character.spells.push(filteredSpell);
      }
    }
    return character;
  }
);
const invoker = new ADNDClass(
  "invoker",
  "wizard",
  "1d4",
  -1,
  -1,
  16,
  9,
  -1,
  -1,
  ["intelligence"],
  [
    "Create magical items",
    "Cast wizard spells (other than enchantment, charm, conjuration, or summoning)"
  ],
  [
    "lawful good",
    "lawful neutral",
    "lawful evil",
    "neutral good",
    "true neutral",
    "neutral evil",
    "chaotic evil",
    "chaotic neutral",
    "chaotic good"
  ],
  true,
  ["wizard"],
  [
    {
      filter: new SpellFilter("", 1, "wizard", ["invocation", "evocation"], []),
      count: 1
    },
    {
      filter: new SpellFilter(
        "",
        1,
        "wizard",
        [],
        ["enchantment", "charm", "conjuration", "summoning"]
      ),
      count: 1
    }
  ],
  ["dagger", "staff", "dart", "knife", "sling"],
  ["none"],
  1,
  4,
  -5,
  function(character) {
    let allSpells = getAll$2();
    for (let i = 0; i < this.spellList.length; i++) {
      let filteredSpells = getFilteredSpells(this.spellList[i].filter, allSpells);
      filteredSpells = RND.shuffle(filteredSpells);
      for (let j = 0; j < this.spellList[i].count; j++) {
        let filteredSpell = filteredSpells.pop();
        if (filteredSpell === void 0) {
          throw new Error("Spell is undefined.");
        }
        character.spells.push(filteredSpell);
      }
    }
    return character;
  }
);
const mage = new ADNDClass(
  "mage",
  "wizard",
  "1d4",
  -1,
  -1,
  -1,
  9,
  -1,
  -1,
  ["intelligence"],
  ["Create magical items", "Cast wizard spells"],
  [
    "lawful good",
    "lawful neutral",
    "lawful evil",
    "neutral good",
    "true neutral",
    "neutral evil",
    "chaotic evil",
    "chaotic neutral",
    "chaotic good"
  ],
  true,
  ["wizard"],
  [
    {
      filter: new SpellFilter("", 1, "wizard", [], []),
      count: 1
    }
  ],
  ["dagger", "staff", "dart", "knife", "sling"],
  ["none"],
  1,
  4,
  -5,
  function(character) {
    let allSpells = getAll$2();
    for (let i = 0; i < this.spellList.length; i++) {
      let filteredSpells = getFilteredSpells(this.spellList[i].filter, allSpells);
      filteredSpells = RND.shuffle(filteredSpells);
      for (let j = 0; j < this.spellList[i].count; j++) {
        let filteredSpell = filteredSpells.pop();
        if (filteredSpell === void 0) {
          throw new Error("Spell is undefined.");
        }
        character.spells.push(filteredSpell);
      }
    }
    return character;
  }
);
const necromancer = new ADNDClass(
  "necromancer",
  "wizard",
  "1d4",
  -1,
  -1,
  -1,
  9,
  16,
  -1,
  ["intelligence"],
  ["Create magical items", "Cast wizard spells (other than illusion, enchantment, or charm)"],
  [
    "lawful good",
    "lawful neutral",
    "lawful evil",
    "neutral good",
    "true neutral",
    "neutral evil",
    "chaotic evil",
    "chaotic neutral",
    "chaotic good"
  ],
  true,
  ["wizard"],
  [
    {
      filter: new SpellFilter("", 1, "wizard", ["necromancy"], []),
      count: 1
    },
    {
      filter: new SpellFilter("", 1, "wizard", [], ["enchantment", "charm", "illusion"]),
      count: 1
    }
  ],
  ["dagger", "staff", "dart", "knife", "sling"],
  ["none"],
  1,
  4,
  -5,
  function(character) {
    let allSpells = getAll$2();
    for (let i = 0; i < this.spellList.length; i++) {
      let filteredSpells = getFilteredSpells(this.spellList[i].filter, allSpells);
      filteredSpells = RND.shuffle(filteredSpells);
      for (let j = 0; j < this.spellList[i].count; j++) {
        let filteredSpell = filteredSpells.pop();
        if (filteredSpell === void 0) {
          throw new Error("Spell is undefined.");
        }
        character.spells.push(filteredSpell);
      }
    }
    return character;
  }
);
const paladin = new ADNDClass(
  "paladin",
  "warrior",
  "1d10",
  12,
  -1,
  9,
  -1,
  13,
  17,
  ["strength", "charisma"],
  [
    "Detect the presence of evil intent within 60'",
    "+2 bonus to all saving throws",
    "Immune to all diseases",
    "Heal by laying on hands (2 HP), once per day",
    "Cure all dieases, once per week",
    "10' aura of protection: all summoned and specifically evil creatures within the radius suffer -1 to their attack rolls",
    "If wielding an unsheathed holy sword, project a 10' circle of power that dispels hostile magic up to the paladin's experience level",
    "May not possess more than 10 magical items",
    "Never retains wealth; all excess must be donated to the church or a worthy cause",
    "Must tithe 10% of all income to the paladin's institution",
    "May only employ lawful good henchmen"
  ],
  ["lawful good"],
  false,
  [],
  [],
  ["any"],
  ["any"],
  4,
  3,
  -2,
  function(character) {
    return character;
  }
);
const ranger = new ADNDClass(
  "ranger",
  "warrior",
  "1d10",
  13,
  13,
  14,
  -1,
  14,
  -1,
  ["strength", "dexterity", "wisdom"],
  [
    "When wearing studded leather or lighter armor, fight two-handed with no penalty",
    "Tracking proficiency",
    "When wearing studded leather or lighter armor, 10% chance to move silently",
    "When wearing studded leather or lighter armor, 15% chance to hide in shadows",
    "Adept with both trained and untamed creatures"
  ],
  ["lawful good", "neutral good", "chaotic good"],
  false,
  [],
  [],
  ["any"],
  ["any"],
  4,
  3,
  -2,
  function(character) {
    return character;
  }
);
const thief = new ADNDClass(
  "thief",
  "rogue",
  "1d6",
  -1,
  9,
  -1,
  -1,
  -1,
  -1,
  ["dexterity"],
  [
    "Pick pockets",
    "Open locks",
    "Find/remove traps",
    "Move silently",
    "Hide in shadows",
    "Detect noise",
    "Climb walls",
    "Read languages",
    "Backstab",
    "Thieves' cant"
  ],
  [
    "lawful neutral",
    "lawful evil",
    "neutral good",
    "true neutral",
    "neutral evil",
    "chaotic evil",
    "chaotic neutral",
    "chaotic good"
  ],
  false,
  [],
  [],
  [
    "club",
    "dagger",
    "hand crossbow",
    "lasso",
    "short bow",
    "broad sword",
    "long sword",
    "short sword",
    "staff",
    "dart",
    "knife",
    "sling"
  ],
  ["leather", "studded leather", "padded", "elven chain armor"],
  2,
  3,
  -3,
  function(character) {
    let skills = [
      { name: "Pick Pockets", value: 15, points: 0 },
      { name: "Open Locks", value: 10, points: 0 },
      { name: "Find/Remove Traps", value: 5, points: 0 },
      { name: "Move Silently", value: 10, points: 0 },
      { name: "Hide in Shadows", value: 5, points: 0 },
      { name: "Detect Noise", value: 15, points: 0 },
      { name: "Climb Walls", value: 60, points: 0 },
      { name: "Read Languages", value: 0, points: 0 }
    ];
    skills = RND.shuffle(skills);
    skills = modifyForDexterity(skills, character.dexterity);
    let raceName = character.race.name;
    if (character.race.name.includes("halfling")) {
      raceName = "halfling";
    }
    skills = modifyForRace(skills, raceName);
    skills = distributePoints(skills, 60);
    for (let i = 0; i < skills.length; i++) {
      character.abilities.push(`${skills[i].name}: ${skills[i].value}%`);
    }
    return character;
  }
);
const transmuter = new ADNDClass(
  "transmuter",
  "wizard",
  "1d4",
  -1,
  15,
  -1,
  9,
  -1,
  -1,
  ["intelligence"],
  ["Create magical items", "Cast wizard spells (other than abjuration or necromancy)"],
  [
    "lawful good",
    "lawful neutral",
    "lawful evil",
    "neutral good",
    "true neutral",
    "neutral evil",
    "chaotic evil",
    "chaotic neutral",
    "chaotic good"
  ],
  true,
  ["wizard"],
  [
    {
      filter: new SpellFilter("", 1, "wizard", ["transmutation"], []),
      count: 1
    },
    {
      filter: new SpellFilter("", 1, "wizard", [], ["abjuration", "necromancy"]),
      count: 1
    }
  ],
  ["dagger", "staff", "dart", "knife", "sling"],
  ["none"],
  1,
  4,
  -5,
  function(character) {
    let allSpells = getAll$2();
    for (let i = 0; i < this.spellList.length; i++) {
      let filteredSpells = getFilteredSpells(this.spellList[i].filter, allSpells);
      filteredSpells = RND.shuffle(filteredSpells);
      for (let j = 0; j < this.spellList[i].count; j++) {
        let filteredSpell = filteredSpells.pop();
        if (filteredSpell === void 0) {
          throw new Error("Spell is undefined.");
        }
        character.spells.push(filteredSpell);
      }
    }
    return character;
  }
);
function getAll$1() {
  return [
    abjurer,
    bard,
    cleric,
    conjurer,
    diviner,
    druid,
    enchanter,
    fighter,
    illusionist,
    invoker,
    mage,
    necromancer,
    paladin,
    ranger,
    thief,
    transmuter
  ];
}
const dwarf = new ADNDRace(
  "dwarf",
  "dwarven",
  function(character) {
    character.constitution += 1;
    character.charisma -= 1;
    character.abilities.push("20% chance of magical item malfunction");
    character.abilities.push("+1 to hit orcs, half-orcs, goblins, and hobgoblins");
    character.abilities.push(
      "-4 to attack rolls made on the character by ogres, trolls, ogre magi, giants, and titans"
    );
    character.abilities.push("Infravision (60')");
    character.abilities.push("Within 10', detect grade or slope in passage with 1-5 on 1d6");
    character.abilities.push("Within 10', detect new tunnel/passage construction with 1-5 on 1d6");
    character.abilities.push("Within 10', detect sliding/shifting walls or rooms with 1-4 on 1d6");
    character.abilities.push(
      "Within 10', detect stonework traps, pits, and deadfalls with 1-3 on 1d6"
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
  ["cleric", "fighter", "thief"]
);
const elf = new ADNDRace(
  "elf",
  "elven",
  function(character) {
    character.dexterity += 1;
    character.constitution -= 1;
    character.abilities.push("90% resistance to sleep spell and all charm-related spells");
    character.abilities.push("+1 to hit with all bows other than crossbow");
    character.abilities.push("+1 to hit with short or long swords");
    character.abilities.push("Infravision (60')");
    character.abilities.push("Notice secret door with 1 on 1d6 when passing within 10 feet");
    character.abilities.push("Find secret door when actively searching with 1-2 on 1d6");
    character.abilities.push("Find concealed portal when actively searching with 1-3 on 1d6");
    character.abilities.push(
      "When not wearing metal armor, and either alone or with other elves/halflings not in metal armor, gain a bonus to surprise opponents. Those opponents have a -4 penalty to their surprise die rolls, or a -2 penalty if the elf has to open a door or screen to attack."
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
  ["cleric", "fighter", "mage", "ranger", "thief"]
);
const gnome = new ADNDRace(
  "gnome",
  "gnomish",
  function(character) {
    character.intelligence += 1;
    character.wisdom -= 1;
    character.abilities.push(
      "20% chance of magical item malfunction, except weapons, armor, shields, and illusionist items (and, if the gnome is a thief, items that duplicate thieving abilities)"
    );
    character.abilities.push("+1 to hit kobolds or goblins");
    character.abilities.push(
      "When gnolls, bugbears, ogres, trolls, ogre magi, giants, or titans attack gnomes, subtract -4 from their attack rolls"
    );
    character.abilities.push("Infravision (60')");
    character.abilities.push("Within 10', detect grade or slope in passages with 1-5 on 1d6");
    character.abilities.push(
      "Within 10', detect unsafe walls, ceiling, and floors with 1-7 on 1d10"
    );
    character.abilities.push("Determine approximate depth underground with 1-4 on 1d6");
    character.abilities.push(
      "Within 10', determine approximate direction underground with 1-3 on 1d6"
    );
    return character;
  },
  6,
  18,
  3,
  18,
  8,
  18,
  6,
  18,
  3,
  18,
  3,
  18,
  38,
  36,
  72,
  68,
  "1d6",
  "5d4",
  60,
  6,
  "3d12",
  ["common", "gnome", "dwarf", "halfling", "goblin", "kobold", "burrowing mammal"],
  ["cleric", "fighter", "illusionist", "thief"]
);
const halfelf = new ADNDRace(
  "half-elf",
  "half-elven",
  function(character) {
    character.abilities.push("30% resistance to sleep spell and all charm-related spells");
    character.abilities.push("Infravision (60')");
    character.abilities.push("Notice secret door with 1 on 1d6 when passing within 10 feet");
    character.abilities.push("Find secret door when actively searching with 1-2 on 1d6");
    character.abilities.push("Find concealed portal when actively searching with 1-3 on 1d6");
    return character;
  },
  3,
  18,
  6,
  18,
  6,
  18,
  4,
  18,
  3,
  18,
  3,
  18,
  60,
  58,
  110,
  85,
  "2d6",
  "3d12",
  15,
  12,
  "1d6",
  ["common", "elf", "gnome", "halfling", "goblin", "hobgoblin", "gnoll", "orc"],
  ["bard", "cleric", "druid", "fighter", "mage", "ranger", "specialist wizard", "thief"]
);
const halfling = new ADNDRace(
  "halfling",
  "halfling",
  function(character) {
    character.dexterity += 1;
    character.strength -= 1;
    character.exceptionalStrength = -1;
    let halflingType = RND.item(["Hairfeet", "Tallfellow", "Stout"]);
    character.race.name = `${halflingType} halfling`;
    if (halflingType == "Stout") {
      if (RND.simple(100) <= 15) {
        character.abilities.push("Normal Infravision (60')");
      }
      character.abilities.push("Know if a passage has up or down grade on 1,2,3 on 1d4");
      character.abilities.push("Determine direction on 1,2,3 on 1d6");
    } else {
      if (RND.simple(100) <= 25) {
        character.abilities.push("Limited Infravision (30')");
      }
    }
    character.abilities.push("+1 to attack rolls with thrown weapons and slings");
    character.abilities.push(
      "When not wearing metal armor, and either alone or with other halflings/elves not in metal armor, gain a bonus to surprise opponents. Those opponents have a -4 penalty to their surprise die rolls, or a -2 penalty if the halfling has to open a door or screen to attack."
    );
    return character;
  },
  7,
  18,
  7,
  18,
  10,
  18,
  6,
  18,
  3,
  17,
  3,
  18,
  32,
  30,
  52,
  48,
  "2d8",
  "5d4",
  20,
  6,
  "3d4",
  ["common", "halfling", "dwarf", "elf", "gnome", "goblin", "orc"],
  ["cleric", "fighter", "thief"]
);
const human = new ADNDRace(
  "human",
  "human",
  function(character) {
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
    "kobold"
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
    "thief"
  ]
);
function getAll() {
  return [dwarf, elf, gnome, halfelf, halfling, human];
}
class ADNDCharacterGeneratorConfig {
  allowedRaces;
  allowedClasses;
  constructor() {
    this.allowedRaces = getAll();
    this.allowedClasses = getAll$1();
  }
}
function getArmor() {
  return [
    new ADNDArmor("banded mail", -7, 35, 300 * 100),
    new ADNDArmor("brigandine", -4, 35, 120 * 100),
    new ADNDArmor("bronze plate mail", -7, 45, 400 * 100),
    new ADNDArmor("chain mail", -6, 40, 75 * 100),
    new ADNDArmor("field plate", -8, 60, 2e3 * 100),
    new ADNDArmor("full plate", -9, 70, 4e3 * 100),
    new ADNDArmor("hide", -4, 30, 15 * 100),
    new ADNDArmor("leather", -2, 15, 5 * 100),
    new ADNDArmor("padded", -2, 10, 4 * 100),
    new ADNDArmor("plate mail", -7, 50, 600 * 100),
    new ADNDArmor("ring mail", -3, 30, 100 * 100),
    new ADNDArmor("scale mail", -4, 40, 120 * 100),
    new ADNDArmor("shield, body", -1, 15, 10 * 100),
    new ADNDArmor("shield, small buckler", -1, 10, 7 * 100),
    new ADNDArmor("shield, medium buckler", -1, 5, 3 * 100),
    new ADNDArmor("splint mail", -6, 40, 80 * 100),
    new ADNDArmor("studded leather", -4, 25, 20 * 100)
  ];
}
function getWeapons() {
  return [
    new ADNDWeapon("arquebus", 500 * 100, 10, "medium", "piercing", 15, "1d10", "1d10", "musket"),
    new ADNDWeapon("battle axe", 5 * 100, 6, "medium", "slashing", 7, "1d8", "1d8", "axe"),
    new ADNDWeapon("blowgun", 5 * 100, 1, "large", "piercing", 5, "1", "1", "blowgun", true),
    new ADNDWeapon("short bow", 30 * 100, 2, "medium", "piercing", 7, "1", "1", "bow", true),
    new ADNDWeapon("long bow", 75 * 100, 3, "large", "piercing", 8, "1", "1", "bow", true),
    new ADNDWeapon(
      "composite short bow",
      75 * 100,
      2,
      "medium",
      "piercing",
      6,
      "1",
      "1",
      "bow",
      true
    ),
    new ADNDWeapon(
      "composite long bow",
      100 * 100,
      3,
      "large",
      "piercing",
      7,
      "1",
      "1",
      "bow",
      true
    ),
    new ADNDWeapon("club", 0, 3, "medium", "bludgeoning", 4, "1d6", "1d3", "club"),
    new ADNDWeapon(
      "crossbow, hand",
      300 * 100,
      3,
      "small",
      "piercing",
      5,
      "0",
      "0",
      "crossbow",
      true
    ),
    new ADNDWeapon(
      "crossbow, light",
      35 * 100,
      7,
      "medium",
      "piercing",
      7,
      "0",
      "0",
      "crossbow",
      true
    ),
    new ADNDWeapon(
      "crossbow, heavy",
      50 * 100,
      14,
      "medium",
      "piercing",
      10,
      "0",
      "0",
      "crossbow",
      true
    ),
    new ADNDWeapon("dagger", 2 * 100, 1, "small", "piercing", 2, "1d4", "1d3", "dagger"),
    new ADNDWeapon("dart", 5 * 10, 0.5, "small", "piercing", 2, "1d4", "1d3", "dart"),
    new ADNDWeapon(
      "footman's flail",
      15 * 100,
      15,
      "medium",
      "bludgeoning",
      7,
      "1d6+1",
      "2d4",
      "flail"
    ),
    new ADNDWeapon(
      "footman's mace",
      8 * 100,
      10,
      "medium",
      "bludgeoning",
      7,
      "1d6+1",
      "1d6",
      "mace"
    ),
    new ADNDWeapon("footman's pick", 8 * 100, 6, "medium", "piercing", 7, "1d6+1", "2d4", "pick"),
    new ADNDWeapon("hand axe", 1 * 100, 5, "medium", "slashing", 4, "1d6", "1d4", "axe"),
    new ADNDWeapon("harpoon", 20 * 100, 6, "large", "piercing", 7, "2d4", "2d6", "spear"),
    new ADNDWeapon(
      "horseman's flail",
      8 * 100,
      5,
      "medium",
      "bludgeoning",
      6,
      "1d4+1",
      "1d4+1",
      "flail"
    ),
    new ADNDWeapon("horseman's mace", 5 * 100, 6, "medium", "bludgeoning", 6, "1d6", "1d4", "mace"),
    new ADNDWeapon("horseman's pick", 7 * 100, 4, "medium", "piercing", 5, "1d4+1", "1d4", "pick"),
    new ADNDWeapon("javelin", 5 * 10, 2, "medium", "piercing", 4, "1d6", "1d6", "spear"),
    new ADNDWeapon("knife", 5 * 10, 0.5, "small", "piercing", 2, "1d3", "1d2", "dagger"),
    new ADNDWeapon(
      "jousting lance",
      20 * 100,
      20,
      "large",
      "piercing",
      10,
      "1d3-1",
      "1d2-1",
      "lance"
    ),
    new ADNDWeapon(
      "heavy horse lance",
      15 * 100,
      15,
      "large",
      "piercing",
      8,
      "1d8+1",
      "3d6",
      "lance"
    ),
    new ADNDWeapon("light horse lance", 6 * 100, 5, "large", "piercing", 6, "1d6", "1d8", "lance"),
    new ADNDWeapon(
      "medium horse lance",
      10 * 100,
      10,
      "large",
      "piercing",
      7,
      "1d6+1",
      "2d6",
      "lance"
    ),
    new ADNDWeapon("mancatcher", 30 * 100, 8, "large", "none", 7, "0", "0", "nonlethal"),
    new ADNDWeapon("morningstar", 10 * 100, 12, "medium", "bludgeoning", 7, "2d4", "1d6+1", "mace"),
    new ADNDWeapon("awl pike", 5 * 100, 12, "large", "piercing", 13, "1d6", "1d12", "polearm"),
    new ADNDWeapon("bardiche", 7 * 100, 12, "large", "slashing", 9, "2d4", "2d6", "polearm"),
    new ADNDWeapon(
      "bec de corbin",
      8 * 100,
      10,
      "large",
      "piercing/bludgeoning",
      9,
      "1d8",
      "1d6",
      "polearm"
    ),
    new ADNDWeapon(
      "bill-guisarme",
      7 * 100,
      15,
      "large",
      "piercing/slashing",
      10,
      "2d4",
      "1d10",
      "polearm"
    ),
    new ADNDWeapon(
      "fauchard",
      5 * 100,
      7,
      "large",
      "piercing/slashing",
      8,
      "1d6",
      "1d8",
      "polearm"
    ),
    new ADNDWeapon(
      "fauchard-fork",
      8 * 100,
      9,
      "large",
      "piercing/slashing",
      8,
      "1d8",
      "1d10",
      "polearm"
    ),
    new ADNDWeapon("glaive", 6 * 100, 8, "large", "slashing", 8, "1d6", "1d10", "polearm"),
    new ADNDWeapon(
      "glaive-guisarme",
      10 * 100,
      10,
      "large",
      "piercing/slashing",
      9,
      "2d4",
      "2d6",
      "polearm"
    ),
    new ADNDWeapon("guisarme", 5 * 100, 8, "large", "slashing", 8, "2d4", "1d8", "polearm"),
    new ADNDWeapon(
      "guisarme-voulge",
      8 * 100,
      15,
      "large",
      "piercing/slashing",
      10,
      "2d4",
      "2d4",
      "polearm"
    ),
    new ADNDWeapon(
      "halberd",
      10 * 100,
      15,
      "large",
      "piercing/slashing",
      9,
      "1d10",
      "2d6",
      "polearm"
    ),
    new ADNDWeapon(
      "hook fauchard",
      10 * 100,
      8,
      "large",
      "piercing/slashing",
      9,
      "1d4",
      "1d4",
      "polearm"
    ),
    new ADNDWeapon(
      "lucern hammer",
      7 * 100,
      15,
      "large",
      "piercing/bludgeoning",
      9,
      "2d4",
      "1d6",
      "polearm"
    ),
    new ADNDWeapon("military fork", 5 * 100, 7, "large", "piercing", 7, "1d8", "2d4", "polearm"),
    new ADNDWeapon("partisan", 10 * 100, 8, "large", "piercing", 9, "1d6", "1d6+1", "polearm"),
    new ADNDWeapon("ranseur", 6 * 100, 7, "large", "piercing", 8, "2d4", "2d4", "polearm"),
    new ADNDWeapon("spetum", 5 * 100, 7, "large", "piercing", 8, "1d6+1", "1d6+1", "polearm"),
    new ADNDWeapon("voulge", 5 * 100, 12, "large", "slashing", 10, "2d4", "2d4", "polearm"),
    new ADNDWeapon("quarterstaff", 0, 4, "large", "bludgeoning", 4, "1d6", "1d6", "staff"),
    new ADNDWeapon("scourge", 1 * 100, 2, "small", "none", 5, "1d4", "1d2", "whip"),
    new ADNDWeapon("sickle", 6 * 10, 3, "small", "slashing", 4, "1d4+1", "1d4", "sickle"),
    new ADNDWeapon("sling", 5, 0, "small", "bludgeoning", 6, "0", "0", "sling", true),
    new ADNDWeapon("spear", 8 * 10, 5, "medium", "piercing", 6, "1d6", "1d8", "spear"),
    new ADNDWeapon("staff sling", 2 * 10, 2, "medium", "none", 11, "0", "0", "sling", true),
    new ADNDWeapon(
      "bastard sword, 1H",
      25 * 100,
      10,
      "medium",
      "slashing",
      6,
      "1d8",
      "1d12",
      "sword"
    ),
    new ADNDWeapon(
      "bastard sword, 2H",
      25 * 100,
      10,
      "medium",
      "slashing",
      8,
      "2d4",
      "2d8",
      "sword"
    ),
    new ADNDWeapon("broad sword", 10 * 100, 4, "medium", "slashing", 5, "2d4", "1d6+1", "sword"),
    new ADNDWeapon("khopesh", 10 * 100, 7, "medium", "slashing", 9, "2d4", "1d6", "sword"),
    new ADNDWeapon("long sword", 15 * 100, 4, "medium", "slashing", 5, "1d8", "1d12", "sword"),
    new ADNDWeapon("scimitar", 15 * 100, 4, "medium", "slashing", 5, "1d8", "1d8", "sword"),
    new ADNDWeapon("short sword", 10 * 100, 3, "small", "piercing", 3, "1d6", "1d8", "sword"),
    new ADNDWeapon(
      "two-handed sword",
      50 * 100,
      15,
      "large",
      "slashing",
      10,
      "1d10",
      "3d6",
      "sword"
    ),
    new ADNDWeapon("trident", 10 * 10, 6, "medium", "piercing", 6, "1d6", "1d8", "spear"),
    new ADNDWeapon("warhammer", 2 * 100, 6, "medium", "bludgeoning", 4, "1d4+1", "1d4", "mace"),
    new ADNDWeapon("whip", 1 * 10, 2, "medium", "none", 8, "1d2", "1", "whip")
  ];
}
class ADNDCharacterGenerator {
  config;
  generateCharacter() {
    let character = new ADNDCharacter();
    character.charisma = roll("3d6");
    character.constitution = roll("3d6");
    character.dexterity = roll("3d6");
    character.intelligence = roll("3d6");
    character.strength = roll("3d6");
    character.wisdom = roll("3d6");
    if (character.strength == 18) {
      character.exceptionalStrength = random.int(1, 100);
    }
    character.race = getRace(character, this.config.allowedRaces);
    character = character.race.apply(character);
    character.class = getClass(character, this.config.allowedClasses);
    character = character.class.apply(character);
    if (character.class.group == "warrior") {
      character.currency = roll("5d4") * 10 * 100;
    } else if (character.class.group == "wizard") {
      character.currency = roll("1d4+1") * 10 * 100;
    } else if (character.class.group == "rogue") {
      character.currency = roll("2d6") * 10 * 100;
    } else {
      character.currency = roll("3d6") * 10 * 100;
    }
    character.alignment = RND.item(character.class.allowedAlignments);
    character.thaco = 20;
    character.bendBarsLiftGates = getBendBarsLiftGates(
      character.strength,
      character.exceptionalStrength
    );
    character.bonusSpells = getBonusPriestSpells(character.wisdom);
    character.chanceOfSpellFailure = getChanceOfSpellFailure(character.wisdom);
    character.chanceToLearnSpell = getChanceToLearnSpell(character.intelligence);
    character.damageAdjustment = getDamageAdjustment(
      character.strength,
      character.exceptionalStrength
    );
    character.defensiveAdjustment = getDefensiveAdjustment(character.dexterity);
    character.hitPointAdjustment = getHitPointAdjustment(character.constitution);
    character.hitProbability = getHitProbability(character.strength, character.exceptionalStrength);
    character.illusionImmunity = getIllusionImmunity(character.intelligence);
    character.loyaltyBase = getLoyaltyBase(character.charisma);
    character.magicalDefenseAdjustment = getMagicalDefenseAdjustment(character.wisdom);
    character.maximumNumberOfHenchmen = getMaximumNumberOfHenchmen(character.charisma);
    character.maximumNumberOfSpellsPerLevel = getMaximumNumberOfSpellsPerLevel(
      character.intelligence
    );
    character.maxPress = getMaxPress(character.strength, character.exceptionalStrength);
    character.missileAttackAdjustment = getMissileAttackAdjustment(character.dexterity);
    character.npcReactionAdjustment = getNPCReactionAdjustment(character.charisma);
    character.numberOfLanguages = getNumberOfLanguages(character.intelligence);
    character.openDoors = getOpenDoors(character.strength, character.exceptionalStrength);
    character.poisonSave = getPoisonSave(character.constitution);
    character.reactionAdjustment = getReactionAdjustment(character.dexterity);
    character.regeneration = getRegeneration(character.constitution);
    character.resurrectionSurvival = getResurrectionSurvival(character.constitution);
    character.spellImmunity = getSpellImmunity(character.wisdom);
    character.spellLevel = getSpellLevel(character.intelligence);
    character.systemShock = getSystemShock(character.constitution);
    character.warriorHitPointAdjustment = getWarriorHitPointAdjustment(character.constitution);
    character.weightAllowance = getWeightAllowance(
      character.strength,
      character.exceptionalStrength
    );
    let hitPointAdjustment = character.class.group == "warrior" ? character.warriorHitPointAdjustment : character.hitPointAdjustment;
    character.hp = roll(character.class.hitDice) + hitPointAdjustment;
    if (character.hp < 1) {
      character.hp = 1;
    }
    character = getSavingThrows(character);
    let allWeapons = getWeapons();
    let possibleWeapons = getPossibleWeapons(character, allWeapons);
    if (possibleWeapons.length > 0) {
      let weapon = RND.item(possibleWeapons);
      character.weapons.push(weapon);
      character.currency -= weapon.cost;
    } else {
      console.debug("No weapons available for character");
    }
    let allArmor = getArmor();
    let possibleArmor = getPossibleArmor(character, allArmor);
    if (possibleArmor.length > 0) {
      let armor = RND.item(possibleArmor);
      character.armor.push(armor);
      character.currency -= armor.cost;
    } else {
      console.debug("No armor available for character");
    }
    if (character.class.group == "priest") {
      if (character.currency > 300) {
        character.currency = random.int(1, 3) * 100;
      }
    }
    for (let i = 0; i < character.armor.length; i++) {
      character.ac += character.armor[i].ac;
    }
    return character;
  }
}
function getBendBarsLiftGates(strength, exceptionalStrength) {
  if (strength == 1) {
    return 0;
  } else if (strength == 2) {
    return 0;
  } else if (strength == 3) {
    return 0;
  } else if (strength <= 5) {
    return 0;
  } else if (strength <= 7) {
    return 0;
  } else if (strength <= 9) {
    return 1;
  } else if (strength <= 11) {
    return 2;
  } else if (strength <= 13) {
    return 4;
  } else if (strength <= 15) {
    return 7;
  } else if (strength <= 16) {
    return 10;
  } else if (strength <= 17) {
    return 13;
  } else if (strength == 18 && exceptionalStrength == -1) {
    return 16;
  } else if (strength == 18 && exceptionalStrength <= 50) {
    return 20;
  } else if (strength == 18 && exceptionalStrength <= 75) {
    return 25;
  } else if (strength == 18 && exceptionalStrength <= 90) {
    return 30;
  } else if (strength == 18 && exceptionalStrength <= 99) {
    return 35;
  } else if (strength == 18 && exceptionalStrength == 100) {
    return 40;
  }
  return 50;
}
function getBonusPriestSpells(wisdom) {
  let table = {
    1: [],
    2: [],
    3: [],
    4: [],
    5: [],
    6: [],
    7: [],
    8: [],
    9: [0],
    10: [0],
    11: [0],
    12: [0],
    13: [1],
    14: [1, 1],
    15: [1, 1, 2],
    16: [1, 1, 2, 2],
    17: [1, 1, 2, 2, 3],
    18: [1, 1, 2, 2, 3, 4],
    19: [1, 1, 1, 2, 2, 3, 3, 4],
    20: [1, 1, 1, 2, 2, 2, 3, 3, 4, 4],
    21: [1, 1, 1, 2, 2, 2, 3, 3, 3, 4, 4, 5],
    22: [1, 1, 1, 2, 2, 2, 3, 3, 3, 4, 4, 4, 5, 5],
    23: [1, 1, 1, 1, 2, 2, 2, 3, 3, 3, 4, 4, 4, 5, 5, 6],
    24: [1, 1, 1, 1, 2, 2, 2, 3, 3, 3, 4, 4, 4, 5, 5, 5, 6, 6],
    25: [1, 1, 1, 1, 2, 2, 2, 3, 3, 3, 4, 4, 4, 5, 5, 5, 6, 6, 6, 7]
  };
  return table[wisdom];
}
function getChanceOfSpellFailure(wisdom) {
  let table = {
    1: 80,
    2: 60,
    3: 50,
    4: 45,
    5: 40,
    6: 35,
    7: 30,
    8: 25,
    9: 20,
    10: 15,
    11: 10,
    12: 5,
    13: 0,
    14: 0,
    15: 0,
    16: 0,
    17: 0,
    18: 0,
    19: 0,
    20: 0,
    21: 0,
    22: 0,
    23: 0,
    24: 0,
    25: 0
  };
  return table[wisdom];
}
function getChanceToLearnSpell(intelligence) {
  let table = {
    1: -1,
    2: -1,
    3: -1,
    4: -1,
    5: -1,
    6: -1,
    7: -1,
    8: -1,
    9: 35,
    10: 40,
    11: 45,
    12: 50,
    13: 55,
    14: 60,
    15: 65,
    16: 70,
    17: 75,
    18: 85,
    19: 95,
    20: 96,
    21: 97,
    22: 98,
    23: 99,
    24: 100,
    25: 100
  };
  return table[intelligence];
}
function getClass(character, classes) {
  let options = [];
  for (let i = 0; i < classes.length; i++) {
    if (character.charisma >= classes[i].minCharisma && character.constitution >= classes[i].minConstitution && character.dexterity >= classes[i].minDexterity && character.intelligence >= classes[i].minIntelligence && character.strength >= classes[i].minStrength && character.wisdom >= classes[i].minWisdom) {
      options.push(classes[i]);
    }
  }
  return RND.item(options);
}
function getDamageAdjustment(strength, exceptionalStrength) {
  if (strength == 1) {
    return "-4";
  } else if (strength == 2) {
    return "-2";
  } else if (strength <= 5) {
    return "-1";
  } else if (strength >= 16 && strength <= 17) {
    return "+1";
  } else if (strength == 18 && exceptionalStrength == -1) {
    return "+2";
  } else if (strength == 18 && exceptionalStrength <= 50) {
    return "+3";
  } else if (strength == 18 && exceptionalStrength <= 90) {
    return "+4";
  } else if (strength == 18 && exceptionalStrength <= 99) {
    return "+5";
  } else if (strength == 18 && exceptionalStrength == 100) {
    return "+6";
  }
  return "none";
}
function getDefensiveAdjustment(dexterity) {
  if (dexterity == 1) {
    return 5;
  } else if (dexterity == 2) {
    return 5;
  } else if (dexterity == 3) {
    return 4;
  } else if (dexterity == 4) {
    return 3;
  } else if (dexterity == 5) {
    return 2;
  } else if (dexterity == 6) {
    return 1;
  } else if (dexterity == 7) {
    return 0;
  } else if (dexterity == 8) {
    return 0;
  } else if (dexterity == 9) {
    return 0;
  } else if (dexterity <= 14) {
    return 0;
  } else if (dexterity == 15) {
    return -1;
  } else if (dexterity == 16) {
    return -2;
  } else if (dexterity == 17) {
    return -3;
  } else if (dexterity == 18) {
    return -4;
  } else if (dexterity == 19) {
    return -4;
  }
  return -4;
}
function getHitPointAdjustment(constitution) {
  let table = {
    1: -3,
    2: -2,
    3: -2,
    4: -1,
    5: -1,
    6: -1,
    7: 0,
    8: 0,
    9: 0,
    10: 0,
    11: 0,
    12: 0,
    13: 0,
    14: 0,
    15: 1,
    16: 2,
    17: 2,
    18: 2,
    19: 2,
    20: 2
  };
  return table[constitution];
}
function getHitProbability(strength, exceptionalStrength) {
  if (strength == 1) {
    return "-5";
  } else if (strength == 2) {
    return "-4";
  } else if (strength == 3) {
    return "-3";
  } else if (strength <= 5) {
    return "-2";
  } else if (strength <= 7) {
    return "-1";
  } else if (strength == 17) {
    return "+1";
  } else if (strength == 18 && exceptionalStrength == -1) {
    return "+2";
  } else if (strength == 18 && exceptionalStrength <= 50) {
    return "+3";
  } else if (strength == 18 && exceptionalStrength <= 99) {
    return "+4";
  } else if (strength == 18 && exceptionalStrength == 100) {
    return "+5";
  }
  return "normal";
}
function getIllusionImmunity(intelligence) {
  let table = {
    1: -1,
    2: -1,
    3: -1,
    4: -1,
    5: -1,
    6: -1,
    7: -1,
    8: -1,
    9: -1,
    10: -1,
    11: -1,
    12: -1,
    13: -1,
    14: -1,
    15: -1,
    16: -1,
    17: -1,
    18: -1,
    19: 1,
    20: 2,
    21: 3,
    22: 4,
    23: 5,
    24: 6,
    25: 7
  };
  return table[intelligence];
}
function getLoyaltyBase(charisma) {
  let table = {
    1: -8,
    2: -7,
    3: -6,
    4: -5,
    5: -4,
    6: -3,
    7: -2,
    8: -1,
    9: 0,
    10: 0,
    11: 0,
    12: 0,
    13: 0,
    14: 1,
    15: 3,
    16: 4,
    17: 6,
    18: 8,
    19: 10,
    20: 12,
    21: 14,
    22: 16,
    23: 18,
    24: 20,
    25: 20
  };
  return table[charisma];
}
function getMagicalDefenseAdjustment(wisdom) {
  let table = {
    1: -6,
    2: -4,
    3: -3,
    4: -2,
    5: -1,
    6: -1,
    7: -1,
    8: 0,
    9: 0,
    10: 0,
    11: 0,
    12: 0,
    13: 0,
    14: 0,
    15: 1,
    16: 2,
    17: 3,
    18: 4,
    19: 4,
    20: 4,
    21: 4,
    22: 4,
    23: 4,
    24: 4,
    25: 4
  };
  return table[wisdom];
}
function getMaximumNumberOfHenchmen(charisma) {
  let table = {
    1: 0,
    2: 1,
    3: 1,
    4: 1,
    5: 2,
    6: 2,
    7: 3,
    8: 3,
    9: 4,
    10: 4,
    11: 4,
    12: 5,
    13: 5,
    14: 6,
    15: 7,
    16: 8,
    17: 10,
    18: 15,
    19: 20,
    20: 25,
    21: 30,
    22: 35,
    23: 40,
    24: 45,
    25: 50
  };
  return table[charisma];
}
function getMaximumNumberOfSpellsPerLevel(intelligence) {
  let table = {
    1: -1,
    2: -1,
    3: -1,
    4: -1,
    5: -1,
    6: -1,
    7: -1,
    8: -1,
    9: 6,
    10: 7,
    11: 7,
    12: 7,
    13: 9,
    14: 9,
    15: 11,
    16: 11,
    17: 14,
    18: 18,
    19: 99,
    20: 99,
    21: 99,
    22: 99,
    23: 99,
    24: 99,
    25: 99
  };
  return table[intelligence];
}
function getMaxPress(strength, exceptionalStrength) {
  if (strength == 1) {
    return 3;
  } else if (strength == 2) {
    return 5;
  } else if (strength == 3) {
    return 10;
  } else if (strength <= 5) {
    return 25;
  } else if (strength <= 7) {
    return 55;
  } else if (strength <= 9) {
    return 90;
  } else if (strength <= 11) {
    return 115;
  } else if (strength <= 13) {
    return 140;
  } else if (strength <= 15) {
    return 170;
  } else if (strength <= 16) {
    return 195;
  } else if (strength <= 17) {
    return 220;
  } else if (strength == 18 && exceptionalStrength == -1) {
    return 255;
  } else if (strength == 18 && exceptionalStrength <= 50) {
    return 280;
  } else if (strength == 18 && exceptionalStrength <= 75) {
    return 305;
  } else if (strength == 18 && exceptionalStrength <= 90) {
    return 330;
  } else if (strength == 18 && exceptionalStrength <= 99) {
    return 380;
  } else if (strength == 18 && exceptionalStrength == 100) {
    return 480;
  }
  return 640;
}
function getMissileAttackAdjustment(dexterity) {
  let table = {
    1: -6,
    2: -4,
    3: -3,
    4: -2,
    5: -1,
    6: 0,
    7: 0,
    8: 0,
    9: 0,
    10: 0,
    11: 0,
    12: 0,
    13: 0,
    14: 0,
    15: 0,
    16: 1,
    17: 2,
    18: 2,
    19: 3,
    20: 3,
    21: 4,
    22: 4,
    23: 4,
    24: 5,
    25: 5
  };
  return table[dexterity];
}
function getNPCReactionAdjustment(charisma) {
  let table = {
    1: -7,
    2: -6,
    3: -5,
    4: -4,
    5: -3,
    6: -2,
    7: -1,
    8: 0,
    9: 0,
    10: 0,
    11: 0,
    12: 0,
    13: 1,
    14: 2,
    15: 3,
    16: 5,
    17: 6,
    18: 7,
    19: 8,
    20: 9,
    21: 10,
    22: 11,
    23: 12,
    24: 13,
    25: 14
  };
  return table[charisma];
}
function getNumberOfLanguages(intelligence) {
  let table = {
    1: 0,
    2: 1,
    3: 1,
    4: 1,
    5: 1,
    6: 1,
    7: 1,
    8: 1,
    9: 2,
    10: 2,
    11: 2,
    12: 3,
    13: 3,
    14: 4,
    15: 4,
    16: 5,
    17: 6,
    18: 7,
    19: 8,
    20: 9,
    21: 10,
    22: 11,
    23: 12,
    24: 15,
    25: 20
  };
  return table[intelligence];
}
function getOpenDoors(strength, exceptionalStrength) {
  if (strength == 1) {
    return "1";
  } else if (strength == 2) {
    return "1";
  } else if (strength == 3) {
    return "2";
  } else if (strength <= 5) {
    return "3";
  } else if (strength <= 7) {
    return "4";
  } else if (strength <= 9) {
    return "5";
  } else if (strength <= 11) {
    return "6";
  } else if (strength <= 13) {
    return "7";
  } else if (strength <= 15) {
    return "8";
  } else if (strength <= 16) {
    return "9";
  } else if (strength <= 17) {
    return "10";
  } else if (strength == 18 && exceptionalStrength == -1) {
    return "11";
  } else if (strength == 18 && exceptionalStrength <= 50) {
    return "12";
  } else if (strength == 18 && exceptionalStrength <= 75) {
    return "13";
  } else if (strength == 18 && exceptionalStrength <= 90) {
    return "14";
  } else if (strength == 18 && exceptionalStrength <= 99) {
    return "15 (3)";
  } else if (strength == 18 && exceptionalStrength == 100) {
    return "16 (6)";
  }
  return "16 (8)";
}
function getPoisonSave(constitution) {
  let table = {
    1: -2,
    2: -1,
    3: 0,
    4: 0,
    5: 0,
    6: 0,
    7: 0,
    8: 0,
    9: 0,
    10: 0,
    11: 0,
    12: 0,
    13: 0,
    14: 0,
    15: 0,
    16: 0,
    17: 0,
    18: 0,
    19: 1,
    20: 1,
    21: 2,
    22: 2,
    23: 3,
    24: 3,
    25: 4
  };
  return table[constitution];
}
function getPossibleArmor(character, armor) {
  let possibleArmor = [];
  for (let i = 0; i < armor.length; i++) {
    if (character.class.allowedArmor.includes("any") || character.class.allowedArmor.includes(armor[i].name)) {
      if (character.currency >= armor[i].cost) {
        possibleArmor.push(armor[i]);
      }
    }
  }
  return possibleArmor;
}
function getPossibleWeapons(character, weapons) {
  let possibleWeapons = [];
  for (let weapon of weapons) {
    if (character.class.allowedWeapons.includes("any") || character.class.allowedWeapons.includes(weapon.name) || character.class.allowedWeapons.includes("bludgeoning") && weapon.damageType.includes("bludgeoning")) {
      if (character.currency >= weapon.cost) {
        possibleWeapons.push(weapon);
      }
    }
  }
  return possibleWeapons;
}
function getRace(character, races) {
  let options = [];
  for (let i = 0; i < races.length; i++) {
    if (character.charisma >= races[i].minCharisma && character.charisma <= races[i].maxCharisma && character.constitution >= races[i].minConstitution && character.constitution <= races[i].maxConstitution && character.dexterity >= races[i].minDexterity && character.dexterity <= races[i].maxDexterity && character.intelligence >= races[i].minIntelligence && character.intelligence <= races[i].maxIntelligence && character.strength >= races[i].minStrength && character.strength <= races[i].maxStrength && character.wisdom >= races[i].minWisdom && character.wisdom <= races[i].maxWisdom) {
      options.push(races[i]);
    }
  }
  return RND.item(options);
}
function getReactionAdjustment(dexterity) {
  let table = {
    1: -6,
    2: -4,
    3: -3,
    4: -2,
    5: -1,
    6: 0,
    7: 0,
    8: 0,
    9: 0,
    10: 0,
    11: 0,
    12: 0,
    13: 0,
    14: 0,
    15: 0,
    16: 1,
    17: 2,
    18: 2,
    19: 3,
    20: 3,
    21: 4,
    22: 4,
    23: 4,
    24: 5,
    25: 5
  };
  return table[dexterity];
}
function getRegeneration(constitution) {
  let table = {
    1: "nil",
    2: "nil",
    3: "nil",
    4: "nil",
    5: "nil",
    6: "nil",
    7: "nil",
    8: "nil",
    9: "nil",
    10: "nil",
    11: "nil",
    12: "nil",
    13: "nil",
    14: "nil",
    15: "nil",
    16: "nil",
    17: "nil",
    18: "nil",
    19: "nil",
    20: "1/6 turns",
    21: "1/5 turns",
    22: "1/4 turns",
    23: "1/3 turns",
    24: "1/2 turns",
    25: "1/1 turn"
  };
  return table[constitution];
}
function getResurrectionSurvival(constitution) {
  let table = {
    1: 30,
    2: 35,
    3: 40,
    4: 45,
    5: 50,
    6: 55,
    7: 60,
    8: 65,
    9: 70,
    10: 75,
    11: 80,
    12: 85,
    13: 90,
    14: 92,
    15: 94,
    16: 96,
    17: 98,
    18: 100,
    19: 100,
    20: 100,
    21: 100,
    22: 100,
    23: 100,
    24: 100,
    25: 100
  };
  return table[constitution];
}
function getSavingThrows(character) {
  let basicSets = {
    priest: {
      poison: 10,
      rod: 14,
      petrification: 13,
      breath: 16,
      spell: 15
    },
    rogue: {
      poison: 13,
      rod: 14,
      petrification: 12,
      breath: 16,
      spell: 15
    },
    warrior: {
      poison: 14,
      rod: 16,
      petrification: 15,
      breath: 17,
      spell: 17
    },
    wizard: {
      poison: 14,
      rod: 11,
      petrification: 13,
      breath: 15,
      spell: 12
    }
  };
  let classSet = basicSets[character.class.group];
  character.poisonSavingThrow = classSet.poison + character.poisonSave;
  character.rodSavingThrow = classSet.rod;
  character.petrificationSavingThrow = classSet.petrification;
  character.breathSavingThrow = classSet.breath;
  character.spellSavingThrow = classSet.spell;
  let conMods = {
    3: 0,
    4: 1,
    5: 1,
    6: 1,
    7: 2,
    8: 2,
    9: 2,
    10: 2,
    11: 3,
    12: 3,
    13: 3,
    14: 4,
    15: 4,
    16: 4,
    17: 4,
    18: 5,
    19: 5
  };
  if (character.race.name == "dwarf" || character.race.name == "gnome" || character.race.name == "halfling") {
    let conMod = conMods[character.constitution];
    character.rodSavingThrow += conMod;
    character.spellSavingThrow += conMod;
    if (character.race.name == "dwarf" || character.race.name == "halfling") {
      character.poisonSavingThrow += conMod;
    }
  }
  return character;
}
function getSpellImmunity(wisdom) {
  let table = {
    1: [],
    2: [],
    3: [],
    4: [],
    5: [],
    6: [],
    7: [],
    8: [],
    9: [],
    10: [],
    11: [],
    12: [],
    13: [],
    14: [],
    15: [],
    16: [],
    17: [],
    18: [],
    19: ["cause fear", "charm person", "command", "friends", "hypnotism"],
    20: [
      "cause fear",
      "charm person",
      "command",
      "friends",
      "hypnotism",
      "forget",
      "hold person",
      "ray of enfeeblment",
      "scare"
    ],
    21: [
      "cause fear",
      "charm person",
      "command",
      "friends",
      "hypnotism",
      "forget",
      "hold person",
      "ray of enfeeblment",
      "scare",
      "fear"
    ],
    22: [
      "cause fear",
      "charm person",
      "command",
      "friends",
      "hypnotism",
      "forget",
      "hold person",
      "ray of enfeeblment",
      "scare",
      "fear",
      "charm monster",
      "confusion",
      "emotion",
      "fumble",
      "suggestion"
    ],
    23: [
      "cause fear",
      "charm person",
      "command",
      "friends",
      "hypnotism",
      "forget",
      "hold person",
      "ray of enfeeblment",
      "scare",
      "fear",
      "charm monster",
      "confusion",
      "emotion",
      "fumble",
      "suggestion",
      "chaos",
      "feeblemind",
      "hold monster",
      "magic jar",
      "quest"
    ],
    24: [
      "cause fear",
      "charm person",
      "command",
      "friends",
      "hypnotism",
      "forget",
      "hold person",
      "ray of enfeeblment",
      "scare",
      "fear",
      "charm monster",
      "confusion",
      "emotion",
      "fumble",
      "suggestion",
      "chaos",
      "feeblemind",
      "hold monster",
      "magic jar",
      "quest",
      "geas",
      "mass suggestion",
      "rod of rulership"
    ],
    25: [
      "cause fear",
      "charm person",
      "command",
      "friends",
      "hypnotism",
      "forget",
      "hold person",
      "ray of enfeeblment",
      "scare",
      "fear",
      "charm monster",
      "confusion",
      "emotion",
      "fumble",
      "suggestion",
      "chaos",
      "feeblemind",
      "hold monster",
      "magic jar",
      "quest",
      "geas",
      "mass suggestion",
      "rod of rulership",
      "antipathy/sympathy",
      "death spell",
      "mass charm"
    ]
  };
  return table[wisdom];
}
function getSpellLevel(intelligence) {
  let table = {
    1: -1,
    2: -1,
    3: -1,
    4: -1,
    5: -1,
    6: -1,
    7: -1,
    8: -1,
    9: 4,
    10: 5,
    11: 5,
    12: 6,
    13: 6,
    14: 7,
    15: 7,
    16: 8,
    17: 8,
    18: 9,
    19: 9,
    20: 9,
    21: 9,
    22: 9,
    23: 9,
    24: 9,
    25: 9
  };
  return table[intelligence];
}
function getSystemShock(constitution) {
  let table = {
    1: 25,
    2: 30,
    3: 35,
    4: 40,
    5: 45,
    6: 50,
    7: 55,
    8: 60,
    9: 65,
    10: 70,
    11: 75,
    12: 80,
    13: 85,
    14: 88,
    15: 90,
    16: 95,
    17: 97,
    18: 99,
    19: 99,
    20: 99,
    21: 99,
    22: 99,
    23: 99,
    24: 99,
    25: 100
  };
  return table[constitution];
}
function getWarriorHitPointAdjustment(constitution) {
  let table = {
    1: -3,
    2: -2,
    3: -2,
    4: -1,
    5: -1,
    6: -1,
    7: 0,
    8: 0,
    9: 0,
    10: 0,
    11: 0,
    12: 0,
    13: 0,
    14: 0,
    15: 1,
    16: 2,
    17: 3,
    18: 4,
    19: 5,
    20: 5
  };
  return table[constitution];
}
function getWeightAllowance(strength, exceptionalStrength) {
  if (strength == 1) {
    return 1;
  } else if (strength == 2) {
    return 1;
  } else if (strength == 3) {
    return 5;
  } else if (strength <= 5) {
    return 10;
  } else if (strength <= 7) {
    return 20;
  } else if (strength <= 9) {
    return 35;
  } else if (strength <= 11) {
    return 40;
  } else if (strength <= 13) {
    return 45;
  } else if (strength <= 15) {
    return 55;
  } else if (strength <= 16) {
    return 70;
  } else if (strength <= 17) {
    return 85;
  } else if (strength == 18 && exceptionalStrength == -1) {
    return 110;
  } else if (strength == 18 && exceptionalStrength <= 50) {
    return 135;
  } else if (strength == 18 && exceptionalStrength <= 75) {
    return 160;
  } else if (strength == 18 && exceptionalStrength <= 90) {
    return 185;
  } else if (strength == 18 && exceptionalStrength <= 99) {
    return 235;
  } else if (strength == 18 && exceptionalStrength == 100) {
    return 335;
  }
  return 485;
}
const css = {
  code: 'div.svelte-4q74qx.svelte-4q74qx,h1.svelte-4q74qx.svelte-4q74qx,h2.svelte-4q74qx.svelte-4q74qx,h3.svelte-4q74qx.svelte-4q74qx,p.svelte-4q74qx.svelte-4q74qx,strong.svelte-4q74qx.svelte-4q74qx,label.svelte-4q74qx.svelte-4q74qx,table.svelte-4q74qx.svelte-4q74qx,tbody.svelte-4q74qx.svelte-4q74qx,thead.svelte-4q74qx.svelte-4q74qx,tr.svelte-4q74qx.svelte-4q74qx,th.svelte-4q74qx.svelte-4q74qx,td.svelte-4q74qx.svelte-4q74qx,section.svelte-4q74qx.svelte-4q74qx{margin:0;padding:0;border:0;font-size:100%;font:inherit;vertical-align:baseline}section.svelte-4q74qx.svelte-4q74qx{display:block}table.svelte-4q74qx.svelte-4q74qx{border-collapse:collapse;border-spacing:0}@font-face{font-family:"alienleague";src:url("$lib/assets/fonts/alienleagueregular-9d3z-webfont.woff2") format("woff2");font-weight:normal;font-style:normal}@font-face{font-family:"azonix";src:url("$lib/assets/fonts/azonix-webfont.woff2") format("woff2");font-weight:normal;font-style:normal}h1.svelte-4q74qx.svelte-4q74qx,h2.svelte-4q74qx.svelte-4q74qx,h3.svelte-4q74qx.svelte-4q74qx{font-family:system-ui, Helvetica, sans-serif;margin:0.5rem 0}h1.svelte-4q74qx.svelte-4q74qx{color:#000;font-weight:700;font-size:2.5rem;line-height:2.5rem;padding:3px}h2.svelte-4q74qx.svelte-4q74qx{color:#000;font-weight:500;font-size:2.25rem;line-height:2.25rem;padding:3px}h3.svelte-4q74qx.svelte-4q74qx{font-size:2rem;line-height:2rem}p.svelte-4q74qx.svelte-4q74qx{margin:1rem 0}label.svelte-4q74qx.svelte-4q74qx{font-weight:700;margin-right:1rem}input.svelte-4q74qx.svelte-4q74qx{font-size:1rem;line-height:1rem;padding:0.25rem}div.input-group.svelte-4q74qx.svelte-4q74qx{margin-bottom:1rem}strong.svelte-4q74qx.svelte-4q74qx{font-weight:700}table.svelte-4q74qx.svelte-4q74qx{width:100%}table.svelte-4q74qx thead tr.svelte-4q74qx{border-bottom:3px solid black}table.svelte-4q74qx thead tr th.svelte-4q74qx{font-weight:700;text-align:left}table.svelte-4q74qx th.svelte-4q74qx,table.svelte-4q74qx td.svelte-4q74qx{border:1px solid black;padding:0.25rem}section.main.svelte-4q74qx.svelte-4q74qx{padding:0.5rem}#seed.svelte-4q74qx.svelte-4q74qx{font-family:monospace}.fantasy.svelte-4q74qx button.svelte-4q74qx{background:rgb(92, 86, 73);background:linear-gradient(165deg, rgb(92, 86, 73) 0%, rgb(10, 10, 10) 100%);border:3px solid #5c5031;border-radius:3px;color:#fff;line-height:1rem;margin:0.1rem;padding:0.5rem 1rem}.fantasy.svelte-4q74qx button.svelte-4q74qx:active{background:rgb(92, 86, 73);background:linear-gradient(339deg, rgb(92, 86, 73) 0%, rgb(10, 10, 10) 100%);color:#76e841;transform:translateY(2px)}.fantasy.svelte-4q74qx button.svelte-4q74qx:disabled{background:#666;color:#777;border-color:#999}',
  map: null
};
function getEStrength(exStr) {
  let estr = String(exStr).padStart(2, "0");
  return estr.substring(estr.length - 2);
}
const Page = create_ssr_component(($$result, $$props, $$bindings, slots) => {
  let seed = RND.randomString(13);
  let genConfig;
  let charGen;
  let character;
  function generate() {
    random.use(seedrandom(seed));
    genConfig = new ADNDCharacterGeneratorConfig();
    charGen = new ADNDCharacterGenerator();
    charGen.config = genConfig;
    character = charGen.generateCharacter();
  }
  function newSeed() {
    seed = RND.randomString(13);
    generate();
  }
  newSeed();
  $$result.css.add(css);
  return `${$$result.head += `<!-- HEAD_svelte-1vi3coe_START -->${$$result.title = `<title>AD&amp;D 2e Character Generator | Iron Arachne</title>`, ""}<!-- HEAD_svelte-1vi3coe_END -->`, ""}  <section class="fantasy main svelte-4q74qx"><h1 class="svelte-4q74qx" data-svelte-h="svelte-wf0hyd">AD&amp;D 2e Character Generator</h1> <p class="svelte-4q74qx" data-svelte-h="svelte-n2n1b8">This is an AD&amp;D 2e character generator.</p> <div class="input-group svelte-4q74qx"><label for="seed" class="svelte-4q74qx" data-svelte-h="svelte-1akft3f">Random Seed</label> <input type="text" name="seed" id="seed" class="svelte-4q74qx"${add_attribute("value", seed, 0)}></div> <button class="svelte-4q74qx" data-svelte-h="svelte-1u7zbd5">Generate From Seed</button> <button class="svelte-4q74qx" data-svelte-h="svelte-192mxrq">Random Seed (and Generate)</button> <h2 class="svelte-4q74qx">${escape(character.firstName)} ${escape(character.lastName)}</h2> <p class="svelte-4q74qx">A level ${escape(character.level)} ${escape(character.race.name)} ${escape(character.class.name)}</p> <p class="svelte-4q74qx"><strong class="svelte-4q74qx" data-svelte-h="svelte-ux976c">XP:</strong> ${escape(character.xp)}</p> <p class="svelte-4q74qx"><strong class="svelte-4q74qx" data-svelte-h="svelte-1cs6kjo">HP:</strong> ${escape(character.hp)}</p> <p class="svelte-4q74qx"><strong class="svelte-4q74qx" data-svelte-h="svelte-6el7vw">AC:</strong> ${escape(character.ac)}</p> <p class="svelte-4q74qx"><strong class="svelte-4q74qx" data-svelte-h="svelte-kwuz7y">THAC0:</strong> ${escape(character.thaco)}</p> <p class="svelte-4q74qx"><strong class="svelte-4q74qx" data-svelte-h="svelte-1e50fa1">Alignment:</strong> ${escape(character.alignment)}</p> <p class="svelte-4q74qx"><strong class="svelte-4q74qx" data-svelte-h="svelte-c9vwy7">Currency:</strong> ${escape(valueToCoins(character.currency, false, false))}</p> <h3 class="svelte-4q74qx" data-svelte-h="svelte-1o8svp9">Attributes</h3> <p class="svelte-4q74qx"><strong class="svelte-4q74qx" data-svelte-h="svelte-1ktn8k1">Strength:</strong> ${escape(character.strength)}${character.exceptionalStrength != -1 ? `/${escape(getEStrength(character.exceptionalStrength))}` : ``}</p> <p class="svelte-4q74qx"><strong class="svelte-4q74qx" data-svelte-h="svelte-kjn8qy">Dexterity:</strong> ${escape(character.dexterity)}</p> <p class="svelte-4q74qx"><strong class="svelte-4q74qx" data-svelte-h="svelte-y9gaf7">Constitution:</strong> ${escape(character.constitution)}</p> <p class="svelte-4q74qx"><strong class="svelte-4q74qx" data-svelte-h="svelte-1ugl5k6">Charisma:</strong> ${escape(character.charisma)}</p> <p class="svelte-4q74qx"><strong class="svelte-4q74qx" data-svelte-h="svelte-1cgat6v">Intelligence:</strong> ${escape(character.intelligence)}</p> <p class="svelte-4q74qx"><strong class="svelte-4q74qx" data-svelte-h="svelte-1xjuauf">Wisdom:</strong> ${escape(character.wisdom)}</p> <h3 class="svelte-4q74qx" data-svelte-h="svelte-b2binz">Saving Throws</h3> <p class="svelte-4q74qx"><strong class="svelte-4q74qx" data-svelte-h="svelte-1o4i9yq">Paralyzation, Poison, or Death Magic:</strong> ${escape(character.poisonSavingThrow)}</p> <p class="svelte-4q74qx"><strong class="svelte-4q74qx" data-svelte-h="svelte-3nze00">Rod, Staff, or Wand:</strong> ${escape(character.rodSavingThrow)}</p> <p class="svelte-4q74qx"><strong class="svelte-4q74qx" data-svelte-h="svelte-o7pmo">Petrification or Polymorph:</strong> ${escape(character.petrificationSavingThrow)}</p> <p class="svelte-4q74qx"><strong class="svelte-4q74qx" data-svelte-h="svelte-ttcs0s">Breath Weapon:</strong> ${escape(character.breathSavingThrow)}</p> <p class="svelte-4q74qx"><strong class="svelte-4q74qx" data-svelte-h="svelte-ijfzpg">Spell:</strong> ${escape(character.spellSavingThrow)}</p> <h3 class="svelte-4q74qx" data-svelte-h="svelte-1r0oo80">Derived Stats</h3> <p class="svelte-4q74qx"><strong class="svelte-4q74qx" data-svelte-h="svelte-cqol44">Hit Probability:</strong> ${escape(character.hitProbability)}</p> <p class="svelte-4q74qx"><strong class="svelte-4q74qx" data-svelte-h="svelte-c9vsl6">Damage Adjustment:</strong> ${escape(character.damageAdjustment)}</p> <p class="svelte-4q74qx"><strong class="svelte-4q74qx" data-svelte-h="svelte-1jknc1a">Weight Allowance:</strong> ${escape(character.weightAllowance)}</p> <p class="svelte-4q74qx"><strong class="svelte-4q74qx" data-svelte-h="svelte-dnpou5">Maximum Press:</strong> ${escape(character.maxPress)}</p> <p class="svelte-4q74qx"><strong class="svelte-4q74qx" data-svelte-h="svelte-dil1l">Open Doors:</strong> ${escape(character.openDoors)}</p> <p class="svelte-4q74qx"><strong class="svelte-4q74qx" data-svelte-h="svelte-1pitsi9">Bend Bars/Lift Gates:</strong> ${escape(character.bendBarsLiftGates)}%</p> <p class="svelte-4q74qx"><strong class="svelte-4q74qx" data-svelte-h="svelte-eqkuyg">Reaction Adjustment:</strong> ${escape(character.reactionAdjustment > 0 ? `+${character.reactionAdjustment}` : character.reactionAdjustment)}</p> <p class="svelte-4q74qx"><strong class="svelte-4q74qx" data-svelte-h="svelte-2h2wxv">Missile Attack Adjustment:</strong> ${escape(character.missileAttackAdjustment > 0 ? `+${character.missileAttackAdjustment}` : character.missileAttackAdjustment)}</p> <p class="svelte-4q74qx"><strong class="svelte-4q74qx" data-svelte-h="svelte-jof5is">Defensive Adjustment:</strong> ${escape(character.defensiveAdjustment > 0 ? `+${character.defensiveAdjustment}` : character.defensiveAdjustment)}</p> <p class="svelte-4q74qx" data-svelte-h="svelte-1ogf8s9"><strong class="svelte-4q74qx">Hit Point Adjustment:</strong></p> <p class="svelte-4q74qx"><strong class="svelte-4q74qx" data-svelte-h="svelte-171g64d">System Shock:</strong> ${escape(character.systemShock)}%</p> <p class="svelte-4q74qx"><strong class="svelte-4q74qx" data-svelte-h="svelte-yisy9h">Resurrection Survival:</strong> ${escape(character.resurrectionSurvival)}%</p> <p class="svelte-4q74qx"><strong class="svelte-4q74qx" data-svelte-h="svelte-2wh0fl">Poison Save:</strong> ${escape(character.poisonSave > 0 ? `+${character.poisonSave}` : character.poisonSave)}</p> <p class="svelte-4q74qx"><strong class="svelte-4q74qx" data-svelte-h="svelte-l03abn">Regeneration:</strong> ${escape(character.regeneration)}</p> <p class="svelte-4q74qx"><strong class="svelte-4q74qx" data-svelte-h="svelte-wahugl">Number of Languages:</strong> ${escape(character.numberOfLanguages)}</p> <p class="svelte-4q74qx"><strong class="svelte-4q74qx" data-svelte-h="svelte-1q46zp6">Spell Level:</strong> ${escape(character.spellLevel == -1 ? "N/A" : `${character.spellLevel}${Words.getOrdinal(character.spellLevel)}`)}</p> <p class="svelte-4q74qx"><strong class="svelte-4q74qx" data-svelte-h="svelte-16t18dl">Chance To Learn Spell:</strong> ${escape(character.chanceToLearnSpell == -1 ? "N/A" : `${character.chanceToLearnSpell}%`)}</p> <p class="svelte-4q74qx"><strong class="svelte-4q74qx" data-svelte-h="svelte-dy85va">Maximum Number of Spells Per Level:</strong> ${escape(character.maximumNumberOfSpellsPerLevel == -1 ? "N/A" : character.maximumNumberOfSpellsPerLevel == 99 ? "All" : character.maximumNumberOfSpellsPerLevel)}</p> <p class="svelte-4q74qx"><strong class="svelte-4q74qx" data-svelte-h="svelte-1ey38r3">Illusion Immunity:</strong> ${escape(character.illusionImmunity == -1 ? "N/A" : `${character.illusionImmunity}${Words.getOrdinal(character.illusionImmunity)}-level`)}</p> <p class="svelte-4q74qx"><strong class="svelte-4q74qx" data-svelte-h="svelte-103pk15">Magical Defense Adjustment:</strong> ${escape(character.magicalDefenseAdjustment > 0 ? `+${character.magicalDefenseAdjustment}` : character.magicalDefenseAdjustment)}</p> <p class="svelte-4q74qx"><strong class="svelte-4q74qx" data-svelte-h="svelte-lmojl9">Bonus Priest Spells:</strong> ${escape(character.bonusSpells.length == 0 ? "N/A" : character.bonusSpells[0] == 0 ? "0" : character.bonusSpells.join(", "))}</p> <p class="svelte-4q74qx"><strong class="svelte-4q74qx" data-svelte-h="svelte-1k7m25l">Chance of Spell Failure:</strong> ${escape(character.chanceOfSpellFailure)}%</p> <p class="svelte-4q74qx"><strong class="svelte-4q74qx" data-svelte-h="svelte-1617beo">Spell Immunity:</strong> ${escape(character.spellImmunity.length == 0 ? "N/A" : character.spellImmunity.join(", "))}</p> <p class="svelte-4q74qx"><strong class="svelte-4q74qx" data-svelte-h="svelte-wt1114">Maximum Number of Henchmen:</strong> ${escape(character.maximumNumberOfHenchmen)}</p> <p class="svelte-4q74qx"><strong class="svelte-4q74qx" data-svelte-h="svelte-1m5ijmz">Loyalty Base:</strong> ${escape(character.loyaltyBase > 0 ? `+${character.loyaltyBase}` : character.loyaltyBase)}</p> <p class="svelte-4q74qx"><strong class="svelte-4q74qx" data-svelte-h="svelte-7be089">Reaction Adjustment (NPCs):</strong> ${escape(character.npcReactionAdjustment > 0 ? `+${character.npcReactionAdjustment}` : character.npcReactionAdjustment)}</p> <h3 class="svelte-4q74qx" data-svelte-h="svelte-bqayn1">Weapons</h3> <table class="svelte-4q74qx"><thead class="svelte-4q74qx" data-svelte-h="svelte-5qfxtv"><tr class="svelte-4q74qx"><th class="svelte-4q74qx">Weapon</th> <th class="svelte-4q74qx">Damage Type</th> <th class="svelte-4q74qx">Damage (SM/L)</th> <th class="svelte-4q74qx">Spd. Factor</th></tr></thead> <tbody class="svelte-4q74qx">${each(character.weapons, (weapon) => {
    return `<tr class="svelte-4q74qx"><td class="svelte-4q74qx">${escape(weapon.name)}</td> <td class="svelte-4q74qx">${escape(weapon.damageType)}</td> <td class="svelte-4q74qx">${escape(weapon.damageSM)}/${escape(weapon.damageL)}</td> <td class="svelte-4q74qx">${escape(weapon.speedFactor)}</td> </tr>`;
  })}</tbody></table> <h3 class="svelte-4q74qx" data-svelte-h="svelte-79zo83">Armor</h3> ${each(character.armor, (armor) => {
    return `<p class="svelte-4q74qx">${escape(armor.name)}</p>`;
  })} <h3 class="svelte-4q74qx" data-svelte-h="svelte-vfzwes">Abilities</h3> ${each(character.abilities, (ability) => {
    return `<p class="svelte-4q74qx">${escape(ability)}</p>`;
  })} ${character.spells.length > 0 ? `<h3 class="svelte-4q74qx" data-svelte-h="svelte-fncj1f">Spells</h3> ${each(character.spells, (spell) => {
    return `<p class="svelte-4q74qx">${escape(spell.name)}</p>`;
  })}` : ``}</section>`;
});

export { Page as default };
//# sourceMappingURL=_page.svelte-370f3a41.js.map
