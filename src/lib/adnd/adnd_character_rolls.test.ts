import { RNG } from '@ironarachne/rng';
import { describe, expect, it } from 'vitest';
import { createAdndCharacter } from './adndcharacter.js';
import { rollAdndLevel1Hp, rollAdndStartingCopper } from './adndcharactergenerator.js';
import cleric from './classes/cleric.js';
import fighter from './classes/fighter.js';

describe('rollAdndLevel1Hp', () => {
  it('returns at least 1 and no more than hit die max plus warrior Con bonus', () => {
    const c = createAdndCharacter();
    c.class = fighter;
    c.constitution = 14;
    c.strength = 12;
    c.dexterity = 12;
    c.intelligence = 12;
    c.wisdom = 12;
    c.charisma = 12;
    c.exceptionalStrength = -1;
    const rng = new RNG('hp-test');
    const hp = rollAdndLevel1Hp(c, rng);
    expect(hp).toBeGreaterThanOrEqual(1);
    expect(hp).toBeLessThanOrEqual(10);
  });
});

describe('rollAdndStartingCopper', () => {
  it('warrior funds match 5d4×10×100 cp range', () => {
    const rng = new RNG('gold-test');
    const cp = rollAdndStartingCopper(fighter, rng);
    expect(cp).toBeGreaterThanOrEqual(5 * 10 * 100);
    expect(cp).toBeLessThanOrEqual(20 * 10 * 100);
  });

  it('cleric funds match 3d6×10×100 cp range', () => {
    const rng = new RNG('gold-cleric');
    const cp = rollAdndStartingCopper(cleric, rng);
    expect(cp).toBeGreaterThanOrEqual(3 * 10 * 100);
    expect(cp).toBeLessThanOrEqual(18 * 10 * 100);
  });
});
