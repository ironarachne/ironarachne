import { RNG } from '@ironarachne/rng';
import { describe, expect, it } from 'vitest';
import { createAdndCharacter } from '../adndcharacter.js';
import human from '../races/human.js';
import thief from './thief.js';

describe('thief class apply', () => {
  it('assigns thief skill rows rather than ability prose', () => {
    const c = createAdndCharacter();
    c.race = human;
    c.dexterity = 16;
    const rng = new RNG('thief-apply');

    thief.apply(c, rng);

    expect(c.thiefSkills.map((row) => row.name)).toEqual([
      'Pick Pockets',
      'Open Locks',
      'Find/Remove Traps',
      'Move Silently',
      'Hide in Shadows',
      'Detect Noise',
      'Climb Walls',
      'Read Languages',
    ]);
    // The prose these used to be pushed onto `abilities` as is gone, not duplicated.
    expect(c.abilities.some((a) => /%$/.test(a))).toBe(false);
  });

  it('deals out exactly the 60-point pool, none above the per-skill cap', () => {
    const c = createAdndCharacter();
    c.race = human;
    c.dexterity = 16;

    thief.apply(c, new RNG('thief-pool'));

    const dealt = c.thiefSkills.reduce((sum, row) => sum + row.points, 0);
    expect(dealt).toBe(60);
    expect(c.thiefSkills.every((row) => row.points <= 30)).toBe(true);
  });

  it('leaves skills alone when the builder is allocating them', () => {
    const c = createAdndCharacter();
    c.race = human;
    c.dexterity = 16;

    thief.apply(c, new RNG('thief-user'), { thiefSkills: 'user' });

    expect(c.thiefSkills).toEqual([]);
  });
});
