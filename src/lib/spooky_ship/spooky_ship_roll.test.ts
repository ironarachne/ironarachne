import { describe, expect, it } from 'vitest';

import { rollSpookyShip, rollSpookyShipSnapshot } from './spooky_ship_roll';

describe('rollSpookyShip', () => {
  it('gives the same derelict for the same seed', () => {
    // Requirement 2.2. The page reseeded its own RNG from the seed field inside an `$effect` and
    // again inside `generate()`, so the next press depended on the text of the previous one.
    expect(rollSpookyShip('fixed')).toEqual(rollSpookyShip('fixed'));
  });

  it('gives a different derelict for a different seed', () => {
    const texts = new Set(['a', 'b', 'c', 'd', 'e', 'f'].map((seed) => rollSpookyShip(seed).text));

    expect(texts.size).toBeGreaterThan(1);
  });

  it('always writes something', () => {
    for (let index = 0; index < 20; index++) {
      const ship = rollSpookyShip(`seed-${index}`);

      expect(ship.text.trim(), `seed-${index}`).not.toBe('');
      expect(ship.text, `seed-${index}`).not.toContain('undefined');
    }
  });

  it('re-rolls the same derelict a stored provenance describes', () => {
    // Requirement 4.3: the destructive command puts the rolled paragraph back. There is no config
    // record — this page has one control and it is the seed.
    expect(rollSpookyShipSnapshot('stored')).toEqual(rollSpookyShipSnapshot('stored'));
  });
});
