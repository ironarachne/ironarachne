import * as Dice from '$lib/dice';
import type { RNG } from '@ironarachne/rng';
import type ADNDArmor from './adndarmor.js';
import { createAdndCharacter, type default as ADNDCharacter } from './adndcharacter.js';
import type ADNDCharacterGeneratorConfig from './adndcharactergeneratorconfig.js';
import type ADNDClass from './adndclass.js';
import type ADNDWeapon from './adndweapon.js';
import {
  assignExceptionalStrength,
  getClassOptionsForRace,
  getRaceOptions,
} from './adnd_character_eligibility.js';
import * as Equipment from './equipment.js';
import { selectRandomKit } from './adnd_kit_selection.js';
import {
  getEligibleWeaponGroups,
  selectNonweaponProficiencies,
  selectWeaponProficiencyGroups,
} from './adnd_proficiency_selection.js';

export function generateCharacter(config: ADNDCharacterGeneratorConfig): ADNDCharacter {
  let character = createAdndCharacter();

  character.charisma = Dice.roll('3d6', config.rng);
  character.constitution = Dice.roll('3d6', config.rng);
  character.dexterity = Dice.roll('3d6', config.rng);
  character.intelligence = Dice.roll('3d6', config.rng);
  character.strength = Dice.roll('3d6', config.rng);
  character.wisdom = Dice.roll('3d6', config.rng);

  character.race = config.rng.item(getRaceOptions(character, config.allowedRaces));
  // `apply` is a domain method on ADNDRace, not Function.prototype.apply.
  // eslint-disable-next-line prefer-spread
  character = character.race.apply(character, config.rng);

  character.class = config.rng.item(
    getClassOptionsForRace(character, character.race, config.allowedClasses),
  );
  // `apply` is a domain method on ADNDClass, not Function.prototype.apply.
  // eslint-disable-next-line prefer-spread
  character = character.class.apply(character, config.rng);

  assignExceptionalStrength(character, character.class, config.rng);

  if (character.class.group === 'warrior') {
    character.currency = Dice.roll('5d4', config.rng) * 10 * 100;
  } else if (character.class.group === 'wizard') {
    character.currency = Dice.roll('1d4+1', config.rng) * 10 * 100;
  } else if (character.class.group === 'rogue') {
    character.currency = Dice.roll('2d6', config.rng) * 10 * 100;
  } else {
    character.currency = Dice.roll('3d6', config.rng) * 10 * 100;
  }

  character.alignment = config.rng.item(character.class.allowedAlignments);

  applyAdndAbilityDerivedFields(character);

  const hitPointAdjustment =
    character.class.group === 'warrior'
      ? character.warriorHitPointAdjustment
      : character.hitPointAdjustment;
  character.hp = Dice.roll(character.class.hitDice, config.rng) + hitPointAdjustment;
  if (character.hp < 1) {
    character.hp = 1;
  }

  applyAdndSavingThrows(character);

  const allWeapons = Equipment.getWeapons();
  const possibleWeapons = getPossibleWeapons(character, allWeapons);
  if (possibleWeapons.length > 0) {
    const weapon = config.rng.item(possibleWeapons);
    character.weapons.push(weapon);
    character.currency -= weapon.cost;
  } else {
    console.debug('No weapons available for character');
  }

  const allArmor = Equipment.getArmor();
  const possibleArmor = getPossibleArmor(character, allArmor);
  if (possibleArmor.length > 0) {
    const armor = config.rng.item(possibleArmor);
    character.armor.push(armor);
    character.currency -= armor.cost;
  } else {
    console.debug('No armor available for character');
  }

  if (character.class.group === 'priest') {
    if (character.currency > 300) {
      character.currency = config.rng.int(1, 3) * 100;
    }
  }

  for (let i = 0; i < character.armor.length; i++) {
    character.ac += character.armor[i].ac;
  }

  if (config.includeProficiencies) {
    const allWeaponsForGroups = Equipment.getWeapons();
    const eligibleGroups = getEligibleWeaponGroups(character.class, allWeaponsForGroups);
    const preferredCategory = character.weapons[0]?.category;
    character.weaponProficiencyGroups = selectWeaponProficiencyGroups(
      character.class.initialWP,
      eligibleGroups,
      preferredCategory,
      config.rng,
    );
    character.nonweaponProficiencies = selectNonweaponProficiencies(
      character.class.group,
      character.class.initialNWP,
      config.rng,
    );
  }

  if (config.includeKits) {
    character.kit = selectRandomKit(character, config.rng);
  }

  return character;
}

function getBendBarsLiftGates(strength: number, exceptionalStrength: number): number {
  if (strength === 1) {
    return 0;
  }

  if (strength === 2) {
    return 0;
  }

  if (strength === 3) {
    return 0;
  }

  if (strength <= 5) {
    return 0;
  }

  if (strength <= 7) {
    return 0;
  }

  if (strength <= 9) {
    return 1;
  }

  if (strength <= 11) {
    return 2;
  }

  if (strength <= 13) {
    return 4;
  }

  if (strength <= 15) {
    return 7;
  }

  if (strength <= 16) {
    return 10;
  }

  if (strength <= 17) {
    return 13;
  }

  if (strength === 18 && exceptionalStrength === -1) {
    return 16;
  }

  if (strength === 18 && exceptionalStrength <= 50) {
    return 20;
  }

  if (strength === 18 && exceptionalStrength <= 75) {
    return 25;
  }

  if (strength === 18 && exceptionalStrength <= 90) {
    return 30;
  }

  if (strength === 18 && exceptionalStrength <= 99) {
    return 35;
  }

  if (strength === 18 && exceptionalStrength === 100) {
    return 40;
  }

  return 50;
}

function getBonusPriestSpells(wisdom: number): number[] {
  const table: Record<number, number[]> = {
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
  const table: Record<number, number> = {
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
  const table: Record<number, number> = {
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

function getDamageAdjustment(strength: number, exceptionalStrength: number): string {
  if (strength === 1) {
    return '-4';
  }

  if (strength === 2) {
    return '-2';
  }

  if (strength <= 5) {
    return '-1';
  }

  if (strength >= 16 && strength <= 17) {
    return '+1';
  }

  if (strength === 18 && exceptionalStrength === -1) {
    return '+2';
  }

  if (strength === 18 && exceptionalStrength <= 50) {
    return '+3';
  }
  if (strength === 18 && exceptionalStrength <= 90) {
    return '+4';
  }
  if (strength === 18 && exceptionalStrength <= 99) {
    return '+5';
  }
  if (strength === 18 && exceptionalStrength === 100) {
    return '+6';
  }

  return 'none';
}

function getDefensiveAdjustment(dexterity: number): number {
  if (dexterity === 1) {
    return 5;
  }

  if (dexterity === 2) {
    return 5;
  }

  if (dexterity === 3) {
    return 4;
  }

  if (dexterity === 4) {
    return 3;
  }

  if (dexterity === 5) {
    return 2;
  }

  if (dexterity === 6) {
    return 1;
  }

  if (dexterity === 7) {
    return 0;
  }

  if (dexterity === 8) {
    return 0;
  }

  if (dexterity === 9) {
    return 0;
  }

  if (dexterity <= 14) {
    return 0;
  }

  if (dexterity === 15) {
    return -1;
  }

  if (dexterity === 16) {
    return -2;
  }

  if (dexterity === 17) {
    return -3;
  }

  if (dexterity === 18) {
    return -4;
  }

  if (dexterity === 19) {
    return -4;
  }

  return -4;
}

function getHitPointAdjustment(constitution: number): number {
  const table: Record<number, number> = {
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
  if (strength === 1) {
    return '-5';
  }

  if (strength === 2) {
    return '-4';
  }

  if (strength === 3) {
    return '-3';
  }

  if (strength <= 5) {
    return '-2';
  }

  if (strength <= 7) {
    return '-1';
  }

  if (strength === 17) {
    return '+1';
  }

  if (strength === 18 && exceptionalStrength === -1) {
    return '+2';
  }

  if (strength === 18 && exceptionalStrength <= 50) {
    return '+3';
  }

  if (strength === 18 && exceptionalStrength <= 99) {
    return '+4';
  }

  if (strength === 18 && exceptionalStrength === 100) {
    return '+5';
  }

  return 'normal';
}

function getIllusionImmunity(intelligence: number): number {
  const table: Record<number, number> = {
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
  const table: Record<number, number> = {
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
  const table: Record<number, number> = {
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
  const table: Record<number, number> = {
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
  const table: Record<number, number> = {
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
  if (strength === 1) {
    return 3;
  }

  if (strength === 2) {
    return 5;
  }

  if (strength === 3) {
    return 10;
  }

  if (strength <= 5) {
    return 25;
  }

  if (strength <= 7) {
    return 55;
  }

  if (strength <= 9) {
    return 90;
  }

  if (strength <= 11) {
    return 115;
  }

  if (strength <= 13) {
    return 140;
  }

  if (strength <= 15) {
    return 170;
  }

  if (strength <= 16) {
    return 195;
  }

  if (strength <= 17) {
    return 220;
  }

  if (strength === 18 && exceptionalStrength === -1) {
    return 255;
  }

  if (strength === 18 && exceptionalStrength <= 50) {
    return 280;
  }

  if (strength === 18 && exceptionalStrength <= 75) {
    return 305;
  }

  if (strength === 18 && exceptionalStrength <= 90) {
    return 330;
  }

  if (strength === 18 && exceptionalStrength <= 99) {
    return 380;
  }

  if (strength === 18 && exceptionalStrength === 100) {
    return 480;
  }

  return 640;
}

function getMissileAttackAdjustment(dexterity: number): number {
  const table: Record<number, number> = {
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
  const table: Record<number, number> = {
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
  const table: Record<number, number> = {
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
  if (strength === 1) {
    return '1';
  }

  if (strength === 2) {
    return '1';
  }

  if (strength === 3) {
    return '2';
  }

  if (strength <= 5) {
    return '3';
  }

  if (strength <= 7) {
    return '4';
  }

  if (strength <= 9) {
    return '5';
  }

  if (strength <= 11) {
    return '6';
  }

  if (strength <= 13) {
    return '7';
  }

  if (strength <= 15) {
    return '8';
  }

  if (strength <= 16) {
    return '9';
  }

  if (strength <= 17) {
    return '10';
  }

  if (strength === 18 && exceptionalStrength === -1) {
    return '11';
  }

  if (strength === 18 && exceptionalStrength <= 50) {
    return '12';
  }

  if (strength === 18 && exceptionalStrength <= 75) {
    return '13';
  }

  if (strength === 18 && exceptionalStrength <= 90) {
    return '14';
  }

  if (strength === 18 && exceptionalStrength <= 99) {
    return '15 (3)';
  }

  if (strength === 18 && exceptionalStrength === 100) {
    return '16 (6)';
  }

  return '16 (8)';
}

function getPoisonSave(constitution: number): number {
  const table: Record<number, number> = {
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

export function getPossibleArmor(character: ADNDCharacter, armor: ADNDArmor[]): ADNDArmor[] {
  const possibleArmor = [];
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

export function getPossibleWeapons(character: ADNDCharacter, weapons: ADNDWeapon[]): ADNDWeapon[] {
  const possibleWeapons: ADNDWeapon[] = [];

  for (const weapon of weapons) {
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

function getReactionAdjustment(dexterity: number): number {
  const table: Record<number, number> = {
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
  const table: Record<number, string> = {
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
  const table: Record<number, number> = {
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
  const basicSets: Record<string, Record<string, number>> = {
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

  const classSet = basicSets[character.class.group];

  character.poisonSavingThrow = classSet.poison + character.poisonSave;
  character.rodSavingThrow = classSet.rod;
  character.petrificationSavingThrow = classSet.petrification;
  character.breathSavingThrow = classSet.breath;
  character.spellSavingThrow = classSet.spell;

  const conMods: Record<number, number> = {
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
    character.race.name === 'dwarf' ||
    character.race.name === 'gnome' ||
    character.race.name === 'halfling'
  ) {
    const conMod = conMods[character.constitution];
    character.rodSavingThrow += conMod;
    character.spellSavingThrow += conMod;

    if (character.race.name === 'dwarf' || character.race.name === 'halfling') {
      character.poisonSavingThrow += conMod;
    }
  }

  return character;
}

function getSpellImmunity(wisdom: number): string[] {
  const table: Record<number, string[]> = {
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
  const table: Record<number, number> = {
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
  const table: Record<number, number> = {
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
  const table: Record<number, number> = {
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
  if (strength === 1) {
    return 1;
  }

  if (strength === 2) {
    return 1;
  }

  if (strength === 3) {
    return 5;
  }

  if (strength <= 5) {
    return 10;
  }

  if (strength <= 7) {
    return 20;
  }

  if (strength <= 9) {
    return 35;
  }

  if (strength <= 11) {
    return 40;
  }

  if (strength <= 13) {
    return 45;
  }

  if (strength <= 15) {
    return 55;
  }

  if (strength <= 16) {
    return 70;
  }

  if (strength <= 17) {
    return 85;
  }

  if (strength === 18 && exceptionalStrength === -1) {
    return 110;
  }

  if (strength === 18 && exceptionalStrength <= 50) {
    return 135;
  }

  if (strength === 18 && exceptionalStrength <= 75) {
    return 160;
  }

  if (strength === 18 && exceptionalStrength <= 90) {
    return 185;
  }

  if (strength === 18 && exceptionalStrength <= 99) {
    return 235;
  }

  if (strength === 18 && exceptionalStrength === 100) {
    return 335;
  }

  return 485;
}

export function applyAdndAbilityDerivedFields(character: ADNDCharacter): void {
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
  character.weightAllowance = getWeightAllowance(character.strength, character.exceptionalStrength);
}

export function applyAdndSavingThrows(character: ADNDCharacter): void {
  getSavingThrows(character);
}

/** Ability-derived fields and saving throws (does not set HP, equipment, or AC). */
export function finalizeAdndCharacterDerivedStats(character: ADNDCharacter): ADNDCharacter {
  applyAdndAbilityDerivedFields(character);
  applyAdndSavingThrows(character);
  return character;
}

export function getAdndLevel1HpBounds(character: ADNDCharacter): { min: number; max: number } {
  const hdMax = Dice.getMaxResult(Dice.toDicePool(character.class.hitDice));
  const conAdj =
    character.class.group === 'warrior'
      ? getWarriorHitPointAdjustment(character.constitution)
      : getHitPointAdjustment(character.constitution);
  return { min: 1, max: Math.max(1, hdMax + conAdj) };
}

/** Hit dice + Con adjustment (warrior vs non-warrior table); matches {@link ADNDCharacterGenerator}. */
export function rollAdndLevel1Hp(character: ADNDCharacter, rng: RNG): number {
  const conAdj =
    character.class.group === 'warrior'
      ? getWarriorHitPointAdjustment(character.constitution)
      : getHitPointAdjustment(character.constitution);
  let hp = Dice.roll(character.class.hitDice, rng) + conAdj;
  if (hp < 1) hp = 1;
  return hp;
}

/** Starting funds in copper (before equipment); same dice as {@link ADNDCharacterGenerator}. */
export function rollAdndStartingCopper(cls: ADNDClass, rng: RNG): number {
  if (cls.group === 'warrior') {
    return Dice.roll('5d4', rng) * 10 * 100;
  }
  if (cls.group === 'wizard') {
    return Dice.roll('1d4+1', rng) * 10 * 100;
  }
  if (cls.group === 'rogue') {
    return Dice.roll('2d6', rng) * 10 * 100;
  }
  return Dice.roll('3d6', rng) * 10 * 100;
}

/** PHB-style priest adjustment when remaining coins still exceed 300 cp after purchases. */
export function applyAdndPriestFundsCapIfNeeded(character: ADNDCharacter, rng: RNG): void {
  if (character.class.group === 'priest' && character.currency > 300) {
    character.currency = rng.int(1, 3) * 100;
  }
}

export function recalculateAdndArmorClass(character: ADNDCharacter): void {
  character.ac = 10;
  for (let i = 0; i < character.armor.length; i++) {
    character.ac += character.armor[i].ac;
  }
}
