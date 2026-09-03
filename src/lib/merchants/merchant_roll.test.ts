import { describe, expect, it } from 'vitest';

import {
  MAXIMUM_STOCK_COUNT,
  MINIMUM_STOCK_COUNT,
  clampStockCount,
  defaultMerchantGeneratorConfigRecord,
  nameSourceForSet,
  readMerchantGeneratorConfig,
  rollMerchant,
  rollMerchantSnapshot,
  toMerchantGeneratorConfig,
} from './merchant_roll';
import { toMerchantSnapshot } from './merchant_snapshot';

const CONFIG = defaultMerchantGeneratorConfigRecord();

describe('rollMerchant', () => {
  it('gives the same merchant for the same seed and settings', () => {
    // Requirement 2.2. `generateMerchant` was already pure; the page around it was not.
    expect(toMerchantSnapshot(rollMerchant('fixed', CONFIG))).toEqual(
      toMerchantSnapshot(rollMerchant('fixed', CONFIG)),
    );
  });

  it('gives a different merchant for a different seed', () => {
    expect(toMerchantSnapshot(rollMerchant('one', CONFIG))).not.toEqual(
      toMerchantSnapshot(rollMerchant('two', CONFIG)),
    );
  });

  it('records the seed it was rolled from', () => {
    expect(rollMerchant('the-seed', CONFIG).seed).toBe('the-seed');
  });

  it('honours the settings that fix a choice', () => {
    const merchant = rollMerchant('fixed-choices', {
      ...CONFIG,
      shopType: 'jeweler',
      venueType: 'wagon',
      honesty: 'swindler',
      priceLevel: 'extortionate',
    });

    expect(merchant.shop.shopType).toBe('jeweler');
    expect(merchant.shop.venueType).toBe('wagon');
    expect(merchant.honesty).toBe('swindler');
    expect(merchant.priceLevel).toBe('extortionate');
  });

  it('rolls the stock count asked for', () => {
    expect(rollMerchant('counted', { ...CONFIG, stockCount: 7 }).stock).toHaveLength(7);
  });

  it('puts the shop in a settlement when one was supplied', () => {
    // Requirement 5.1: `settlement` is a registered kind, and where the shop stands is otherwise
    // invented.
    const merchant = rollMerchant('placed', { ...CONFIG, settlementName: 'Ashford' });

    expect(merchant.shop.settlementName).toBe('Ashford');
  });

  it('leaves the settlement out when none was supplied', () => {
    // 5.3: composition is opt-in, and a merchant handed nothing generates its own inputs.
    expect('settlementName' in rollMerchant('unplaced', CONFIG).shop).toBe(false);
  });

  it('names from a pattern set when the record holds one', () => {
    // What makes a re-roll possible without the culture artifact: the set's *name* is what the
    // provenance records, and naming of the same tongue is what the user chose.
    const named = rollMerchant('named', { ...CONFIG, nameGeneratorSet: 'dwarf' });
    const plain = rollMerchant('named', CONFIG);

    expect(named.proprietor.fullName).not.toBe(plain.proprietor.fullName);
    expect(rollMerchant('named', { ...CONFIG, nameGeneratorSet: 'dwarf' })).toEqual(named);
  });
});

describe('nameSourceForSet', () => {
  it('names from a set this build has', () => {
    expect(nameSourceForSet('dwarf')).toEqual({ kind: 'preset', setName: 'dwarf' });
  });

  it('falls back rather than throwing on a set this build does not have', () => {
    // `getFantasyNameGeneratorSet` throws for an unknown name, and the name recorded here is
    // usually a *culture's* — a generated name, nothing like the twelve fantasy presets. Without
    // this, re-rolling a merchant named from a saved culture crashed.
    expect(nameSourceForSet('Tuvaari')).toEqual({ kind: 'default' });
    expect(nameSourceForSet(undefined)).toEqual({ kind: 'default' });
  });

  it('lets such a merchant re-roll rather than refusing', () => {
    expect(() =>
      rollMerchant('culture-named', { ...CONFIG, nameGeneratorSet: 'Tuvaari' }),
    ).not.toThrow();
  });
});

describe('clampStockCount', () => {
  it('leaves a usable count alone', () => {
    expect(clampStockCount(12)).toBe(12);
  });

  it('clamps a cleared, negative or oversized count into the page bounds', () => {
    expect(clampStockCount(Number.NaN)).toBe(MINIMUM_STOCK_COUNT);
    expect(clampStockCount(0)).toBe(MINIMUM_STOCK_COUNT);
    expect(clampStockCount(9000)).toBe(MAXIMUM_STOCK_COUNT);
    expect(clampStockCount(7.4)).toBe(7);
  });
});

describe('readMerchantGeneratorConfig', () => {
  it('reads back what the page wrote', () => {
    const written = {
      shopType: 'tavern',
      venueType: 'tent',
      honesty: 'shifty',
      priceLevel: 'bargain',
      stockCount: 9,
      includeMerchantMark: false,
      nameGeneratorSet: 'dwarf',
      settlementName: 'Ashford',
    };

    expect(readMerchantGeneratorConfig(written)).toEqual(written);
  });

  it('falls back to the defaults for anything it does not recognise', () => {
    // A config written by a build that spelled these differently should re-roll the ordinary way
    // rather than from a field it misread.
    expect(readMerchantGeneratorConfig({})).toEqual(CONFIG);
    expect(readMerchantGeneratorConfig({ shopType: 'fishmonger' }).shopType).toBe('any');
    expect(readMerchantGeneratorConfig({ includeMerchantMark: 'yes' }).includeMerchantMark).toBe(
      true,
    );
  });

  it('keeps "any", which is a setting rather than a missing one', () => {
    expect(readMerchantGeneratorConfig({ honesty: 'any' }).honesty).toBe('any');
  });

  it('clamps a stock count rather than dropping it', () => {
    expect(readMerchantGeneratorConfig({ stockCount: 900 }).stockCount).toBe(MAXIMUM_STOCK_COUNT);
  });

  it('drops an empty optional rather than storing it blank', () => {
    expect(readMerchantGeneratorConfig({ settlementName: '' }).settlementName).toBeUndefined();
    expect(readMerchantGeneratorConfig({ nameGeneratorSet: '' }).nameGeneratorSet).toBeUndefined();
  });
});

describe('toMerchantGeneratorConfig', () => {
  it('carries the settings onto the library config', () => {
    const full = toMerchantGeneratorConfig({ ...CONFIG, stockCount: 6, shopType: 'scribe' });

    expect(full.shopType).toBe('scribe');
    expect(full.stockCount).toEqual({ min: 6, max: 6 });
  });

  it('names from the recorded pattern set when no live culture is handed in', () => {
    expect(toMerchantGeneratorConfig({ ...CONFIG, nameGeneratorSet: 'dwarf' }).nameSource).toEqual({
      kind: 'preset',
      setName: 'dwarf',
    });
  });

  it('prefers a live culture, which is what the page has', () => {
    const source = { kind: 'preset' as const, setName: 'elvish' };

    expect(
      toMerchantGeneratorConfig({ ...CONFIG, nameGeneratorSet: 'dwarf' }, source).nameSource,
    ).toEqual(source);
  });

  it('names from the default patterns when the record has nothing', () => {
    expect(toMerchantGeneratorConfig(CONFIG).nameSource).toEqual({ kind: 'default' });
  });
});

describe('rollMerchantSnapshot', () => {
  it('is the roller a re-roll takes, and matches the page', () => {
    expect(rollMerchantSnapshot('seed', CONFIG)).toEqual(
      toMerchantSnapshot(rollMerchant('seed', CONFIG)),
    );
  });
});
