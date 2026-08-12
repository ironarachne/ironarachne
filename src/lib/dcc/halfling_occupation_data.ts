import type { RNG } from '@ironarachne/rng';
import type { DCCCharacter, DCCOccupation } from './dcc_types';

/**
 * The halfling occupation table from the DCC rulebook.
 *
 * Shared and read-only, like the other occupation tables: every `apply` handler here mutates the
 * character it is given, and a caller must copy the row it selects before applying it. See
 * `randomOccupation` in `dcc_characters.ts`.
 */
export const HALFLING_OCCUPATIONS: DCCOccupation[] = [
  {
    name: 'halfling chicken butcher',
    trainedWeapon: {
      name: 'handaxe',
      classification: 'handaxe',
      range: '10/20/30',
      damage: '1d6',
      value: 50,
    },
    tradeGoods: { name: 'chicken meat, 5 lbs.', value: 1 },
    commonality: 1,
    apply: (character: DCCCharacter, _rng: RNG): DCCCharacter => {
      character.specialRules.push('Infravision');
      character.speed = 20;
      character.languages.push('Halfling');
      return character;
    },
  },
  {
    name: 'halfling dyer',
    trainedWeapon: {
      name: 'staff',
      classification: 'staff',
      range: 'melee',
      damage: '1d4',
      value: 50,
    },
    tradeGoods: { name: 'fabric, 3 yds.', value: 1 },
    commonality: 2,
    apply: (character: DCCCharacter, _rng: RNG): DCCCharacter => {
      character.specialRules.push('Infravision');
      character.speed = 20;
      character.languages.push('Halfling');
      return character;
    },
  },
  {
    name: 'halfling glovemaker',
    trainedWeapon: {
      name: 'awl',
      classification: 'dagger',
      range: '10/20/30',
      damage: '1d4/1d10',
      value: 50,
    },
    tradeGoods: { name: 'gloves, 4 pairs', value: 1 },
    commonality: 1,
    apply: (character: DCCCharacter, _rng: RNG): DCCCharacter => {
      character.specialRules.push('Infravision');
      character.speed = 20;
      character.languages.push('Halfling');
      return character;
    },
  },
  {
    name: 'halfling witch doctor',
    trainedWeapon: {
      name: 'sling',
      classification: 'sling',
      range: '40/80/160',
      damage: '1d4',
      value: 50,
    },
    tradeGoods: { name: 'hex doll', value: 1 },
    commonality: 1,
    apply: (character: DCCCharacter, _rng: RNG): DCCCharacter => {
      character.specialRules.push('Infravision');
      character.speed = 20;
      character.languages.push('Halfling');
      return character;
    },
  },
  {
    name: 'halfling haberdasher',
    trainedWeapon: {
      name: 'scissors',
      classification: 'dagger',
      range: '10/20/30',
      damage: '1d4/1d10',
      value: 50,
    },
    tradeGoods: { name: 'fine suits, 3 sets', value: 1 },
    commonality: 1,
    apply: (character: DCCCharacter, _rng: RNG): DCCCharacter => {
      character.specialRules.push('Infravision');
      character.speed = 20;
      character.languages.push('Halfling');
      return character;
    },
  },
  {
    name: 'halfling mariner',
    trainedWeapon: {
      name: 'knife',
      classification: 'dagger',
      range: '10/20/30',
      damage: '1d4/1d10',
      value: 50,
    },
    tradeGoods: { name: 'sailcloth, 2 yds.', value: 1 },
    commonality: 1,
    apply: (character: DCCCharacter, _rng: RNG): DCCCharacter => {
      character.specialRules.push('Infravision');
      character.speed = 20;
      character.languages.push('Halfling');
      return character;
    },
  },
  {
    name: 'halfling moneylender',
    trainedWeapon: {
      name: 'short sword',
      classification: 'short sword',
      range: 'melee',
      damage: '1d6',
      value: 50,
    },
    tradeGoods: { name: 'loan chest', value: 1 },
    commonality: 1,
    apply: (character: DCCCharacter, _rng: RNG): DCCCharacter => {
      character.specialRules.push('Infravision');
      character.speed = 20;
      character.languages.push('Halfling');
      character.currency.cp += 200;
      character.currency.sp += 10;
      character.currency.gp += 5;
      return character;
    },
  },
  {
    name: 'halfling trader',
    trainedWeapon: {
      name: 'short sword',
      classification: 'short sword',
      range: 'melee',
      damage: '1d6',
      value: 50,
    },
    tradeGoods: { name: 'coin purse', value: 1 },
    commonality: 1,
    apply: (character: DCCCharacter, _rng: RNG): DCCCharacter => {
      character.specialRules.push('Infravision');
      character.speed = 20;
      character.languages.push('Halfling');
      character.currency.sp += 20;
      return character;
    },
  },
  {
    name: 'halfling vagrant',
    trainedWeapon: {
      name: 'club',
      classification: 'club',
      range: 'melee',
      damage: '1d4',
      value: 50,
    },
    tradeGoods: { name: 'begging bowl', value: 1 },
    commonality: 1,
    apply: (character: DCCCharacter, _rng: RNG): DCCCharacter => {
      character.specialRules.push('Infravision');
      character.speed = 20;
      character.languages.push('Halfling');
      return character;
    },
  },
];
