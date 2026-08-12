import { RNG } from '@ironarachne/rng';
import { describe, expect, it } from 'vitest';
import { createAdndCharacter } from '../adndcharacter.js';
import human from '../races/human.js';
import thief from './thief.js';

describe('thief class apply', () => {
  it('assigns thief skill percentages to abilities', () => {
    const c = createAdndCharacter();
    c.race = human;
    c.dexterity = 16;
    const rng = new RNG('thief-apply');

    thief.apply(c, rng);

    expect(c.abilities.some((a) => a.startsWith('Pick Pockets:'))).toBe(true);
    expect(c.abilities.some((a) => a.startsWith('Climb Walls:'))).toBe(true);
  });
});
