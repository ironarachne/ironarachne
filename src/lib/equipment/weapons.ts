import type { Weapon, WeaponType } from './equipment_types';

export const weaponTypes: WeaponType[] = [
  {
    name: 'battleaxe',
    damage: '1d8',
    damageType: 'slashing',
    weaponType: 'melee',
    hands: 1,
    description: 'A hefty axe meant for chopping through armor and shields.',
  },
  {
    name: 'club',
    damage: '1d4',
    damageType: 'bludgeoning',
    weaponType: 'melee',
    hands: 1,
    description: 'A simple wooden club, effective for close combat.',
  },
  {
    name: 'crossbow',
    damage: '1d10',
    damageType: 'piercing',
    weaponType: 'ranged',
    range: 100,
    hands: 2,
    description: 'A ranged weapon that fires bolts with great force.',
  },
  {
    name: 'dagger',
    damage: '1d4',
    damageType: 'piercing',
    weaponType: 'melee',
    hands: 1,
    description: 'A small, easily concealable blade.',
  },
  {
    name: 'greatsword',
    damage: '2d6',
    damageType: 'slashing',
    weaponType: 'melee',
    hands: 2,
    description: 'A massive sword that requires two hands to wield effectively.',
  },
  {
    name: 'halberd',
    damage: '1d10',
    damageType: 'slashing',
    weaponType: 'melee',
    hands: 2,
    description: 'A pole weapon with an axe blade topped with a spike.',
  },
  {
    name: 'longbow',
    damage: '1d8',
    damageType: 'piercing',
    weaponType: 'ranged',
    range: 150,
    hands: 2,
    description: 'A powerful ranged weapon favored by archers.',
  },
  {
    name: 'longsword',
    damage: '1d8',
    damageType: 'slashing',
    weaponType: 'melee',
    hands: 1,
    description: 'A versatile melee weapon.',
  },
  {
    name: 'mace',
    damage: '1d6',
    damageType: 'bludgeoning',
    weaponType: 'melee',
    hands: 1,
    description: 'A blunt weapon designed to deliver powerful strikes.',
  },
  {
    name: 'quarterstaff',
    damage: '1d6',
    damageType: 'bludgeoning',
    weaponType: 'melee',
    hands: 2,
    description: 'A simple wooden staff used for defense and offense.',
  },
  {
    name: 'shortbow',
    damage: '1d6',
    damageType: 'piercing',
    weaponType: 'ranged',
    range: 80,
    hands: 2,
    description: 'A ranged weapon for attacking from a distance.',
  },
  {
    name: 'shortsword',
    damage: '1d6',
    damageType: 'slashing',
    weaponType: 'melee',
    hands: 1,
    description: 'A light melee weapon, easy to handle.',
  },
  {
    name: 'spear',
    damage: '1d6',
    damageType: 'piercing',
    weaponType: 'melee',
    hands: 1,
    description: 'A pole weapon that can be thrown or used in melee combat.',
  },
  {
    name: 'warhammer',
    damage: '1d8',
    damageType: 'bludgeoning',
    weaponType: 'melee',
    hands: 1,
    description: 'A heavy melee weapon that deals bludgeoning damage.',
  }
];

export function generateWeapon(id: string, type: WeaponType, name?: string): Weapon {
  return {
    id,
    name: name || type.name,
    description: type.description,
    value: getValueOfWeaponType(type),
    rarity: 'common',
    itemMajorType: 'weapon',
    itemMinorType: type.weaponType,
    properties: [],
    damage: type.damage,
    damageType: type.damageType,
    weaponType: type.weaponType,
    range: type.range,
    hands: type.hands,
    densityCategory: 'dense',
    weight: type.hands === 2 ? 5 : 3,
  }
}

export function getValueOfWeaponType(type: WeaponType): number {
  // Simple valuation based on weapon type, hands, and damage
  const baseValue = 10;
  const damageParts = type.damage.split('d');
  const handsMultiplier = type.hands === 2 ? 1.5 : 1;
  const averageDamage = Math.floor((Number.parseInt(damageParts[0], 10) * (Number.parseInt(damageParts[1], 10) + 1)) / 2);
  return baseValue + averageDamage * 2 * handsMultiplier;
}
