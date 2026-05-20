import { describe, expect, it } from 'vitest';
import ADNDWeapon from './adndweapon.js';

describe('ADNDWeapon', () => {
  it('stores weapon stats and optional ammo flag', () => {
    const weapon = new ADNDWeapon(
      'long sword',
      15 * 100,
      4,
      'medium',
      'slashing',
      5,
      '1d8',
      '1d12',
      'sword',
      false,
    );
    expect(weapon.name).toBe('long sword');
    expect(weapon.damageType).toBe('slashing');
    expect(weapon.usesAmmo).toBe(false);
  });

  it('defaults usesAmmo to false', () => {
    const club = new ADNDWeapon('club', 1, 3, 'medium', 'bludgeoning', 2, '1d6', '1d3', 'club');
    expect(club.usesAmmo).toBe(false);
  });
});
