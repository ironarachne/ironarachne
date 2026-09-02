import { describe, expect, it } from 'vitest';

import { rollChopShop } from './chop_shop_roll';
import { chopShopFromSnapshot, toChopShopSnapshot } from './chop_shop_snapshot';

const shop = rollChopShop('kind-fixture');

describe('the chop shop snapshot', () => {
  /** Requirement 7.2. */
  it('round-trips a rolled shop, and one that has been emptied', () => {
    expect(chopShopFromSnapshot(toChopShopSnapshot(shop))).toEqual(shop);
    expect(chopShopFromSnapshot(toChopShopSnapshot({ text: '' }))).toEqual({ text: '' });
  });

  it('is free of the functions IndexedDB refuses', () => {
    expect(() => structuredClone(toChopShopSnapshot(shop))).not.toThrow();
  });
});
