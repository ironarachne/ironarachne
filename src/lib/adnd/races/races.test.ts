import { RNG } from '@ironarachne/rng';
import { describe, expect, it } from 'vitest';
import ADNDCharacter from '../adndcharacter.js';
import dwarf from './dwarf.js';
import human from './human.js';
import * as races from './races.js';

describe('races.getAll', () => {
  it('returns every playable race', () => {
    expect(races.getAll().map((r) => r.name)).toEqual([
      'dwarf',
      'elf',
      'gnome',
      'half-elf',
      'halfling',
      'human',
    ]);
  });
});

describe('ADNDRace apply', () => {
  const rng = new RNG('race-apply-spot');

  it('applies dwarf racial adjustments and abilities', () => {
    const c = new ADNDCharacter();
    c.constitution = 10;
    c.charisma = 10;

    dwarf.apply(c, rng);

    expect(c.constitution).toBe(11);
    expect(c.charisma).toBe(9);
    expect(c.abilities.some((a) => a.includes('Infravision'))).toBe(true);
  });

  it('leaves human stats unchanged', () => {
    const c = new ADNDCharacter();
    c.constitution = 12;
    c.charisma = 12;

    human.apply(c, rng);

    expect(c.constitution).toBe(12);
    expect(c.charisma).toBe(12);
    expect(c.abilities).toEqual([]);
  });

  it('applies every race hook without error', () => {
    const rng = new RNG('all-race-apply');
    for (const race of races.getAll()) {
      const c = new ADNDCharacter();
      c.race = race;
      c.constitution = 12;
      c.charisma = 12;
      c.dexterity = 12;
      race.apply(c, rng);
      expect(c.abilities.length).toBeGreaterThanOrEqual(0);
    }
  });
});
