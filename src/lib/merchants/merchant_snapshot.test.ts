import { describe, expect, it } from 'vitest';

import {
  defaultMerchantGeneratorConfigRecord,
  rollMerchant,
  rollMerchantSnapshot,
} from './merchant_roll';
import {
  merchantFromSnapshot,
  merchantSeedMatchesProvenance,
  toMerchantSnapshot,
} from './merchant_snapshot';

const CONFIG = defaultMerchantGeneratorConfigRecord();
const MERCHANT = toMerchantSnapshot(rollMerchant('snapshot-seed', CONFIG));

describe('toMerchantSnapshot', () => {
  it('keeps the person, the shop and the stock', () => {
    expect(MERCHANT.proprietor.fullName).not.toBe('');
    expect(MERCHANT.shop.name).not.toBe('');
    expect(MERCHANT.stock.length).toBeGreaterThan(0);
    expect(MERCHANT.stock[0].name).toBeTypeOf('string');
  });

  it('keeps the mark as a charge name and a fill, not a drawing', () => {
    // Decision 5 of docs/readiness-factions.md, and it was already done before the pass got here.
    expect(MERCHANT.mark).not.toBeNull();
    expect(Object.keys(MERCHANT.mark ?? {}).sort()).toEqual(['chargeName', 'fillHex']);
  });

  it('keeps no mark when the generator was told not to make one', () => {
    expect(
      toMerchantSnapshot(rollMerchant('no-mark', { ...CONFIG, includeMerchantMark: false })).mark,
    ).toBeNull();
  });
});

describe('merchantFromSnapshot', () => {
  it('round-trips everything that matters', () => {
    // Requirement 7.2.
    expect(merchantFromSnapshot(MERCHANT)).toEqual(MERCHANT);
    expect(merchantFromSnapshot(merchantFromSnapshot(MERCHANT))).toEqual(MERCHANT);
  });

  it('survives a trip through JSON, which is what storage is', () => {
    expect(merchantFromSnapshot(JSON.parse(JSON.stringify(MERCHANT)))).toEqual(MERCHANT);
  });

  it('copies deeply enough that an editor cannot reach the stored record', () => {
    const read = merchantFromSnapshot(MERCHANT);

    read.stock.push({ name: 'tampered', baseCost: 0, price: 0, quantity: 1 });
    read.stock[0].name = 'tampered';
    read.proprietor.personalityTraits.push('tampered');

    expect(MERCHANT.stock.map((item) => item.name)).not.toContain('tampered');
    expect(MERCHANT.proprietor.personalityTraits).not.toContain('tampered');
  });

  it('recomputes nothing on read', () => {
    // Requirement 4.2: a price a referee marked down by hand is the shop's price, not an input to
    // a multiplication that runs again every time the artifact is opened.
    const edited = {
      ...MERCHANT,
      stock: MERCHANT.stock.map((item, index) => (index === 0 ? { ...item, price: 1 } : item)),
    };

    expect(merchantFromSnapshot(edited).stock[0].price).toBe(1);
  });
});

describe('merchantSeedMatchesProvenance', () => {
  it('holds for a merchant the roll module produced', () => {
    // The trap the design names: `Merchant` carries its own `seed`, and a payload whose seed
    // disagrees with its provenance is a shape where two answers to "what rolled this" exist.
    const snapshot = rollMerchantSnapshot('provenance-seed', CONFIG);

    expect(snapshot.seed).toBe('provenance-seed');
    expect(merchantSeedMatchesProvenance(snapshot, 'provenance-seed')).toBe(true);
    expect(merchantSeedMatchesProvenance(snapshot, 'something-else')).toBe(false);
  });
});
