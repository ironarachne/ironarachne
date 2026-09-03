import { describe, expect, it } from 'vitest';

import {
  addStockItem,
  proprietorTraitsLine,
  removeStockItem,
  repricedStock,
  setMerchantText,
  setPriceModifier,
  setProprietorText,
  setProprietorTraits,
  setShopText,
  setStockNumber,
  setStockText,
} from './merchant_editing';
import { defaultMerchantGeneratorConfigRecord, rollMerchantSnapshot } from './merchant_roll';

const MERCHANT = rollMerchantSnapshot('editing-seed', {
  ...defaultMerchantGeneratorConfigRecord(),
  settlementName: 'Ashford',
});

describe('setShopText and setProprietorText', () => {
  it('change one field and nothing else', () => {
    const renamed = setShopText(MERCHANT, 'name', 'The Copper Kettle');

    expect(renamed.shop.name).toBe('The Copper Kettle');
    expect(renamed.proprietor).toEqual(MERCHANT.proprietor);
    expect(MERCHANT.shop.name).not.toBe('The Copper Kettle');
  });

  it('removes an emptied settlement rather than storing it blank', () => {
    expect('settlementName' in setShopText(MERCHANT, 'settlementName', '  ').shop).toBe(false);
    expect(setShopText(MERCHANT, 'settlementName', 'Grimwold').shop.settlementName).toBe(
      'Grimwold',
    );
  });

  it('leaves the full name alone when a half changes, and the halves alone when it does', () => {
    // The payload keeps all three because the generator wrote all three, and a shopkeeper called
    // "Old Maren" has a full name no split of a first and a last would produce.
    const edited = setProprietorText(MERCHANT, 'firstName', 'Maren');

    expect(edited.proprietor.firstName).toBe('Maren');
    expect(edited.proprietor.fullName).toBe(MERCHANT.proprietor.fullName);

    const renamed = setProprietorText(MERCHANT, 'fullName', 'Old Maren');
    expect(renamed.proprietor.firstName).toBe(MERCHANT.proprietor.firstName);
  });
});

describe('setMerchantText', () => {
  it('rewrites the trading prose', () => {
    expect(setMerchantText(MERCHANT, 'hagglingAdvice', 'Will not budge.').hagglingAdvice).toBe(
      'Will not budge.',
    );
  });
});

describe('setProprietorTraits', () => {
  it('reads a comma-separated line, dropping the blanks', () => {
    expect(
      setProprietorTraits(MERCHANT, 'gruff, watchful ,, generous,').proprietor.personalityTraits,
    ).toEqual(['gruff', 'watchful', 'generous']);
  });

  it('round-trips through the line the editor shows', () => {
    const edited = setProprietorTraits(MERCHANT, 'gruff, watchful');

    expect(proprietorTraitsLine(edited)).toBe('gruff, watchful');
  });
});

describe('setPriceModifier', () => {
  it('takes the number given, and floors a cleared or negative one', () => {
    expect(setPriceModifier(MERCHANT, 1.4).priceModifier).toBe(1.4);
    expect(setPriceModifier(MERCHANT, Number.NaN).priceModifier).toBe(0);
    expect(setPriceModifier(MERCHANT, -1).priceModifier).toBe(0);
  });

  it('does not reprice the stock', () => {
    // Requirement 4.2, and the sharpest temptation in this library: a form that re-derived the ask
    // column whenever the modifier moved would undo a hand-marked price on the next keystroke.
    expect(setPriceModifier(MERCHANT, 4).stock).toEqual(MERCHANT.stock);
  });
});

describe('the stock rows', () => {
  it('rewrites one row without touching its neighbours', () => {
    const edited = setStockText(MERCHANT, 1, 'name', 'a very fine hat');

    expect(edited.stock[1].name).toBe('a very fine hat');
    expect(edited.stock[0]).toEqual(MERCHANT.stock[0]);
    expect(edited.stock).toHaveLength(MERCHANT.stock.length);
  });

  it('removes an emptied note rather than storing it blank', () => {
    const noted = setStockText(MERCHANT, 0, 'note', 'the last one');

    expect(noted.stock[0].note).toBe('the last one');
    expect('note' in setStockText(noted, 0, 'note', '   ').stock[0]).toBe(false);
  });

  it('floors a cleared or negative number at zero', () => {
    expect(setStockNumber(MERCHANT, 0, 'price', Number.NaN).stock[0].price).toBe(0);
    expect(setStockNumber(MERCHANT, 0, 'quantity', -2).stock[0].quantity).toBe(0);
    expect(setStockNumber(MERCHANT, 0, 'baseCost', 55).stock[0].baseCost).toBe(55);
  });

  it('does nothing for a row that is not there', () => {
    expect(setStockText(MERCHANT, 99, 'name', 'nowhere')).toBe(MERCHANT);
    expect(setStockNumber(MERCHANT, -1, 'price', 5)).toBe(MERCHANT);
    expect(removeStockItem(MERCHANT, 99)).toBe(MERCHANT);
  });

  it('adds a row a referee can fill in', () => {
    const added = addStockItem(MERCHANT);

    expect(added.stock).toHaveLength(MERCHANT.stock.length + 1);
    expect(added.stock[added.stock.length - 1]).toEqual({
      name: 'New item',
      baseCost: 0,
      price: 0,
      quantity: 1,
    });
  });

  it('crosses one off', () => {
    const removed = removeStockItem(MERCHANT, 0);

    expect(removed.stock).toHaveLength(MERCHANT.stock.length - 1);
    expect(removed.stock[0]).toEqual(MERCHANT.stock[1]);
  });

  it('empties completely, which is a shop that has sold out', () => {
    let emptied = MERCHANT;
    while (emptied.stock.length > 0) {
      emptied = removeStockItem(emptied, 0);
    }

    expect(emptied.stock).toEqual([]);
  });
});

describe('repricedStock', () => {
  it('sets every ask price from the catalog cost and the modifier', () => {
    const marked = setStockNumber(setPriceModifier(MERCHANT, 2), 0, 'price', 1);
    const repriced = repricedStock(marked);

    for (const [index, item] of repriced.stock.entries()) {
      expect(item.price, item.name).toBe(Math.max(1, Math.round(item.baseCost * 2)));
      expect(item.name).toBe(marked.stock[index].name);
    }
  });

  it('never prices anything at nothing', () => {
    // A free item in a shop reads as a bug rather than as generosity.
    const free = repricedStock(setPriceModifier(MERCHANT, 0));

    for (const item of free.stock) {
      expect(item.price).toBeGreaterThanOrEqual(1);
    }
  });

  it('is the only thing that touches the ask column', () => {
    expect(repricedStock(MERCHANT).stock).not.toBe(MERCHANT.stock);
    expect(setStockText(MERCHANT, 0, 'name', 'renamed').stock[0].price).toBe(
      MERCHANT.stock[0].price,
    );
  });
});
