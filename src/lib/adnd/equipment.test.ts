import { describe, expect, it } from 'vitest';
import ADNDWeapon from './adndweapon.js';
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
    const blowgun = new ADNDWeapon(
      'blowgun',
      5 * 100,
      2,
      'medium',
      'piercing',
      5,
      '1',
      '1',
      'blowgun',
      true,
    );
    const ammo = Equipment.getAmmoTypes(blowgun);
    expect(ammo.map((a) => a.name)).toEqual(['blowgun barbed dart', 'blowgun needle']);
  });

  it('returns bow arrows for bow category weapons', () => {
    const bow = new ADNDWeapon(
      'long bow',
      75 * 100,
      3,
      'large',
      'piercing',
      8,
      '1d6',
      '1d6',
      'bow',
    );
    const ammo = Equipment.getAmmoTypes(bow);
    expect(ammo.map((a) => a.name)).toEqual(['flight arrow (12)', 'sheaf arrow (6)']);
  });

  it('returns hand crossbow quarrels', () => {
    const crossbow = new ADNDWeapon(
      'Crossbow, hand',
      300 * 100,
      3,
      'small',
      'piercing',
      5,
      '1d3',
      '1d2',
      'crossbow',
      true,
    );
    expect(Equipment.getAmmoTypes(crossbow)).toHaveLength(1);
  });

  it('returns heavy crossbow quarrels', () => {
    const crossbow = new ADNDWeapon(
      'crossbow, heavy',
      50 * 100,
      10,
      'medium',
      'piercing',
      7,
      '1d4+1',
      '1d6+1',
      'crossbow',
      true,
    );
    expect(Equipment.getAmmoTypes(crossbow)[0]?.name).toBe('heavy quarrel');
  });

  it('returns sling bullets', () => {
    const sling = new ADNDWeapon('sling', 5, 0, 'small', 'bludgeoning', 2, '1d4', '1d4', 'sling');
    expect(Equipment.getAmmoTypes(sling)[0]?.name).toBe('sling bullet');
  });

  it('returns an empty list for weapons without ammo', () => {
    const club = new ADNDWeapon('club', 1, 3, 'medium', 'bludgeoning', 2, '1d6', '1d3', 'club');
    expect(Equipment.getAmmoTypes(club)).toEqual([]);
  });
});
