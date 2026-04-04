import type { RNG } from '@ironarachne/rng';
import type { DCCCharacter, DCCOccupation } from './dcc_types';

export function all(): DCCOccupation[] {
  return [
    {
      name: 'dwarven apothecarist',
      trainedWeapon: {
        name: 'cudgel',
        classification: 'staff',
        range: 'melee',
        damage: '1d4',
        value: 50,
      },
      tradeGoods: { name: 'steel vial', value: 1 },
      commonality: 1,
      apply: (character: DCCCharacter, rng: RNG): DCCCharacter => {
        character.specialRules.push('Infravision');
        character.speed = 20;
        character.languages.push('Dwarf');
        return character;
      },
    },
    {
      name: 'dwarven blacksmith',
      trainedWeapon: {
        name: 'hammer',
        classification: 'club',
        range: 'melee',
        damage: '1d4',
        value: 50,
      },
      tradeGoods: { name: 'mithril, 1 oz.', value: 1 },
      commonality: 1,
      apply: (character: DCCCharacter, rng: RNG): DCCCharacter => {
        character.specialRules.push('Infravision');
        character.speed = 20;
        character.languages.push('Dwarf');
        return character;
      },
    },
    {
      name: 'dwarven chest-maker',
      trainedWeapon: {
        name: 'chisel',
        classification: 'dagger',
        range: '10/20/30',
        damage: '1d4/1d10',
        value: 50,
      },
      tradeGoods: { name: 'wood, 10 lbs.', value: 1 },
      commonality: 1,
      apply: (character: DCCCharacter, rng: RNG): DCCCharacter => {
        character.specialRules.push('Infravision');
        character.speed = 20;
        character.languages.push('Dwarf');
        return character;
      },
    },
    {
      name: 'dwarven herder',
      trainedWeapon: {
        name: 'staff',
        classification: 'staff',
        range: 'melee',
        damage: '1d4',
        value: 50,
      },
      tradeGoods: { name: 'sow', value: 1 },
      commonality: 1,
      apply: (character: DCCCharacter, rng: RNG): DCCCharacter => {
        character.specialRules.push('Infravision');
        character.speed = 20;
        character.languages.push('Dwarf');
        return character;
      },
    },
    {
      name: 'dwarven miner',
      trainedWeapon: {
        name: 'pick',
        classification: 'club',
        range: 'melee',
        damage: '1d4',
        value: 50,
      },
      tradeGoods: { name: 'lantern', value: 1 },
      commonality: 2,
      apply: (character: DCCCharacter, rng: RNG): DCCCharacter => {
        character.specialRules.push('Infravision');
        character.speed = 20;
        character.languages.push('Dwarf');
        return character;
      },
    },
    {
      name: 'dwarven mushroom-farmer',
      trainedWeapon: {
        name: 'shovel',
        classification: 'staff',
        range: 'melee',
        damage: '1d4',
        value: 50,
      },
      tradeGoods: { name: 'sack', value: 1 },
      commonality: 1,
      apply: (character: DCCCharacter, rng: RNG): DCCCharacter => {
        character.specialRules.push('Infravision');
        character.speed = 20;
        character.languages.push('Dwarf');
        return character;
      },
    },
    {
      name: 'dwarven rat-catcher',
      trainedWeapon: {
        name: 'club',
        classification: 'club',
        range: 'melee',
        damage: '1d4',
        value: 50,
      },
      tradeGoods: { name: 'net', value: 1 },
      commonality: 1,
      apply: (character: DCCCharacter, rng: RNG): DCCCharacter => {
        character.specialRules.push('Infravision');
        character.speed = 20;
        character.languages.push('Dwarf');
        return character;
      },
    },
    {
      name: 'dwarven stonemason',
      trainedWeapon: {
        name: 'hammer',
        classification: 'club',
        range: 'melee',
        damage: '1d4',
        value: 50,
      },
      tradeGoods: { name: 'fine stone, 10 lbs.', value: 1 },
      commonality: 2,
      apply: (character: DCCCharacter, rng: RNG): DCCCharacter => {
        character.specialRules.push('Infravision');
        character.speed = 20;
        character.languages.push('Dwarf');
        return character;
      },
    },
  ];
}
