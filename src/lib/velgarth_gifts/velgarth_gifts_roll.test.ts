import { describe, expect, it } from 'vitest';

import {
  rollVelgarthGifts,
  rollVelgarthGiftsSnapshot,
  velgarthGiftsGeneratorConfig,
  VELGARTH_MAX_GIFTS,
  VELGARTH_MIN_GIFTS,
} from './velgarth_gifts_roll.js';

describe('rollVelgarthGifts', () => {
  /** Requirement 2.2. */
  it('gives the same set for the same seed', () => {
    expect(rollVelgarthGifts('a-fixed-seed')).toEqual(rollVelgarthGifts('a-fixed-seed'));
  });

  it('gives a different set for a different seed', () => {
    const seeds = ['one', 'two', 'three', 'four', 'five'].map((seed) =>
      JSON.stringify(rollVelgarthGifts(seed)),
    );

    expect(new Set(seeds).size).toBeGreaterThan(1);
  });

  it('rolls between one and three Gifts', () => {
    for (let i = 0; i < 50; i += 1) {
      const gifts = rollVelgarthGifts(`bounds-${i}`);
      expect(gifts.length).toBeGreaterThanOrEqual(VELGARTH_MIN_GIFTS);
      expect(gifts.length).toBeLessThanOrEqual(VELGARTH_MAX_GIFTS);
    }
  });

  /** A set of three is three different talents rather than the same one thrice. */
  it('never rolls the same Gift twice in one set', () => {
    for (let i = 0; i < 50; i += 1) {
      const names = rollVelgarthGifts(`unique-${i}`).map((gift) => gift.name);
      expect(new Set(names).size).toBe(names.length);
    }
  });

  it('gives every Gift a name, a description and a strength', () => {
    for (const gift of rollVelgarthGifts('fields-seed')) {
      expect(gift.name).not.toBe('');
      expect(gift.description).not.toBe('');
      expect(Number.isFinite(gift.strength)).toBe(true);
    }
  });

  it('rolls a snapshot from the same seed', () => {
    expect(rollVelgarthGiftsSnapshot('reroll-seed')).toEqual({
      gifts: rollVelgarthGifts('reroll-seed'),
    });
  });
});

describe('velgarthGiftsGeneratorConfig', () => {
  it('draws from the whole table, within the setting’s bounds', () => {
    const config = velgarthGiftsGeneratorConfig();

    expect(config.possibilities.length).toBeGreaterThan(0);
    expect(config.min_gifts).toBe(VELGARTH_MIN_GIFTS);
    expect(config.max_gifts).toBe(VELGARTH_MAX_GIFTS);
  });
});
