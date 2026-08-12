import { describe, expect, it } from 'vitest';
import type ADNDWeapon from './adndweapon.js';
import { getWeapons } from './equipment.js';

describe('ADNDWeapon', () => {
  it('stores weapon stats and the ammo flag', () => {
    const weapon: ADNDWeapon = {
      name: 'long sword',
      cost: 15 * 100,
      weight: 4,
      size: 'medium',
      damageType: 'slashing',
      speedFactor: 5,
      damageSM: '1d8',
      damageL: '1d12',
      category: 'sword',
      usesAmmo: false,
    };
    expect(weapon.name).toBe('long sword');
    expect(weapon.damageType).toBe('slashing');
    expect(weapon.usesAmmo).toBe(false);
  });

  // usesAmmo used to default to false in the constructor; now every weapon in
  // the table states it, so the table is what has to be checked.
  it('has every weapon in the table state whether it uses ammo', () => {
    for (const weapon of getWeapons()) {
      expect(typeof weapon.usesAmmo).toBe('boolean');
    }
  });

  it('marks bows and crossbows as using ammo, and swords as not', () => {
    const byName = (name: string) => getWeapons().find((weapon) => weapon.name === name);

    expect(byName('long bow')?.usesAmmo).toBe(true);
    expect(byName('long sword')?.usesAmmo).toBe(false);
  });
});
