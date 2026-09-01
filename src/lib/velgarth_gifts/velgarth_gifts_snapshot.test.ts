import { describe, expect, it } from 'vitest';

import { rollVelgarthGifts } from './velgarth_gifts_roll.js';
import { toVelgarthGiftsSnapshot, velgarthGiftsFromSnapshot } from './velgarth_gifts_snapshot.js';

const gifts = rollVelgarthGifts('snapshot-fixture');

describe('the Velgarth gifts snapshot', () => {
  /** Requirement 7.2: lossless for everything the page shows. */
  it('round-trips a rolled set', () => {
    expect(velgarthGiftsFromSnapshot(toVelgarthGiftsSnapshot(gifts))).toEqual(gifts);
  });

  it('round-trips an empty set, which is an ordinary state', () => {
    expect(velgarthGiftsFromSnapshot(toVelgarthGiftsSnapshot([]))).toEqual([]);
  });

  /**
   * The description is stored rather than derived, unlike an Uncharted Worlds skill: it is
   * assembled at generation time from the Gift's sentence and the strength's, so there is no row to
   * look it up in.
   */
  it('keeps the description the roll assembled', () => {
    const restored = velgarthGiftsFromSnapshot(toVelgarthGiftsSnapshot(gifts));

    expect(restored[0].description).toBe(gifts[0].description);
    expect(restored[0].description).not.toBe('');
  });

  it('keeps a strength a user has changed rather than recomputing it', () => {
    const edited = toVelgarthGiftsSnapshot(gifts);
    edited.gifts[0].strength = 5;

    expect(velgarthGiftsFromSnapshot(edited)[0].strength).toBe(5);
  });

  it('is free of the functions IndexedDB refuses', () => {
    expect(() => structuredClone(toVelgarthGiftsSnapshot(gifts))).not.toThrow();
  });

  it('does not hand out the list it was given', () => {
    const snapshot = toVelgarthGiftsSnapshot(gifts);
    snapshot.gifts[0].name = 'Something else entirely';

    expect(gifts[0].name).not.toBe('Something else entirely');
  });
});
