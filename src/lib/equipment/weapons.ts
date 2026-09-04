import * as RNG from '@ironarachne/rng';
import { withLegacyItemMechanics } from '$lib/rulesets';
import type { Weapon, WeaponType } from './equipment_types';
import { applyMaterial, getRandomMaterialForItem } from './foundry';

export const weaponTypes: WeaponType[] = [
  {
    name: 'battleaxe',
    baseValue: 100,
    rangeCategory: 'melee',
    hands: 1,
    baseActions: [
      {
        name: 'basic attack',
        description: 'a basic strike',
        type: 'attack',
        attackType: 'melee',
        damageType: 'slashing',
        baseDamage: 8,
      },
    ],
    description: 'A hefty axe meant for chopping through armor and shields.',
    allowedMaterialTypes: ['metal', 'stone'],
  },
  {
    name: 'club',
    baseValue: 10,
    rangeCategory: 'melee',
    hands: 1,
    baseActions: [
      {
        name: 'basic attack',
        description: 'a basic strike',
        type: 'attack',
        attackType: 'melee',
        damageType: 'slashing',
        baseDamage: 4,
      },
    ],
    description: 'A simple wooden club, effective for close combat.',
    allowedMaterialTypes: ['wood', 'stone', 'bone'],
  },
  {
    name: 'crossbow',
    baseValue: 2500,
    rangeCategory: 'ranged',
    hands: 2,
    baseActions: [
      {
        name: 'basic attack',
        description: 'a basic strike',
        type: 'attack',
        attackType: 'ranged',
        damageType: 'piercing',
        baseDamage: 10,
        range: 100,
      },
    ],
    description: 'A ranged weapon that fires bolts with great force.',
    allowedMaterialTypes: ['wood', 'metal'],
  },
  {
    name: 'dagger',
    baseValue: 200,
    rangeCategory: 'melee',
    hands: 1,
    baseActions: [
      {
        name: 'basic attack',
        description: 'a basic strike',
        type: 'attack',
        attackType: 'melee',
        damageType: 'slashing',
        baseDamage: 4,
      },
    ],
    description: 'A small, easily concealable blade.',
    allowedMaterialTypes: ['metal', 'stone', 'bone'],
  },
  {
    name: 'greatsword',
    baseValue: 5000,
    rangeCategory: 'melee',
    hands: 2,
    baseActions: [
      {
        name: 'basic attack',
        description: 'a basic strike',
        type: 'attack',
        attackType: 'melee',
        damageType: 'slashing',
        baseDamage: 12,
      },
    ],
    description: 'A massive sword that requires two hands to wield effectively.',
    allowedMaterialTypes: ['metal'],
  },
  {
    name: 'halberd',
    baseValue: 2000,
    rangeCategory: 'melee',
    hands: 2,
    baseActions: [
      {
        name: 'basic attack',
        description: 'a basic strike',
        type: 'attack',
        attackType: 'melee',
        damageType: 'slashing',
        baseDamage: 10,
      },
    ],
    description: 'A pole weapon with an axe blade topped with a spike.',
    allowedMaterialTypes: ['metal'],
  },
  {
    name: 'longbow',
    baseValue: 5000,
    rangeCategory: 'ranged',
    hands: 2,
    baseActions: [
      {
        name: 'basic attack',
        description: 'a basic strike',
        type: 'attack',
        attackType: 'ranged',
        damageType: 'piercing',
        baseDamage: 10,
        range: 150,
      },
    ],
    description: 'A powerful ranged weapon favored by archers.',
    allowedMaterialTypes: ['wood'],
  },
  {
    name: 'longsword',
    baseValue: 1500,
    rangeCategory: 'melee',
    hands: 1,
    baseActions: [
      {
        name: 'basic attack',
        description: 'a basic strike',
        type: 'attack',
        attackType: 'melee',
        damageType: 'slashing',
        baseDamage: 8,
      },
    ],
    description: 'A versatile melee weapon.',
    allowedMaterialTypes: ['metal', 'stone', 'bone'],
  },
  {
    name: 'mace',
    baseValue: 500,
    rangeCategory: 'melee',
    hands: 1,
    baseActions: [
      {
        name: 'basic attack',
        description: 'a basic strike',
        type: 'attack',
        attackType: 'melee',
        damageType: 'bludgeoning',
        baseDamage: 6,
      },
    ],
    description: 'A blunt weapon designed to deliver powerful strikes.',
    allowedMaterialTypes: ['metal', 'stone', 'hardwood', 'bone'],
  },
  {
    name: 'quarterstaff',
    baseValue: 20,
    rangeCategory: 'melee',
    hands: 2,
    baseActions: [
      {
        name: 'basic attack',
        description: 'a basic strike',
        type: 'attack',
        attackType: 'melee',
        damageType: 'bludgeoning',
        baseDamage: 6,
      },
    ],
    description: 'A simple wooden staff used for defense and offense.',
    allowedMaterialTypes: ['wood'],
  },
  {
    name: 'shortbow',
    baseValue: 2500,
    rangeCategory: 'ranged',
    hands: 2,
    baseActions: [
      {
        name: 'basic attack',
        description: 'a basic strike',
        type: 'attack',
        attackType: 'ranged',
        damageType: 'piercing',
        baseDamage: 6,
        range: 80,
      },
    ],
    description: 'A ranged weapon for attacking from a distance.',
    allowedMaterialTypes: ['wood'],
  },
  {
    name: 'shortsword',
    baseValue: 1000,
    rangeCategory: 'melee',
    hands: 1,
    baseActions: [
      {
        name: 'basic attack',
        description: 'a basic strike',
        type: 'attack',
        attackType: 'melee',
        damageType: 'slashing',
        baseDamage: 6,
      },
    ],
    description: 'A light melee weapon, easy to handle.',
    allowedMaterialTypes: ['metal', 'stone', 'bone'],
  },
  {
    name: 'spear',
    baseValue: 100,
    rangeCategory: 'melee',
    hands: 1,
    baseActions: [
      {
        name: 'basic attack',
        description: 'a basic strike',
        type: 'attack',
        attackType: 'melee',
        damageType: 'piercing',
        baseDamage: 6,
      },
    ],
    description: 'A pole weapon that can be thrown or used in melee combat.',
    allowedMaterialTypes: ['wood', 'metal', 'stone', 'bone'],
  },
  {
    name: 'warhammer',
    baseValue: 1500,
    rangeCategory: 'melee',
    hands: 1,
    baseActions: [
      {
        name: 'basic attack',
        description: 'a basic strike',
        type: 'attack',
        attackType: 'melee',
        damageType: 'bludgeoning',
        baseDamage: 8,
      },
    ],
    description: 'A heavy melee weapon that deals bludgeoning damage.',
    allowedMaterialTypes: ['metal', 'stone'],
  },
];

export function createWeapon(id: string, type: WeaponType, name?: string): Weapon {
  const combatProfile = {
    attack: 0,
    defense: 0,
    power: type.baseActions[0]?.baseDamage || 0,
    resilience: 0,
    speed: 0,
    health: 0,
  };

  return {
    id,
    name: name || type.name,
    description: type.description,
    value: type.baseValue,
    rarity: 'common',
    itemMajorType: 'weapon',
    itemMinorType: type.rangeCategory,
    properties: [],
    combatProfile,
    actions: type.baseActions,
    weaponType: type,
    densityCategory: 'dense',
    weight: type.hands === 2 ? 5 : 3,
  };
}

export function generateWeapon(seed: string): Weapon {
  const rng = new RNG.RNG(seed);
  const type = rng.item(weaponTypes);
  const baseWeapon = createWeapon(seed, type);

  const material = getRandomMaterialForItem(baseWeapon, rng);
  const foundryWeapon = applyMaterial(baseWeapon, material) as Weapon;

  return withLegacyItemMechanics(foundryWeapon, 'generated');
}
