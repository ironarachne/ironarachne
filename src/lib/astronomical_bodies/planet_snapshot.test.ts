import { describe, expect, it } from 'vitest';
import { RNG } from '@ironarachne/rng';

import { rollPlanet } from './planet_roll';
import {
  planetBodyFromSnapshot,
  planetFromSnapshot,
  planetFromSnapshotWithRng,
  toPlanetSnapshot,
} from './planet_snapshot';

/**
 * Requirement 7.2: `fromSnapshot(toSnapshot(x))` preserves everything that matters.
 *
 * For a planet that is everything, because every part of one is plain data — fifteen numbers, three
 * strings, two flags, a list of moons of the same shape, and a civilization of plain records.
 */
function inhabitedRoll() {
  for (let index = 0; index < 60; index++) {
    const roll = rollPlanet(`inhabited-${index}`);
    if (roll.civilization !== undefined && roll.moons.length > 0) {
      return roll;
    }
  }
  throw new Error('no seed in range produced an inhabited planet with moons');
}

describe('a planet snapshot', () => {
  const roll = inhabitedRoll();
  const snapshot = toPlanetSnapshot(roll);
  const restored = planetFromSnapshot(snapshot);

  it('comes back exactly as it went in', () => {
    expect(restored).toEqual(roll);
  });

  it('puts the planet at the top level, where an AstronomicalBody lives', () => {
    expect(planetBodyFromSnapshot(snapshot)).toEqual(roll.planet);
    expect(snapshot.name).toEqual(roll.planet.name);
  });

  it('keeps every moon', () => {
    expect(restored.moons).toEqual(roll.moons);
  });

  it('keeps whoever lives there, down to the government name options', () => {
    expect(restored.civilization).toEqual(roll.civilization);
    expect(restored.civilization?.government_type.name_options).toEqual(
      roll.civilization?.government_type.name_options,
    );
  });

  it('shares nothing with the value it was made from', () => {
    // A shallow copy would let an edit to a stored moon show up in the live planet, and vice versa.
    snapshot.moons[0].name = 'renamed in the snapshot';
    expect(roll.moons[0].name).not.toEqual('renamed in the snapshot');
  });

  it('carries no functions into storage', () => {
    expect(() => structuredClone(toPlanetSnapshot(roll))).not.toThrow();
  });

  it('reads back through the codec signature without drawing from the RNG', () => {
    // The RNG is handed over by the registry and deliberately unused: a planet is finished when it
    // is stored, and drawing from a seed on the way back would regenerate over an edit.
    const fresh = toPlanetSnapshot(roll);
    expect(planetFromSnapshotWithRng(fresh, new RNG('unused'))).toEqual(planetFromSnapshot(fresh));
  });
});

describe('an uninhabited planet with no moons', () => {
  it('stores no civilization key at all rather than a null one', () => {
    const roll = { planet: rollPlanet('bare').planet, moons: [] };
    const snapshot = toPlanetSnapshot(roll);
    expect('civilization' in snapshot).toBe(false);
    expect(planetFromSnapshot(snapshot)).toEqual(roll);
  });
});
