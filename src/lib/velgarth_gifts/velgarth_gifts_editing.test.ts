import { describe, expect, it } from 'vitest';

import {
  addVelgarthGift,
  removeVelgarthGift,
  setVelgarthGiftStrength,
  setVelgarthGiftText,
  VELGARTH_STRENGTHS,
} from './velgarth_gifts_editing.js';
import { rollVelgarthGiftsSnapshot } from './velgarth_gifts_roll.js';

/** A set with more than one Gift in it, so "one at a time" is worth asserting. */
function multiGiftSet() {
  for (let seed = 0; seed < 100; seed += 1) {
    const snapshot = rollVelgarthGiftsSnapshot(`editing-${seed}`);
    if (snapshot.gifts.length > 1) {
      return snapshot;
    }
  }
  throw new Error('no seed in the sweep produced a set with more than one Gift');
}

const gifts = multiGiftSet();

describe('editing a set of Velgarth Gifts', () => {
  /** Requirement 4.4: one field at a time, and nothing else moves. */
  it('changes one Gift and leaves the others alone', () => {
    const edited = setVelgarthGiftText(gifts, 0, 'name', 'Mindspeech');

    expect(edited.gifts[0].name).toBe('Mindspeech');
    expect(edited.gifts.slice(1)).toEqual(gifts.gifts.slice(1));
  });

  it('never writes into the snapshot it was given', () => {
    const before = structuredClone(gifts);
    setVelgarthGiftText(gifts, 0, 'description', 'something else');
    setVelgarthGiftStrength(gifts, 0, 5);

    expect(gifts).toEqual(before);
  });

  /** 4.2: the strength and the prose are separate decisions, and neither drags the other. */
  it('does not rewrite the description when the strength changes', () => {
    const edited = setVelgarthGiftStrength(gifts, 0, 5);

    expect(edited.gifts[0].strength).toBe(5);
    expect(edited.gifts[0].description).toBe(gifts.gifts[0].description);
  });

  it('edits the description, which is the user’s and not a table’s', () => {
    const edited = setVelgarthGiftText(gifts, 0, 'description', 'She hears the horses.');

    expect(edited.gifts[0].description).toBe('She hears the horses.');
    expect(edited.gifts[0].name).toBe(gifts.gifts[0].name);
    expect(edited.gifts[0].strength).toBe(gifts.gifts[0].strength);
  });

  it('refuses a strength a user has emptied rather than storing NaN', () => {
    expect(setVelgarthGiftStrength(gifts, 0, Number.NaN)).toBe(gifts);
  });

  it('adds a Gift at a strength the user can see and change', () => {
    const added = addVelgarthGift(gifts);
    const last = added.gifts[added.gifts.length - 1];

    expect(added.gifts).toHaveLength(gifts.gifts.length + 1);
    expect(last).toEqual({ name: '', description: '', strength: 3 });
    expect(VELGARTH_STRENGTHS).toContain(last.strength);
  });

  it('removes a Gift and leaves the rest in order', () => {
    const removed = removeVelgarthGift(gifts, 0);

    expect(removed.gifts).toEqual(gifts.gifts.slice(1));
  });

  it('can empty a set, which is an ordinary state', () => {
    let current = gifts;
    while (current.gifts.length > 0) {
      current = removeVelgarthGift(current, 0);
    }

    expect(current.gifts).toEqual([]);
  });

  /** An index nothing is at is a no-op, not a throw: the editor is driven by a live list. */
  it('ignores an index that is not there', () => {
    expect(setVelgarthGiftText(gifts, 99, 'name', 'Mindspeech')).toBe(gifts);
    expect(setVelgarthGiftText(gifts, -1, 'name', 'Mindspeech')).toBe(gifts);
    expect(setVelgarthGiftStrength(gifts, 99, 2)).toBe(gifts);
    expect(removeVelgarthGift(gifts, 99)).toBe(gifts);
  });
});
