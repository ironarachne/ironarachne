import { RNG } from '@ironarachne/rng';
import { describe, expect, it } from 'vitest';
import ADNDCharacter from './adndcharacter.js';
import {
  assignExceptionalStrength,
  getClassOptionsForRace,
  isWarriorClass,
} from './adnd_character_eligibility.js';
import fighter from './classes/fighter.js';
import mage from './classes/mage.js';
import * as classes from './classes/classes.js';
import dwarf from './races/dwarf.js';

describe('isWarriorClass', () => {
  it('is true for fighter', () => {
    expect(isWarriorClass(fighter)).toBe(true);
  });

  it('is false for mage', () => {
    expect(isWarriorClass(mage)).toBe(false);
  });
});

describe('getClassOptionsForRace', () => {
  it('excludes classes not allowed for dwarf even when stats qualify', () => {
    const c = new ADNDCharacter();
    c.strength = 18;
    c.dexterity = 18;
    c.constitution = 18;
    c.intelligence = 18;
    c.wisdom = 18;
    c.charisma = 18;
    const opts = getClassOptionsForRace(c, dwarf, classes.getAll());
      expect(opts.some((cl) => cl.name === 'mage')).toBe(false);
      expect(opts.some((cl) => cl.name === 'fighter')).toBe(true);
  });
});

describe('assignExceptionalStrength', () => {
  it('clears percentile for non-warrior at STR 18', () => {
    const c = new ADNDCharacter();
    c.strength = 18;
    c.exceptionalStrength = 50;
    const rng = new RNG('pct-test-a');
    assignExceptionalStrength(c, mage, rng);
    expect(c.exceptionalStrength).toBe(-1);
  });

  it('rolls percentile for warrior at STR 18', () => {
    const c = new ADNDCharacter();
    c.strength = 18;
    c.exceptionalStrength = -1;
    const rng = new RNG('pct-test-b');
    assignExceptionalStrength(c, fighter, rng);
    expect(c.exceptionalStrength).toBeGreaterThanOrEqual(1);
    expect(c.exceptionalStrength).toBeLessThanOrEqual(100);
  });
});
