import { describe, it, expect } from 'vitest';
import { convert, valueToString, valueToAmounts } from './currency';
import { STANDARD_FANTASY, HISTORICAL_BRITISH } from './systems';

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
});
