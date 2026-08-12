import type ADNDArmor from './adndarmor.js';
import type ADNDWeapon from './adndweapon.js';
import { ADND_WEAPONS } from './adnd_weapon_data.js';

export function getAmmoTypes(weapon: ADNDWeapon): ADNDWeapon[] {
  let result: ADNDWeapon[] = [];

  if (weapon.name === 'blowgun') {
    result = [
      {
        name: 'blowgun barbed dart',
        cost: 1 * 10,
        weight: 1,
        size: 'small',
        damageType: 'piercing',
        speedFactor: -1,
        damageSM: '1d3',
        damageL: '1d2',
        category: 'blowgun dart',
        usesAmmo: false,
      },
      {
        name: 'blowgun needle',
        cost: 1 * 10,
        weight: 1,
        size: 'small',
        damageType: 'piercing',
        speedFactor: -1,
        damageSM: '1d3',
        damageL: '1d2',
        category: 'blowgun dart',
        usesAmmo: false,
      },
    ];
  } else if (weapon.category === 'bow') {
    result = [
      {
        name: 'flight arrow (12)',
        cost: 3 * 10,
        weight: 1,
        size: 'small',
        damageType: 'piercing',
        speedFactor: -1,
        damageSM: '1d6',
        damageL: '1d6',
        category: 'arrow',
        usesAmmo: false,
      },
      {
        name: 'sheaf arrow (6)',
        cost: 3 * 10,
        weight: 1,
        size: 'small',
        damageType: 'piercing',
        speedFactor: -1,
        damageSM: '1d8',
        damageL: '1d8',
        category: 'arrow',
        usesAmmo: false,
      },
    ];
  } else if (weapon.name === 'Crossbow, hand') {
    result = [
      {
        name: 'hand quarrel',
        cost: 1 * 100,
        weight: 1,
        size: 'small',
        damageType: 'piercing',
        speedFactor: -1,
        damageSM: '1d3',
        damageL: '1d2',
        category: 'crossbow quarrel',
        usesAmmo: false,
      },
    ];
  } else if (weapon.name === 'Crossbow, light') {
    result = [
      {
        name: 'light quarrel',
        cost: 1 * 10,
        weight: 1,
        size: 'small',
        damageType: 'piercing',
        speedFactor: -1,
        damageSM: '1d4',
        damageL: '1d4',
        category: 'crossbow quarrel',
        usesAmmo: false,
      },
    ];
  } else if (weapon.name === 'crossbow, heavy') {
    result = [
      {
        name: 'heavy quarrel',
        cost: 2 * 10,
        weight: 1,
        size: 'small',
        damageType: 'piercing',
        speedFactor: -1,
        damageSM: '1d4+1',
        damageL: '1d6+1',
        category: 'crossbow quarrel',
        usesAmmo: false,
      },
    ];
  } else if (weapon.category === 'sling') {
    result = [
      {
        name: 'sling bullet',
        cost: 1,
        weight: 0,
        size: 'small',
        damageType: 'bludgeoning',
        speedFactor: -1,
        damageSM: '1d4+1',
        damageL: '1d6+1',
        category: 'sling bullet',
        usesAmmo: false,
      },
      {
        name: 'sling stone',
        cost: 0,
        weight: 0,
        size: 'small',
        damageType: 'bludgeoning',
        speedFactor: -1,
        damageSM: '1d4',
        damageL: '1d4',
        category: 'sling bullet',
        usesAmmo: false,
      },
    ];
  }

  return result;
}

export function getArmor(): ADNDArmor[] {
  return [
    { name: 'banded mail', ac: -7, weight: 35, cost: 300 * 100 },
    { name: 'brigandine', ac: -4, weight: 35, cost: 120 * 100 },
    { name: 'bronze plate mail', ac: -7, weight: 45, cost: 400 * 100 },
    { name: 'chain mail', ac: -6, weight: 40, cost: 75 * 100 },
    { name: 'field plate', ac: -8, weight: 60, cost: 2000 * 100 },
    { name: 'full plate', ac: -9, weight: 70, cost: 4000 * 100 },
    { name: 'hide', ac: -4, weight: 30, cost: 15 * 100 },
    { name: 'leather', ac: -2, weight: 15, cost: 5 * 100 },
    { name: 'padded', ac: -2, weight: 10, cost: 4 * 100 },
    { name: 'plate mail', ac: -7, weight: 50, cost: 600 * 100 },
    { name: 'ring mail', ac: -3, weight: 30, cost: 100 * 100 },
    { name: 'scale mail', ac: -4, weight: 40, cost: 120 * 100 },
    { name: 'shield, body', ac: -1, weight: 15, cost: 10 * 100 },
    { name: 'shield, small buckler', ac: -1, weight: 10, cost: 7 * 100 },
    { name: 'shield, medium buckler', ac: -1, weight: 5, cost: 3 * 100 },
    { name: 'splint mail', ac: -6, weight: 40, cost: 80 * 100 },
    { name: 'studded leather', ac: -4, weight: 25, cost: 20 * 100 },
  ];
}

/**
 * The weapon table. The returned array is shared and must not be mutated; a caller that keeps a
 * weapon copies it. See `ADND_WEAPONS`.
 */
export function getWeapons(): ADNDWeapon[] {
  return ADND_WEAPONS;
}
