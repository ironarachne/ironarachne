import type { RNG } from '@ironarachne/rng';
import type { DCCCharacter, DCCOccupation } from './dcc_types';

export function all(): DCCOccupation[] {
  return [
    {
      name: 'alchemist',
      trainedWeapon: {
        name: 'staff',
        classification: 'staff',
        range: 'melee',
        damage: '1d4',
        value: 50,
      },
      tradeGoods: { name: 'oil, 1 flask', value: 5 },
      commonality: 1,
      apply: (character: DCCCharacter, _rng: RNG): DCCCharacter => {
        return character;
      },
    },
    {
      name: 'animal trainer',
      trainedWeapon: {
        name: 'club',
        classification: 'club',
        range: 'melee',
        damage: '1d4',
        value: 50,
      },
      tradeGoods: { name: 'pony', value: 1 },
      commonality: 1,
      apply: (character: DCCCharacter, _rng: RNG): DCCCharacter => {
        return character;
      },
    },
    {
      name: 'armorer',
      trainedWeapon: {
        name: 'hammer',
        classification: 'club',
        range: 'melee',
        damage: '1d4',
        value: 50,
      },
      tradeGoods: { name: 'iron helmet', value: 1 },
      commonality: 1,
      apply: (character: DCCCharacter, _rng: RNG): DCCCharacter => {
        return character;
      },
    },
    {
      name: 'astrologer',
      trainedWeapon: {
        name: 'dagger',
        classification: 'dagger',
        range: '10/20/30',
        damage: '1d4/1d10',
        value: 50,
      },
      tradeGoods: { name: 'spyglass', value: 1 },
      commonality: 1,
      apply: (character: DCCCharacter, _rng: RNG): DCCCharacter => {
        return character;
      },
    },
    {
      name: 'baker',
      trainedWeapon: {
        name: 'rolling pin',
        classification: 'club',
        range: 'melee',
        damage: '1d4',
        value: 50,
      },
      tradeGoods: { name: 'flour, 1 lb.', value: 1 },
      commonality: 1,
      apply: (character: DCCCharacter, _rng: RNG): DCCCharacter => {
        return character;
      },
    },
    {
      name: 'barber',
      trainedWeapon: {
        name: 'razor',
        classification: 'dagger',
        range: '10/20/30',
        damage: '1d4/1d10',
        value: 50,
      },
      tradeGoods: { name: 'scissors', value: 1 },
      commonality: 1,
      apply: (character: DCCCharacter, _rng: RNG): DCCCharacter => {
        return character;
      },
    },
    {
      name: 'beadle',
      trainedWeapon: {
        name: 'staff',
        classification: 'staff',
        range: 'melee',
        damage: '1d4',
        value: 50,
      },
      tradeGoods: { name: 'holy symbol', value: 1 },
      commonality: 1,
      apply: (character: DCCCharacter, _rng: RNG): DCCCharacter => {
        return character;
      },
    },
    {
      name: 'beekeeper',
      trainedWeapon: {
        name: 'staff',
        classification: 'staff',
        range: 'melee',
        damage: '1d4',
        value: 50,
      },
      tradeGoods: { name: 'jar of honey', value: 1 },
      commonality: 1,
      apply: (character: DCCCharacter, _rng: RNG): DCCCharacter => {
        return character;
      },
    },
    {
      name: 'blacksmith',
      trainedWeapon: {
        name: 'hammer',
        classification: 'club',
        range: 'melee',
        damage: '1d4',
        value: 50,
      },
      tradeGoods: { name: 'steel tongs', value: 1 },
      commonality: 1,
      apply: (character: DCCCharacter, _rng: RNG): DCCCharacter => {
        return character;
      },
    },
    {
      name: 'bowyer',
      trainedWeapon: {
        name: 'shortbow',
        classification: 'shortbow',
        range: '50/100/150',
        damage: '1d6',
        value: 50,
      },
      tradeGoods: { name: "sinew, 10'", value: 1 },
      commonality: 1,
      apply: (character: DCCCharacter, _rng: RNG): DCCCharacter => {
        return character;
      },
    },
    {
      name: 'butcher',
      trainedWeapon: {
        name: 'cleaver',
        classification: 'handaxe',
        range: '10/20/30',
        damage: '1d6',
        value: 50,
      },
      tradeGoods: { name: 'side of beef', value: 1 },
      commonality: 1,
      apply: (character: DCCCharacter, _rng: RNG): DCCCharacter => {
        return character;
      },
    },
    {
      name: 'brewer',
      trainedWeapon: {
        name: 'vat spoon',
        classification: 'staff',
        range: 'melee',
        damage: '1d4',
        value: 50,
      },
      tradeGoods: { name: 'barrel of ale', value: 1 },
      commonality: 1,
      apply: (character: DCCCharacter, _rng: RNG): DCCCharacter => {
        return character;
      },
    },
    {
      name: 'caravan guard',
      trainedWeapon: {
        name: 'short sword',
        classification: 'short sword',
        range: 'melee',
        damage: '1d6',
        value: 50,
      },
      tradeGoods: { name: 'linen, 1 yard', value: 1 },
      commonality: 1,
      apply: (character: DCCCharacter, _rng: RNG): DCCCharacter => {
        return character;
      },
    },
    {
      name: 'carpenter',
      trainedWeapon: {
        name: 'handaxe',
        classification: 'handaxe',
        range: '10/20/30',
        damage: '1d6',
        value: 50,
      },
      tradeGoods: { name: "pole, 10'", value: 1 },
      commonality: 1,
      apply: (character: DCCCharacter, _rng: RNG): DCCCharacter => {
        return character;
      },
    },
    {
      name: 'cheesemaker',
      trainedWeapon: {
        name: 'cudgel',
        classification: 'staff',
        range: 'melee',
        damage: '1d4',
        value: 50,
      },
      tradeGoods: { name: 'stinky cheese', value: 1 },
      commonality: 1,
      apply: (character: DCCCharacter, _rng: RNG): DCCCharacter => {
        return character;
      },
    },
    {
      name: 'cobbler',
      trainedWeapon: {
        name: 'awl',
        classification: 'dagger',
        range: '10/20/30',
        damage: '1d4/1d10',
        value: 50,
      },
      tradeGoods: { name: 'shoehorn', value: 1 },
      commonality: 1,
      apply: (character: DCCCharacter, _rng: RNG): DCCCharacter => {
        return character;
      },
    },
    {
      name: 'confidence artist',
      trainedWeapon: {
        name: 'dagger',
        classification: 'dagger',
        range: '10/20/30',
        damage: '1d4/1d10',
        value: 50,
      },
      tradeGoods: { name: 'quality cloak', value: 1 },
      commonality: 1,
      apply: (character: DCCCharacter, _rng: RNG): DCCCharacter => {
        return character;
      },
    },
    {
      name: 'cook',
      trainedWeapon: {
        name: 'staff',
        classification: 'staff',
        range: 'melee',
        damage: '1d4',
        value: 50,
      },
      tradeGoods: { name: 'spices, 1 lb.', value: 1 },
      commonality: 1,
      apply: (character: DCCCharacter, _rng: RNG): DCCCharacter => {
        return character;
      },
    },
    {
      name: 'cooper',
      trainedWeapon: {
        name: 'crowbar',
        classification: 'club',
        range: 'melee',
        damage: '1d4',
        value: 50,
      },
      tradeGoods: { name: 'barrel', value: 1 },
      commonality: 1,
      apply: (character: DCCCharacter, _rng: RNG): DCCCharacter => {
        return character;
      },
    },
    {
      name: 'costermonger',
      trainedWeapon: {
        name: 'knife',
        classification: 'dagger',
        range: '10/20/30',
        damage: '1d4/1d10',
        value: 50,
      },
      tradeGoods: { name: 'fruit', value: 1 },
      commonality: 1,
      apply: (character: DCCCharacter, _rng: RNG): DCCCharacter => {
        return character;
      },
    },
    {
      name: 'cutpurse',
      trainedWeapon: {
        name: 'dagger',
        classification: 'dagger',
        range: '10/20/30',
        damage: '1d4/1d10',
        value: 50,
      },
      tradeGoods: { name: 'small chest', value: 1 },
      commonality: 1,
      apply: (character: DCCCharacter, _rng: RNG): DCCCharacter => {
        return character;
      },
    },
    {
      name: 'ditch digger',
      trainedWeapon: {
        name: 'shovel',
        classification: 'staff',
        range: 'melee',
        damage: '1d4',
        value: 50,
      },
      tradeGoods: { name: 'fine dirt, 1 lb.', value: 1 },
      commonality: 1,
      apply: (character: DCCCharacter, _rng: RNG): DCCCharacter => {
        return character;
      },
    },
    {
      name: 'dock worker',
      trainedWeapon: {
        name: 'pole',
        classification: 'staff',
        range: 'melee',
        damage: '1d4',
        value: 50,
      },
      tradeGoods: { name: '1 late RPG book', value: 1 },
      commonality: 1,
      apply: (character: DCCCharacter, _rng: RNG): DCCCharacter => {
        return character;
      },
    },
    {
      name: 'farmer',
      trainedWeapon: {
        name: 'pitchfork',
        classification: 'spear',
        range: 'melee',
        damage: '1d8',
        value: 50,
      },
      tradeGoods: { name: 'hen', value: 1 },
      commonality: 20,
      apply: (character: DCCCharacter, rng: RNG): DCCCharacter => {
        const crops = [
          'potato',
          'wheat',
          'turnip',
          'corn',
          'rice',
          'parsnip',
          'radish',
          'rutabaga',
        ];
        const crop = rng.item(crops);
        character.occupation.name = `${crop} farmer`;
        return character;
      },
    },
    {
      name: 'fisherman',
      trainedWeapon: {
        name: 'knife',
        classification: 'dagger',
        range: '10/20/30',
        damage: '1d4/1d10',
        value: 50,
      },
      tradeGoods: { name: 'fishing pole', value: 1 },
      commonality: 1,
      apply: (character: DCCCharacter, _rng: RNG): DCCCharacter => {
        return character;
      },
    },
    {
      name: 'fortune-teller',
      trainedWeapon: {
        name: 'dagger',
        classification: 'dagger',
        range: '10/20/30',
        damage: '1d4/1d10',
        value: 50,
      },
      tradeGoods: { name: 'tarot deck', value: 1 },
      commonality: 1,
      apply: (character: DCCCharacter, _rng: RNG): DCCCharacter => {
        return character;
      },
    },
    {
      name: 'farrier',
      trainedWeapon: {
        name: 'hammer',
        classification: 'club',
        range: 'melee',
        damage: '1d4',
        value: 50,
      },
      tradeGoods: { name: 'steel tongs', value: 1 },
      commonality: 1,
      apply: (character: DCCCharacter, _rng: RNG): DCCCharacter => {
        return character;
      },
    },
    {
      name: 'furrier',
      trainedWeapon: {
        name: 'knife',
        classification: 'dagger',
        range: '10/20/30',
        damage: '1d4/1d10',
        value: 50,
      },
      tradeGoods: { name: 'deer pelt', value: 1 },
      commonality: 1,
      apply: (character: DCCCharacter, _rng: RNG): DCCCharacter => {
        return character;
      },
    },
    {
      name: 'gambler',
      trainedWeapon: {
        name: 'club',
        classification: 'club',
        range: 'melee',
        damage: '1d4',
        value: 50,
      },
      tradeGoods: { name: 'dice', value: 1 },
      commonality: 1,
      apply: (character: DCCCharacter, _rng: RNG): DCCCharacter => {
        return character;
      },
    },
    {
      name: 'goatherd',
      trainedWeapon: {
        name: 'crook',
        classification: 'staff',
        range: 'melee',
        damage: '1d4',
        value: 50,
      },
      tradeGoods: { name: 'goat', value: 1 },
      commonality: 1,
      apply: (character: DCCCharacter, _rng: RNG): DCCCharacter => {
        return character;
      },
    },
    {
      name: 'gongfarmer',
      trainedWeapon: {
        name: 'trowel',
        classification: 'dagger',
        range: '10/20/30',
        damage: '1d4/1d10',
        value: 50,
      },
      tradeGoods: { name: 'sack of night soil', value: 1 },
      commonality: 1,
      apply: (character: DCCCharacter, _rng: RNG): DCCCharacter => {
        return character;
      },
    },
    {
      name: 'gravedigger',
      trainedWeapon: {
        name: 'shovel',
        classification: 'staff',
        range: 'melee',
        damage: '1d4',
        value: 50,
      },
      tradeGoods: { name: 'trowel', value: 1 },
      commonality: 2,
      apply: (character: DCCCharacter, _rng: RNG): DCCCharacter => {
        return character;
      },
    },
    {
      name: 'guild beggar',
      trainedWeapon: {
        name: 'sling',
        classification: 'sling',
        range: '40/80/160',
        damage: '1d4',
        value: 50,
      },
      tradeGoods: { name: 'crutches', value: 1 },
      commonality: 2,
      apply: (character: DCCCharacter, _rng: RNG): DCCCharacter => {
        return character;
      },
    },
    {
      name: 'hatter',
      trainedWeapon: {
        name: 'scissors',
        classification: 'dagger',
        range: '10/20/30',
        damage: '1d4/1d10',
        value: 50,
      },
      tradeGoods: { name: 'hat', value: 1 },
      commonality: 1,
      apply: (character: DCCCharacter, _rng: RNG): DCCCharacter => {
        return character;
      },
    },
    {
      name: 'healer',
      trainedWeapon: {
        name: 'club',
        classification: 'club',
        range: 'melee',
        damage: '1d4',
        value: 50,
      },
      tradeGoods: { name: 'holy water', value: 1 },
      commonality: 1,
      apply: (character: DCCCharacter, _rng: RNG): DCCCharacter => {
        return character;
      },
    },
    {
      name: 'herbalist',
      trainedWeapon: {
        name: 'club',
        classification: 'club',
        range: 'melee',
        damage: '1d4',
        value: 50,
      },
      tradeGoods: { name: 'herbs, 1 lb.', value: 1 },
      commonality: 1,
      apply: (character: DCCCharacter, _rng: RNG): DCCCharacter => {
        return character;
      },
    },
    {
      name: 'herder',
      trainedWeapon: {
        name: 'staff',
        classification: 'staff',
        range: 'melee',
        damage: '1d4',
        value: 50,
      },
      tradeGoods: { name: 'herding dog', value: 1 },
      commonality: 1,
      apply: (character: DCCCharacter, _rng: RNG): DCCCharacter => {
        return character;
      },
    },
    {
      name: 'hunter',
      trainedWeapon: {
        name: 'shortbow',
        classification: 'shortbow',
        range: '50/100/150',
        damage: '1d6',
        value: 50,
      },
      tradeGoods: { name: 'deer pelt', value: 1 },
      commonality: 2,
      apply: (character: DCCCharacter, _rng: RNG): DCCCharacter => {
        return character;
      },
    },
    {
      name: 'indentured servant',
      trainedWeapon: {
        name: 'staff',
        classification: 'staff',
        range: 'melee',
        damage: '1d4',
        value: 50,
      },
      tradeGoods: { name: 'locket', value: 1 },
      commonality: 1,
      apply: (character: DCCCharacter, _rng: RNG): DCCCharacter => {
        return character;
      },
    },
    {
      name: 'innkeeper',
      trainedWeapon: {
        name: 'cudgel',
        classification: 'club',
        range: 'melee',
        damage: '1d4',
        value: 50,
      },
      tradeGoods: { name: 'coin purse', value: 1 },
      commonality: 1,
      apply: (character: DCCCharacter, _rng: RNG): DCCCharacter => {
        character.currency.cp += 100;
        return character;
      },
    },
    {
      name: 'jester',
      trainedWeapon: {
        name: 'dart',
        classification: 'dart',
        range: '20/40/60',
        damage: '1d4',
        value: 50,
      },
      tradeGoods: { name: 'silk clothes', value: 1 },
      commonality: 1,
      apply: (character: DCCCharacter, _rng: RNG): DCCCharacter => {
        return character;
      },
    },
    {
      name: 'jeweller',
      trainedWeapon: {
        name: 'dagger',
        classification: 'dagger',
        range: '10/20/30',
        damage: '1d4/1d10',
        value: 50,
      },
      tradeGoods: { name: 'gem worth 20 gp', value: 1 },
      commonality: 1,
      apply: (character: DCCCharacter, _rng: RNG): DCCCharacter => {
        return character;
      },
    },
    {
      name: 'locksmith',
      trainedWeapon: {
        name: 'dagger',
        classification: 'dagger',
        range: '10/20/30',
        damage: '1d4/1d10',
        value: 50,
      },
      tradeGoods: { name: 'fine tools', value: 1 },
      commonality: 1,
      apply: (character: DCCCharacter, _rng: RNG): DCCCharacter => {
        return character;
      },
    },
    {
      name: 'mendicant',
      trainedWeapon: {
        name: 'club',
        classification: 'club',
        range: 'melee',
        damage: '1d4',
        value: 50,
      },
      tradeGoods: { name: 'cheese dip', value: 1 },
      commonality: 1,
      apply: (character: DCCCharacter, _rng: RNG): DCCCharacter => {
        return character;
      },
    },
    {
      name: 'mercenary',
      trainedWeapon: {
        name: 'longsword',
        classification: 'longsword',
        range: 'melee',
        damage: '1d8',
        value: 50,
      },
      tradeGoods: { name: 'hide armor', value: 1 },
      commonality: 1,
      apply: (character: DCCCharacter, _rng: RNG): DCCCharacter => {
        character.armorClass += 3;
        return character;
      },
    },
    {
      name: 'merchant',
      trainedWeapon: {
        name: 'dagger',
        classification: 'dagger',
        range: '10/20/30',
        damage: '1d4/1d10',
        value: 50,
      },
      tradeGoods: { name: 'coin purse', value: 1 },
      commonality: 1,
      apply: (character: DCCCharacter, _rng: RNG): DCCCharacter => {
        character.currency.cp += 27;
        character.currency.sp += 14;
        character.currency.gp += 4;
        return character;
      },
    },
    {
      name: 'miller',
      trainedWeapon: {
        name: 'club',
        classification: 'club',
        range: 'melee',
        damage: '1d4',
        value: 50,
      },
      tradeGoods: { name: 'flour, 1 lb.', value: 1 },
      commonality: 1,
      apply: (character: DCCCharacter, _rng: RNG): DCCCharacter => {
        return character;
      },
    },
    {
      name: 'minstrel',
      trainedWeapon: {
        name: 'dagger',
        classification: 'dagger',
        range: '10/20/30',
        damage: '1d4/1d10',
        value: 50,
      },
      tradeGoods: { name: 'ukelele', value: 1 },
      commonality: 1,
      apply: (character: DCCCharacter, _rng: RNG): DCCCharacter => {
        return character;
      },
    },
    {
      name: 'noble',
      trainedWeapon: {
        name: 'longsword',
        classification: 'longsword',
        range: 'melee',
        damage: '1d8',
        value: 50,
      },
      tradeGoods: { name: 'gold ring worth 10 gp', value: 1 },
      commonality: 1,
      apply: (character: DCCCharacter, _rng: RNG): DCCCharacter => {
        return character;
      },
    },
    {
      name: 'orphan',
      trainedWeapon: {
        name: 'club',
        classification: 'club',
        range: 'melee',
        damage: '1d4',
        value: 50,
      },
      tradeGoods: { name: 'rag doll', value: 1 },
      commonality: 1,
      apply: (character: DCCCharacter, _rng: RNG): DCCCharacter => {
        return character;
      },
    },
    {
      name: 'ostler',
      trainedWeapon: {
        name: 'staff',
        classification: 'staff',
        range: 'melee',
        damage: '1d4',
        value: 50,
      },
      tradeGoods: { name: 'bridle', value: 1 },
      commonality: 1,
      apply: (character: DCCCharacter, _rng: RNG): DCCCharacter => {
        return character;
      },
    },
    {
      name: 'outlaw',
      trainedWeapon: {
        name: 'short sword',
        classification: 'short sword',
        range: 'melee',
        damage: '1d6',
        value: 50,
      },
      tradeGoods: { name: 'leather armor', value: 1 },
      commonality: 1,
      apply: (character: DCCCharacter, _rng: RNG): DCCCharacter => {
        character.armorClass += 2;
        return character;
      },
    },
    {
      name: 'potter',
      trainedWeapon: {
        name: 'awl',
        classification: 'dagger',
        range: '10/20/30',
        damage: '1d4/1d10',
        value: 50,
      },
      tradeGoods: { name: 'potting clay, 5 lb.', value: 1 },
      commonality: 1,
      apply: (character: DCCCharacter, _rng: RNG): DCCCharacter => {
        return character;
      },
    },
    {
      name: 'quarrier',
      trainedWeapon: {
        name: 'pickaxe',
        classification: 'short sword',
        range: 'melee',
        damage: '1d6',
        value: 50,
      },
      tradeGoods: { name: 'bag of stone chips', value: 1 },
      commonality: 1,
      apply: (character: DCCCharacter, _rng: RNG): DCCCharacter => {
        return character;
      },
    },
    {
      name: 'rope maker',
      trainedWeapon: {
        name: 'knife',
        classification: 'dagger',
        range: '10/20/30',
        damage: '1d4/1d10',
        value: 50,
      },
      tradeGoods: { name: "rope, 100'", value: 1 },
      commonality: 1,
      apply: (character: DCCCharacter, _rng: RNG): DCCCharacter => {
        return character;
      },
    },
    {
      name: 'rugmaker',
      trainedWeapon: {
        name: 'scissors',
        classification: 'dagger',
        range: '10/20/30',
        damage: '1d4/1d10',
        value: 50,
      },
      tradeGoods: { name: 'small rug', value: 1 },
      commonality: 1,
      apply: (character: DCCCharacter, _rng: RNG): DCCCharacter => {
        return character;
      },
    },
    {
      name: 'sailor',
      trainedWeapon: {
        name: 'knife',
        classification: 'dagger',
        range: '10/20/30',
        damage: '1d4/1d10',
        value: 50,
      },
      tradeGoods: { name: "rope, 50'", value: 1 },
      commonality: 1,
      apply: (character: DCCCharacter, _rng: RNG): DCCCharacter => {
        return character;
      },
    },
    {
      name: 'scribe',
      trainedWeapon: {
        name: 'dart',
        classification: 'dart',
        range: '20/40/60',
        damage: '1d4',
        value: 50,
      },
      tradeGoods: { name: 'parchment, 100 sheets', value: 1 },
      commonality: 1,
      apply: (character: DCCCharacter, _rng: RNG): DCCCharacter => {
        return character;
      },
    },
    {
      name: 'shaman',
      trainedWeapon: {
        name: 'mace',
        classification: 'mace',
        range: 'melee',
        damage: '1d6',
        value: 50,
      },
      tradeGoods: { name: 'herbs, 1 lb.', value: 1 },
      commonality: 1,
      apply: (character: DCCCharacter, _rng: RNG): DCCCharacter => {
        return character;
      },
    },
    {
      name: 'shepherd',
      trainedWeapon: {
        name: 'crook',
        classification: 'staff',
        range: 'melee',
        damage: '1d4',
        value: 50,
      },
      tradeGoods: { name: 'sheep', value: 1 },
      commonality: 1,
      apply: (character: DCCCharacter, _rng: RNG): DCCCharacter => {
        return character;
      },
    },
    {
      name: 'slave',
      trainedWeapon: {
        name: 'club',
        classification: 'club',
        range: 'melee',
        damage: '1d4',
        value: 50,
      },
      tradeGoods: { name: 'strange-looking rock', value: 1 },
      commonality: 1,
      apply: (character: DCCCharacter, _rng: RNG): DCCCharacter => {
        return character;
      },
    },
    {
      name: 'smuggler',
      trainedWeapon: {
        name: 'sling',
        classification: 'sling',
        range: '40/80/160',
        damage: '1d4',
        value: 50,
      },
      tradeGoods: { name: 'waterproof sack', value: 1 },
      commonality: 1,
      apply: (character: DCCCharacter, _rng: RNG): DCCCharacter => {
        return character;
      },
    },
    {
      name: 'soldier',
      trainedWeapon: {
        name: 'spear',
        classification: 'spear',
        range: 'melee',
        damage: '1d8',
        value: 50,
      },
      tradeGoods: { name: 'shield', value: 1 },
      commonality: 1,
      apply: (character: DCCCharacter, _rng: RNG): DCCCharacter => {
        character.armorClass += 1;
        return character;
      },
    },
    {
      name: 'squire',
      trainedWeapon: {
        name: 'longsword',
        classification: 'longsword',
        range: 'melee',
        damage: '1d8',
        value: 50,
      },
      tradeGoods: { name: 'steel helmet', value: 1 },
      commonality: 2,
      apply: (character: DCCCharacter, _rng: RNG): DCCCharacter => {
        return character;
      },
    },
    {
      name: 'stablemaster',
      trainedWeapon: {
        name: 'pitchfork',
        classification: 'spear',
        range: 'melee',
        damage: '1d8',
        value: 50,
      },
      tradeGoods: { name: 'horse', value: 1 },
      commonality: 1,
      apply: (character: DCCCharacter, _rng: RNG): DCCCharacter => {
        return character;
      },
    },
    {
      name: 'swineherd',
      trainedWeapon: {
        name: 'staff',
        classification: 'staff',
        range: 'melee',
        damage: '1d4',
        value: 50,
      },
      tradeGoods: { name: 'sow', value: 1 },
      commonality: 1,
      apply: (character: DCCCharacter, _rng: RNG): DCCCharacter => {
        return character;
      },
    },
    {
      name: 'tailor',
      trainedWeapon: {
        name: 'scissors',
        classification: 'dagger',
        range: '10/20/30',
        damage: '1d4/1d10',
        value: 50,
      },
      tradeGoods: { name: 'linen, 6 yds.', value: 1 },
      commonality: 1,
      apply: (character: DCCCharacter, _rng: RNG): DCCCharacter => {
        return character;
      },
    },
    {
      name: 'tanner',
      trainedWeapon: {
        name: 'knife',
        classification: 'dagger',
        range: '10/20/30',
        damage: '1d4/1d10',
        value: 50,
      },
      tradeGoods: { name: 'sheet of leather', value: 1 },
      commonality: 1,
      apply: (character: DCCCharacter, _rng: RNG): DCCCharacter => {
        return character;
      },
    },
    {
      name: 'tax collector',
      trainedWeapon: {
        name: 'longsword',
        classification: 'longsword',
        range: 'melee',
        damage: '1d8',
        value: 50,
      },
      tradeGoods: { name: 'coin purse', value: 1 },
      commonality: 1,
      apply: (character: DCCCharacter, _rng: RNG): DCCCharacter => {
        character.currency.cp += 100;
        return character;
      },
    },
    {
      name: 'thatcher',
      trainedWeapon: {
        name: 'hammer',
        classification: 'club',
        range: 'melee',
        damage: '1d4',
        value: 50,
      },
      tradeGoods: { name: 'thatching, 1 bundle', value: 1 },
      commonality: 1,
      apply: (character: DCCCharacter, _rng: RNG): DCCCharacter => {
        return character;
      },
    },
    {
      name: 'trapper',
      trainedWeapon: {
        name: 'sling',
        classification: 'sling',
        range: '40/60/180',
        damage: '1d4',
        value: 50,
      },
      tradeGoods: { name: 'badger pelt', value: 1 },
      commonality: 2,
      apply: (character: DCCCharacter, _rng: RNG): DCCCharacter => {
        return character;
      },
    },
    {
      name: 'urchin',
      trainedWeapon: {
        name: 'stick',
        classification: 'club',
        range: 'melee',
        damage: '1d4',
        value: 50,
      },
      tradeGoods: { name: 'begging bowl', value: 1 },
      commonality: 1,
      apply: (character: DCCCharacter, _rng: RNG): DCCCharacter => {
        return character;
      },
    },
    {
      name: 'wainwright',
      trainedWeapon: {
        name: 'club',
        classification: 'club',
        range: 'melee',
        damage: '1d4',
        value: 50,
      },
      tradeGoods: { name: 'pushcart', value: 1 },
      commonality: 1,
      apply: (character: DCCCharacter, _rng: RNG): DCCCharacter => {
        return character;
      },
    },
    {
      name: 'watchman',
      trainedWeapon: {
        name: 'club',
        classification: 'club',
        range: 'melee',
        damage: '1d4',
        value: 50,
      },
      tradeGoods: { name: 'pocket watch', value: 1 },
      commonality: 1,
      apply: (character: DCCCharacter, _rng: RNG): DCCCharacter => {
        return character;
      },
    },
    {
      name: 'weaver',
      trainedWeapon: {
        name: 'dagger',
        classification: 'dagger',
        range: '10/20/30',
        damage: '1d4/1d10',
        value: 50,
      },
      tradeGoods: { name: 'fine suit of clothes', value: 1 },
      commonality: 1,
      apply: (character: DCCCharacter, _rng: RNG): DCCCharacter => {
        return character;
      },
    },
    {
      name: 'winemaker',
      trainedWeapon: {
        name: 'sickle',
        classification: 'dagger',
        range: '10/20/30',
        damage: '1d4/1d10',
        value: 50,
      },
      tradeGoods: { name: 'grapes, 1 lb.', value: 1 },
      commonality: 1,
      apply: (character: DCCCharacter, _rng: RNG): DCCCharacter => {
        return character;
      },
    },
    {
      name: "wizard's apprentice",
      trainedWeapon: {
        name: 'dagger',
        classification: 'dagger',
        range: '10/20/30',
        damage: '1d4/1d10',
        value: 50,
      },
      tradeGoods: { name: 'black grimoire', value: 1 },
      commonality: 1,
      apply: (character: DCCCharacter, _rng: RNG): DCCCharacter => {
        return character;
      },
    },
    {
      name: 'woodcutter',
      trainedWeapon: {
        name: 'handaxe',
        classification: 'handaxe',
        range: '10/20/30',
        damage: '1d6',
        value: 50,
      },
      tradeGoods: { name: 'bundle of wood', value: 1 },
      commonality: 3,
      apply: (character: DCCCharacter, _rng: RNG): DCCCharacter => {
        return character;
      },
    },
  ];
}
