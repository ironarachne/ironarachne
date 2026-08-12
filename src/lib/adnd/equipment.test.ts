import { describe, expect, it } from 'vitest';
import * as Equipment from './equipment.js';

describe('getWeapons', () => {
  it('returns a non-empty weapon catalog', () => {
    const weapons = Equipment.getWeapons();
    expect(weapons.length).toBeGreaterThan(0);
    expect(weapons[0]?.name.length).toBeGreaterThan(0);
  });
});

describe('getArmor', () => {
  it('returns a non-empty armor catalog', () => {
    const armor = Equipment.getArmor();
    expect(armor.length).toBeGreaterThan(0);
    expect(armor[0]?.name.length).toBeGreaterThan(0);
  });
});

describe('getAmmoTypes', () => {
  it('returns blowgun dart variants', () => {
    const blowgun = {
      name: 'blowgun',
      cost: 5 * 100,
      weight: 2,
      size: 'medium',
      damageType: 'piercing',
      speedFactor: 5,
      damageSM: '1',
      damageL: '1',
      category: 'blowgun',
      usesAmmo: true,
    };
    const ammo = Equipment.getAmmoTypes(blowgun);
    expect(ammo.map((a) => a.name)).toEqual(['blowgun barbed dart', 'blowgun needle']);
  });

  it('returns bow arrows for bow category weapons', () => {
    const bow = {
      name: 'long bow',
      cost: 75 * 100,
      weight: 3,
      size: 'large',
      damageType: 'piercing',
      speedFactor: 8,
      damageSM: '1d6',
      damageL: '1d6',
      category: 'bow',
      usesAmmo: false,
    };
    const ammo = Equipment.getAmmoTypes(bow);
    expect(ammo.map((a) => a.name)).toEqual(['flight arrow (12)', 'sheaf arrow (6)']);
  });

  it('returns hand crossbow quarrels', () => {
    const crossbow = {
      name: 'Crossbow, hand',
      cost: 300 * 100,
      weight: 3,
      size: 'small',
      damageType: 'piercing',
      speedFactor: 5,
      damageSM: '1d3',
      damageL: '1d2',
      category: 'crossbow',
      usesAmmo: true,
    };
    expect(Equipment.getAmmoTypes(crossbow)).toHaveLength(1);
  });

  it('returns heavy crossbow quarrels', () => {
    const crossbow = {
      name: 'crossbow, heavy',
      cost: 50 * 100,
      weight: 10,
      size: 'medium',
      damageType: 'piercing',
      speedFactor: 7,
      damageSM: '1d4+1',
      damageL: '1d6+1',
      category: 'crossbow',
      usesAmmo: true,
    };
    expect(Equipment.getAmmoTypes(crossbow)[0]?.name).toBe('heavy quarrel');
  });

  it('returns sling bullets', () => {
    const sling = {
      name: 'sling',
      cost: 5,
      weight: 0,
      size: 'small',
      damageType: 'bludgeoning',
      speedFactor: 2,
      damageSM: '1d4',
      damageL: '1d4',
      category: 'sling',
      usesAmmo: false,
    };
    expect(Equipment.getAmmoTypes(sling)[0]?.name).toBe('sling bullet');
  });

  it('returns an empty list for weapons without ammo', () => {
    const club = {
      name: 'club',
      cost: 1,
      weight: 3,
      size: 'medium',
      damageType: 'bludgeoning',
      speedFactor: 2,
      damageSM: '1d6',
      damageL: '1d3',
      category: 'club',
      usesAmmo: false,
    };
    expect(Equipment.getAmmoTypes(club)).toEqual([]);
  });
});
