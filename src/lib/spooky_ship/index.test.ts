import { expect, describe, it } from 'vitest';
import { RNG } from '@ironarachne/rng';
import { generate } from './index';

const SIZES = ['gigantic', 'immense', 'large', 'huge', 'colossal', 'vast'];
const SHIPS = [
  'derelict',
  'freighter',
  'hulk',
  'mining vessel',
  'warship',
  'passenger liner',
  'merchant ship',
];

describe('generate', () => {
  it('is deterministic for a given seed', () => {
    expect(generate(new RNG('ghost'))).toBe(generate(new RNG('ghost')));
  });

  it('produces different descriptions for different seeds', () => {
    const descriptions = new Set(
      ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h'].map((seed) => generate(new RNG(seed))),
    );

    expect(descriptions.size).toBeGreaterThan(1);
  });

  it('capitalizes the first letter of the description', () => {
    const description = generate(new RNG('capital'));

    expect(description[0]).toBe(description[0].toUpperCase());
    expect(description[0]).toMatch(/[A-Z]/);
  });

  it('never leaves an undefined fragment in the description', () => {
    for (let index = 0; index < 40; index++) {
      expect(generate(new RNG(`seed-${index}`))).not.toContain('undefined');
    }
  });

  it('mentions a ship size and a ship type', () => {
    for (let index = 0; index < 20; index++) {
      const description = generate(new RNG(`ship-${index}`)).toLowerCase();

      expect(SIZES.some((size) => description.includes(size))).toBe(true);
      expect(SHIPS.some((ship) => description.includes(ship))).toBe(true);
    }
  });

  it('ends with a twist that closes the description', () => {
    const description = generate(new RNG('twist'));

    expect(description.trimEnd()).toMatch(/[.?]$/);
  });

  it('uses both intro phrasings across seeds', () => {
    const descriptions = Array.from({ length: 40 }, (_, index) =>
      generate(new RNG(`intro-${index}`)),
    );

    expect(descriptions.some((text) => text.includes('is adrift here'))).toBe(true);
    expect(descriptions.some((text) => /(drifts|floats) in space/.test(text))).toBe(true);
  });

  it('advances the RNG so successive calls on one instance differ', () => {
    const rng = new RNG('shared');

    expect(generate(rng)).not.toBe(generate(rng));
  });
});
