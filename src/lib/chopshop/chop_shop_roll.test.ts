import { describe, expect, it } from 'vitest';

import { rollChopShop, rollChopShopSnapshot } from './chop_shop_roll';

describe('rollChopShop', () => {
  /** Requirement 2.2. */
  it('gives the same shop for the same seed, and a different one for another', () => {
    expect(rollChopShop('a-fixed-seed')).toEqual(rollChopShop('a-fixed-seed'));
    const seeds = ['one', 'two', 'three', 'four', 'five'].map((seed) => rollChopShop(seed).text);
    expect(new Set(seeds).size).toBeGreaterThan(1);
    expect(rollChopShopSnapshot('reroll')).toEqual(rollChopShop('reroll'));
  });
});
