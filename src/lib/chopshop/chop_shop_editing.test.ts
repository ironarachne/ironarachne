import { describe, expect, it } from 'vitest';

import { setChopShopText } from './chop_shop_editing';
import { rollChopShop } from './chop_shop_roll';

const shop = rollChopShop('editing-fixture');

describe('editing a chop shop', () => {
  it('replaces the text without touching the original', () => {
    const edited = setChopShopText(shop, 'A quiet place.');
    expect(edited.text).toBe('A quiet place.');
    expect(shop.text).not.toBe('A quiet place.');
  });
});
