'use strict';

import ADNDCharacter from './adndcharacter';
import ADNDCharacterGeneratorConfig from './adndcharactergeneratorconfig';
import * as Dice from '../dice';
import * as RND from '../random';
import ADNDRace from './adndrace';
import random from 'random';
import ADNDClass from './adndclass';
import ADNDWeapon from './adndweapon';
import ADNDArmor from './adndarmor';
import * as Equipment from './equipment';

export default class ADNDCharacterGenerator {
  config: ADNDCharacterGeneratorConfig;

  generateCharacter(): ADNDCharacter {
    let character = new ADNDCharacter();

    character.charisma = Dice.roll('3d6');
    character.constitution = Dice.roll('3d6');
    character.dexterity = Dice.roll('3d6');
    character.intelligence = Dice.roll('3d6');
    character.strength = Dice.roll('3d6');
    character.wisdom = Dice.roll('3d6');

    if (character.strength == 18) {
      character.exceptionalStrength = random.int(1, 100);
    }

    character.race = getRace(character, this.config.allowedRaces);
    character = character.race.apply(character);

    character.class = getClass(character, this.config.allowedClasses);
    character = character.class.apply(character);

    if (character.class.group == 'warrior') {
      character.currency = Dice.roll('5d4') * 10 * 100;
    } else if (character.class.group == 'wizard') {
      character.currency = Dice.roll('1d4+1') * 10 * 100;
    } else if (character.class.group == 'rogue') {
      character.currency = Dice.roll('2d6') * 10 * 100;
    } else {
      character.currency = Dice.roll('3d6') * 10 * 100;
    }

    character.alignment = RND.item(character.class.allowedAlignments);

    character.thaco = 20;
    character.bendBarsLiftGates = getBendBarsLiftGates(
      character.strength,
      character.exceptionalStrength,
    );
    character.bonusSpells = getBonusPriestSpells(character.wisdom);
    character.chanceOfSpellFailure = getChanceOfSpellFailure(character.wisdom);
    character.chanceToLearnSpell = getChanceToLearnSpell(character.intelligence);
    character.damageAdjustment = getDamageAdjustment(
      character.strength,
      character.exceptionalStrength,
    );
    character.defensiveAdjustment = getDefensiveAdjustment(character.dexterity);
    character.hitPointAdjustment = getHitPointAdjustment(character.constitution);
    character.hitProbability = getHitProbability(character.strength, character.exceptionalStrength);
    character.illusionImmunity = getIllusionImmunity(character.intelligence);
    character.loyaltyBase = getLoyaltyBase(character.charisma);
    character.magicalDefenseAdjustment = getMagicalDefenseAdjustment(character.wisdom);
    character.maximumNumberOfHenchmen = getMaximumNumberOfHenchmen(character.charisma);
    character.maximumNumberOfSpellsPerLevel = getMaximumNumberOfSpellsPerLevel(
      character.intelligence,
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
      character.exceptionalStrength,
    );

    let hitPointAdjustment =
      character.class.group == 'warrior'
        ? character.warriorHitPointAdjustment
        : character.hitPointAdjustment;
    character.hp = Dice.roll(character.class.hitDice) + hitPointAdjustment;

    character = getSavingThrows(character);

    let allWeapons = Equipment.getWeapons();
    let possibleWeapons = getPossibleWeapons(character, allWeapons);
    if (possibleWeapons.length > 0) {
      let weapon = RND.item(possibleWeapons);
      character.weapons.push(weapon);
      character.currency -= weapon.cost;
    } else {
      console.debug('No weapons available for character');
    }

    let allArmor = Equipment.getArmor();
    let possibleArmor = getPossibleArmor(character, allArmor);
    if (possibleArmor.length > 0) {
      let armor = RND.item(possibleArmor);
      character.armor.push(armor);
      character.currency -= armor.cost;
    } else {
      console.debug('No armor available for character');
    }

    if (character.class.group == 'priest') {
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

function getBendBarsLiftGates(strength: number, exceptionalStrength: number): number {
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

function getBonusPriestSpells(wisdom: number): number[] {
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
    25: [1, 1, 1, 1, 2, 2, 2, 3, 3, 3, 4, 4, 4, 5, 5, 5, 6, 6, 6, 7],
  };

  return table[wisdom];
}

function getChanceOfSpellFailure(wisdom: number): number {
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
    25: 0,
  };

  return table[wisdom];
}

function getChanceToLearnSpell(intelligence: number): number {
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
    25: 100,
  };

  return table[intelligence];
}

function getClass(character: ADNDCharacter, classes: ADNDClass[]): ADNDClass {
  let options = [];

  for (let i = 0; i < classes.length; i++) {
    if (
      character.charisma >= classes[i].minCharisma &&
      character.constitution >= classes[i].minConstitution &&
      character.dexterity >= classes[i].minDexterity &&
      character.intelligence >= classes[i].minIntelligence &&
      character.strength >= classes[i].minStrength &&
      character.wisdom >= classes[i].minWisdom
    ) {
      options.push(classes[i]);
    }
  }

  return RND.item(options);
}

function getDamageAdjustment(strength: number, exceptionalStrength: number): string {
  if (strength == 1) {
    return '-4';
  } else if (strength == 2) {
    return '-2';
  } else if (strength <= 5) {
    return '-1';
  } else if (strength >= 16 && strength <= 17) {
    return '+1';
  } else if (strength == 18 && exceptionalStrength == -1) {
    return '+2';
  } else if (strength == 18 && exceptionalStrength <= 50) {
    return '+3';
  } else if (strength == 18 && exceptionalStrength <= 90) {
    return '+4';
  } else if (strength == 18 && exceptionalStrength <= 99) {
    return '+5';
  } else if (strength == 18 && exceptionalStrength == 100) {
    return '+6';
  }

  return 'none';
}

function getDefensiveAdjustment(dexterity: number): number {
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

function getHitPointAdjustment(constitution: number): number {
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
    20: 2,
  };

  return table[constitution];
}

function getHitProbability(strength: number, exceptionalStrength: number): string {
  if (strength == 1) {
    return '-5';
  } else if (strength == 2) {
    return '-4';
  } else if (strength == 3) {
    return '-3';
  } else if (strength <= 5) {
    return '-2';
  } else if (strength <= 7) {
    return '-1';
  } else if (strength == 17) {
    return '+1';
  } else if (strength == 18 && exceptionalStrength == -1) {
    return '+2';
  } else if (strength == 18 && exceptionalStrength <= 50) {
    return '+3';
  } else if (strength == 18 && exceptionalStrength <= 99) {
    return '+4';
  } else if (strength == 18 && exceptionalStrength == 100) {
    return '+5';
  }

  return 'normal';
}

function getIllusionImmunity(intelligence: number): number {
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
    25: 7,
  };

  return table[intelligence];
}

function getLoyaltyBase(charisma: number): number {
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
    25: 20,
  };

  return table[charisma];
}

function getMagicalDefenseAdjustment(wisdom: number): number {
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
    25: 4,
  };

  return table[wisdom];
}

function getMaximumNumberOfHenchmen(charisma: number): number {
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
    25: 50,
  };

  return table[charisma];
}

function getMaximumNumberOfSpellsPerLevel(intelligence: number): number {
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
    25: 99,
  };

  return table[intelligence];
}

function getMaxPress(strength: number, exceptionalStrength: number): number {
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

function getMissileAttackAdjustment(dexterity: number): number {
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
    25: 5,
  };

  return table[dexterity];
}

function getNPCReactionAdjustment(charisma: number): number {
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
    25: 14,
  };

  return table[charisma];
}

function getNumberOfLanguages(intelligence: number): number {
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
    25: 20,
  };

  return table[intelligence];
}

function getOpenDoors(strength: number, exceptionalStrength: number): string {
  if (strength == 1) {
    return '1';
  } else if (strength == 2) {
    return '1';
  } else if (strength == 3) {
    return '2';
  } else if (strength <= 5) {
    return '3';
  } else if (strength <= 7) {
    return '4';
  } else if (strength <= 9) {
    return '5';
  } else if (strength <= 11) {
    return '6';
  } else if (strength <= 13) {
    return '7';
  } else if (strength <= 15) {
    return '8';
  } else if (strength <= 16) {
    return '9';
  } else if (strength <= 17) {
    return '10';
  } else if (strength == 18 && exceptionalStrength == -1) {
    return '11';
  } else if (strength == 18 && exceptionalStrength <= 50) {
    return '12';
  } else if (strength == 18 && exceptionalStrength <= 75) {
    return '13';
  } else if (strength == 18 && exceptionalStrength <= 90) {
    return '14';
  } else if (strength == 18 && exceptionalStrength <= 99) {
    return '15 (3)';
  } else if (strength == 18 && exceptionalStrength == 100) {
    return '16 (6)';
  }

  return '16 (8)';
}

function getPoisonSave(constitution: number): number {
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
    25: 4,
  };

  return table[constitution];
}

function getPossibleArmor(character: ADNDCharacter, armor: ADNDArmor[]): ADNDArmor[] {
  let possibleArmor = [];
  for (let i = 0; i < armor.length; i++) {
    if (
      character.class.allowedArmor.includes('any') ||
      character.class.allowedArmor.includes(armor[i].name)
    ) {
      if (character.currency >= armor[i].cost) {
        possibleArmor.push(armor[i]);
      }
    }
  }

  return possibleArmor;
}

function getPossibleWeapons(character: ADNDCharacter, weapons: ADNDWeapon[]): ADNDWeapon[] {
  let possibleWeapons: ADNDWeapon[] = [];

  for (let weapon of weapons) {
    if (
      character.class.allowedWeapons.includes('any') ||
      character.class.allowedWeapons.includes(weapon.name) ||
      (character.class.allowedWeapons.includes('bludgeoning') &&
        weapon.damageType.includes('bludgeoning'))
    ) {
      if (character.currency >= weapon.cost) {
        possibleWeapons.push(weapon);
      }
    }
  }

  return possibleWeapons;
}

function getRace(character: ADNDCharacter, races: ADNDRace[]): ADNDRace {
  let options = [];

  for (let i = 0; i < races.length; i++) {
    if (
      character.charisma >= races[i].minCharisma &&
      character.charisma <= races[i].maxCharisma &&
      character.constitution >= races[i].minConstitution &&
      character.constitution <= races[i].maxConstitution &&
      character.dexterity >= races[i].minDexterity &&
      character.dexterity <= races[i].maxDexterity &&
      character.intelligence >= races[i].minIntelligence &&
      character.intelligence <= races[i].maxIntelligence &&
      character.strength >= races[i].minStrength &&
      character.strength <= races[i].maxStrength &&
      character.wisdom >= races[i].minWisdom &&
      character.wisdom <= races[i].maxWisdom
    ) {
      options.push(races[i]);
    }
  }

  return RND.item(options);
}

function getReactionAdjustment(dexterity: number): number {
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
    25: 5,
  };

  return table[dexterity];
}

function getRegeneration(constitution: number): string {
  let table = {
    1: 'nil',
    2: 'nil',
    3: 'nil',
    4: 'nil',
    5: 'nil',
    6: 'nil',
    7: 'nil',
    8: 'nil',
    9: 'nil',
    10: 'nil',
    11: 'nil',
    12: 'nil',
    13: 'nil',
    14: 'nil',
    15: 'nil',
    16: 'nil',
    17: 'nil',
    18: 'nil',
    19: 'nil',
    20: '1/6 turns',
    21: '1/5 turns',
    22: '1/4 turns',
    23: '1/3 turns',
    24: '1/2 turns',
    25: '1/1 turn',
  };

  return table[constitution];
}

function getResurrectionSurvival(constitution: number): number {
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
    25: 100,
  };

  return table[constitution];
}

function getSavingThrows(character: ADNDCharacter): ADNDCharacter {
  let basicSets = {
    priest: {
      poison: 10,
      rod: 14,
      petrification: 13,
      breath: 16,
      spell: 15,
    },
    rogue: {
      poison: 13,
      rod: 14,
      petrification: 12,
      breath: 16,
      spell: 15,
    },
    warrior: {
      poison: 14,
      rod: 16,
      petrification: 15,
      breath: 17,
      spell: 17,
    },
    wizard: {
      poison: 14,
      rod: 11,
      petrification: 13,
      breath: 15,
      spell: 12,
    },
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
    19: 5,
  };

  if (
    character.race.name == 'dwarf' ||
    character.race.name == 'gnome' ||
    character.race.name == 'halfling'
  ) {
    let conMod = conMods[character.constitution];
    character.rodSavingThrow += conMod;
    character.spellSavingThrow += conMod;

    if (character.race.name == 'dwarf' || character.race.name == 'halfling') {
      character.poisonSavingThrow += conMod;
    }
  }

  return character;
}

function getSpellImmunity(wisdom: number): string[] {
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
    19: ['cause fear', 'charm person', 'command', 'friends', 'hypnotism'],
    20: [
      'cause fear',
      'charm person',
      'command',
      'friends',
      'hypnotism',
      'forget',
      'hold person',
      'ray of enfeeblment',
      'scare',
    ],
    21: [
      'cause fear',
      'charm person',
      'command',
      'friends',
      'hypnotism',
      'forget',
      'hold person',
      'ray of enfeeblment',
      'scare',
      'fear',
    ],
    22: [
      'cause fear',
      'charm person',
      'command',
      'friends',
      'hypnotism',
      'forget',
      'hold person',
      'ray of enfeeblment',
      'scare',
      'fear',
      'charm monster',
      'confusion',
      'emotion',
      'fumble',
      'suggestion',
    ],
    23: [
      'cause fear',
      'charm person',
      'command',
      'friends',
      'hypnotism',
      'forget',
      'hold person',
      'ray of enfeeblment',
      'scare',
      'fear',
      'charm monster',
      'confusion',
      'emotion',
      'fumble',
      'suggestion',
      'chaos',
      'feeblemind',
      'hold monster',
      'magic jar',
      'quest',
    ],
    24: [
      'cause fear',
      'charm person',
      'command',
      'friends',
      'hypnotism',
      'forget',
      'hold person',
      'ray of enfeeblment',
      'scare',
      'fear',
      'charm monster',
      'confusion',
      'emotion',
      'fumble',
      'suggestion',
      'chaos',
      'feeblemind',
      'hold monster',
      'magic jar',
      'quest',
      'geas',
      'mass suggestion',
      'rod of rulership',
    ],
    25: [
      'cause fear',
      'charm person',
      'command',
      'friends',
      'hypnotism',
      'forget',
      'hold person',
      'ray of enfeeblment',
      'scare',
      'fear',
      'charm monster',
      'confusion',
      'emotion',
      'fumble',
      'suggestion',
      'chaos',
      'feeblemind',
      'hold monster',
      'magic jar',
      'quest',
      'geas',
      'mass suggestion',
      'rod of rulership',
      'antipathy/sympathy',
      'death spell',
      'mass charm',
    ],
  };

  return table[wisdom];
}

function getSpellLevel(intelligence: number): number {
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
    25: 9,
  };

  return table[intelligence];
}

function getSystemShock(constitution: number): number {
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
    25: 100,
  };

  return table[constitution];
}

function getWarriorHitPointAdjustment(constitution: number): number {
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
    20: 5,
  };

  return table[constitution];
}

function getWeightAllowance(strength: number, exceptionalStrength: number): number {
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
