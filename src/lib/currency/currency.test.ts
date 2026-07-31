import { describe, it, expect } from 'vitest';
import {
  amountsToValue,
  convert,
  getAppropriateCoinTypes,
  getCoinTypesAboveValue,
  getCoinTypesBelowValue,
  getIndexOfCoinType,
  getMaxCoinTypeForValue,
  valueToAmounts,
  valueToGpSpCpString,
  valueToString,
} from './currency';
import { STANDARD_FANTASY, HISTORICAL_BRITISH, IMPERIAL_CREDITS } from './systems';

describe('Currency Library', () => {
  describe('convert', () => {
    it('should convert between denominations correctly', () => {
      // 1 gold = 100 copper
      expect(convert(1, 'gold', 'copper', STANDARD_FANTASY)).toBe(100);
      // 1 gold = 10 silver
      expect(convert(1, 'gold', 'silver', STANDARD_FANTASY)).toBe(10);
      // 10 silver = 1 gold
      expect(convert(10, 'silver', 'gold', STANDARD_FANTASY)).toBe(1);
    });

    it('should handle British currency', () => {
      // 1 pound = 240 pence
      expect(convert(1, 'pound', 'penny', HISTORICAL_BRITISH)).toBe(240);
      // 1 shilling = 12 pence
      expect(convert(1, 'shilling', 'penny', HISTORICAL_BRITISH)).toBe(12);
      // 1 pound = 20 shillings
      expect(convert(1, 'pound', 'shilling', HISTORICAL_BRITISH)).toBe(20);
    });
  });

  describe('valueToString', () => {
    it('should format value correctly', () => {
      // 123 copper = 1 gp, 2 sp, 3 cp
      // 100 + 20 + 3
      expect(valueToString(123, STANDARD_FANTASY)).toBe('1 gp 2 sp 3 cp');
    });

    it('valueToGpSpCpString uses gp, sp, cp only (no electrum)', () => {
      // 260 cp would be 2 gp 1 ep 10 cp in full STANDARD_FANTASY breakdown
      expect(valueToGpSpCpString(260, STANDARD_FANTASY)).toBe('2 gp 6 sp');
    });

    it('should format British currency correctly', () => {
      // 245 pence = 1 pound (240), 5 pence
      expect(valueToString(245, HISTORICAL_BRITISH)).toBe('1 £ 5 d');
    });
  });

  describe('valueToAmounts', () => {
    it('should break down value into amounts', () => {
      const amounts = valueToAmounts(123, STANDARD_FANTASY);
      expect(amounts).toHaveLength(3);
      expect(amounts[0]).toEqual({ amount: 1, denomination: 'gold' });
      expect(amounts[1]).toEqual({ amount: 2, denomination: 'silver' });
      expect(amounts[2]).toEqual({ amount: 3, denomination: 'copper' });
    });
  });

  describe('valueToString when not exact', () => {
    it('returns only the largest denomination', () => {
      expect(valueToString(123, STANDARD_FANTASY, false)).toBe('1 gp');
    });

    it('returns an empty string when there is nothing to show', () => {
      expect(valueToString(0, STANDARD_FANTASY, false)).toBe('');
    });

    it('falls back to the denomination name when it has no symbol', () => {
      expect(valueToString(240, HISTORICAL_BRITISH, false)).toBe('1 £');
      expect(valueToString(0.25, HISTORICAL_BRITISH, false)).toBe('1 farthing');
    });

    it('groups thousands in the number', () => {
      const formatted = new Intl.NumberFormat().format(1234);

      expect(valueToString(1234000, STANDARD_FANTASY, false)).toBe(`${formatted} pp`);
    });
  });

  describe('amountsToValue', () => {
    it('totals a list of amounts', () => {
      const value = amountsToValue(
        [
          { amount: 1, denomination: 'gold' },
          { amount: 2, denomination: 'silver' },
          { amount: 3, denomination: 'copper' },
        ],
        STANDARD_FANTASY,
      );

      expect(value).toBe(123);
    });

    it('is zero for an empty list', () => {
      expect(amountsToValue([], STANDARD_FANTASY)).toBe(0);
    });

    it('ignores a denomination the system does not have', () => {
      const value = amountsToValue(
        [
          { amount: 1, denomination: 'gold' },
          { amount: 99, denomination: 'dubloon' },
        ],
        STANDARD_FANTASY,
      );

      expect(value).toBe(100);
    });

    it('round-trips with valueToAmounts', () => {
      for (const value of [1, 7, 123, 5555, 1000000]) {
        expect(amountsToValue(valueToAmounts(value, STANDARD_FANTASY), STANDARD_FANTASY)).toBe(
          value,
        );
      }
    });
  });

  describe('getCoinTypesAboveValue', () => {
    it('returns only denominations worth strictly more', () => {
      const above = getCoinTypesAboveValue(10, STANDARD_FANTASY).map((d) => d.name);

      expect(above).toEqual(['electrum', 'gold', 'platinum']);
    });

    it('returns nothing above the most valuable denomination', () => {
      expect(getCoinTypesAboveValue(1000, STANDARD_FANTASY)).toEqual([]);
    });
  });

  describe('getCoinTypesBelowValue', () => {
    it('returns only denominations worth strictly less', () => {
      const below = getCoinTypesBelowValue(50, STANDARD_FANTASY).map((d) => d.name);

      expect(below).toEqual(['copper', 'silver']);
    });

    it('returns nothing below the least valuable denomination', () => {
      expect(getCoinTypesBelowValue(1, STANDARD_FANTASY)).toEqual([]);
    });
  });

  describe('getIndexOfCoinType', () => {
    it('finds a denomination by name', () => {
      expect(getIndexOfCoinType('copper', STANDARD_FANTASY)).toBe(0);
      expect(getIndexOfCoinType('platinum', STANDARD_FANTASY)).toBe(4);
    });

    it('returns -1 for a denomination the system does not have', () => {
      expect(getIndexOfCoinType('dubloon', STANDARD_FANTASY)).toBe(-1);
    });
  });

  describe('getMaxCoinTypeForValue', () => {
    it('returns the largest denomination the value covers', () => {
      expect(getMaxCoinTypeForValue(100, STANDARD_FANTASY).name).toBe('gold');
      expect(getMaxCoinTypeForValue(99, STANDARD_FANTASY).name).toBe('electrum');
      expect(getMaxCoinTypeForValue(1, STANDARD_FANTASY).name).toBe('copper');
    });

    it('falls back to the smallest denomination for a value below all of them', () => {
      expect(getMaxCoinTypeForValue(0, STANDARD_FANTASY).name).toBe('copper');
    });

    it('works for a single-denomination system', () => {
      expect(getMaxCoinTypeForValue(500, IMPERIAL_CREDITS).name).toBe('credit');
    });
  });

  describe('getAppropriateCoinTypes', () => {
    it('excludes denominations worth more than the value', () => {
      const names = getAppropriateCoinTypes(50, STANDARD_FANTASY).map((d) => d.name);

      expect(names).not.toContain('gold');
      expect(names).not.toContain('platinum');
    });

    it('returns nothing when every denomination is too valuable', () => {
      expect(getAppropriateCoinTypes(0, STANDARD_FANTASY)).toEqual([]);
    });

    it('drops denominations so small they would pile up', () => {
      const names = getAppropriateCoinTypes(100000, STANDARD_FANTASY).map((d) => d.name);

      expect(names).not.toContain('copper');
    });

    it('falls back to every affordable coin when the size filter removes them all', () => {
      const names = getAppropriateCoinTypes(10000000, STANDARD_FANTASY).map((d) => d.name);

      expect(names.length).toBeGreaterThan(0);
      expect(new Set(names)).toEqual(new Set(STANDARD_FANTASY.denominations.map((d) => d.name)));
    });

    it('orders the result by descending rarity', () => {
      const result = getAppropriateCoinTypes(1000, STANDARD_FANTASY);

      for (let i = 1; i < result.length; i++) {
        expect(result[i - 1].rarity || 0).toBeGreaterThanOrEqual(result[i].rarity || 0);
      }
    });

    it('leaves the system’s own denomination order untouched', () => {
      const before = STANDARD_FANTASY.denominations.map((d) => d.name);

      getAppropriateCoinTypes(1000, STANDARD_FANTASY);

      expect(STANDARD_FANTASY.denominations.map((d) => d.name)).toEqual(before);
    });
  });
});
