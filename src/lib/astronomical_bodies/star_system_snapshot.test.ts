import { describe, expect, it } from 'vitest';
import { RNG } from '@ironarachne/rng';

import { rollStarSystem } from './star_system_roll';
import {
  starSystemFromSnapshot,
  starSystemFromSnapshotWithRng,
  toStarSystemSnapshot,
} from './star_system_snapshot';

/**
 * Requirement 7.2: `fromSnapshot(toSnapshot(x))` preserves everything that matters.
 *
 * For a system that is everything, because every part of one is plain data. The two fields that are
 * not stored are `star_count` and `planet_count`, and they come back because the generator always
 * sets each to its list's length — the claim this design rests on, asserted here rather than
 * assumed.
 */
const system = rollStarSystem('round-trip-seed', { planetCount: 5 });

describe('a star system snapshot', () => {
  const snapshot = toStarSystemSnapshot(system);
  const restored = starSystemFromSnapshot(snapshot);

  it('comes back exactly as it went in', () => {
    expect(restored).toEqual(system);
  });

  it('does not store a count beside the list it counts', () => {
    expect('star_count' in snapshot).toBe(false);
    expect('planet_count' in snapshot).toBe(false);
  });

  it('derives the counts from the lists on read', () => {
    expect(restored.planet_count).toEqual(restored.planets.length);
    expect(restored.star_count).toEqual(restored.stars.length);
  });

  it('cannot disagree with itself after an edit, which is why the counts are derived', () => {
    // A stored count would still say five here, and a payload that says it has five planets and
    // holds four is a bug that survives every validator checking each field on its own.
    const trimmed = { ...snapshot, planets: snapshot.planets.slice(0, -1) };
    expect(starSystemFromSnapshot(trimmed).planet_count).toEqual(snapshot.planets.length - 1);
  });

  it('shares nothing with the value it was made from', () => {
    const fresh = toStarSystemSnapshot(system);
    fresh.planets[0].name = 'renamed in the snapshot';
    expect(system.planets[0].name).not.toEqual('renamed in the snapshot');
  });

  it('carries no functions into storage', () => {
    expect(() => structuredClone(toStarSystemSnapshot(system))).not.toThrow();
  });

  it('reads back through the codec signature without drawing from the RNG', () => {
    // The RNG is handed over by the registry and deliberately unused: a system is finished when it
    // is stored, and drawing from a seed on the way back would regenerate over an edit.
    expect(starSystemFromSnapshotWithRng(snapshot, new RNG('unused'))).toEqual(restored);
  });
});

describe('a system a user has emptied', () => {
  it('reads back with counts of zero rather than the ones it was rolled with', () => {
    const snapshot = { ...toStarSystemSnapshot(system), stars: [], planets: [] };
    const restored = starSystemFromSnapshot(snapshot);
    expect(restored.star_count).toEqual(0);
    expect(restored.planet_count).toEqual(0);
  });
});
