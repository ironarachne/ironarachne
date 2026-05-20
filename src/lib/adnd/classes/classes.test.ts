import { RNG } from '@ironarachne/rng';
import { describe, expect, it } from 'vitest';
import ADNDCharacter from '../adndcharacter.js';
import human from '../races/human.js';
import * as classes from './classes.js';

describe('classes.getAll', () => {
  it('returns every core class definition', () => {
    expect(classes.getAll().map((c) => c.name)).toContain('fighter');
    expect(classes.getAll().length).toBeGreaterThanOrEqual(16);
  });
});

describe('ADND class apply', () => {
  it('runs each class apply hook for a qualifying human', () => {
    const rng = new RNG('all-class-apply');
    for (const cls of classes.getAll()) {
      const c = new ADNDCharacter();
      c.race = human;
      c.strength = 18;
      c.dexterity = 18;
      c.constitution = 18;
      c.intelligence = 18;
      c.wisdom = 18;
      c.charisma = 18;
      c.exceptionalStrength = -1;

      cls.apply(c, rng, { spells: 'user', thiefSkills: 'user' });

      if (cls.name === 'thief') {
        expect(c.abilities.length).toBeGreaterThanOrEqual(0);
      }
    }
  });
});
