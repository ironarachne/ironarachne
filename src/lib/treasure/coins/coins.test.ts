import { describe, it, expect } from 'vitest';
import {
  getDefaultCoinSystem,
  getCoinTypesAboveValue,
  getCoinTypesBelowValue,
  getIndexOfCoinType,
  getMaxCoinTypeForValue,
  getAppropriateCoinTypes
} from './coins';

describe('coins', () => {
  const coinSystem = getDefaultCoinSystem();

  describe('getDefaultCoinSystem', () => {
    it('should return the default coin system', () => {
      const system = getDefaultCoinSystem();
      expect(system.denominations).toHaveLength(5);
      expect(system.denominations[0].name).toBe('copper');
      expect(system.denominations[4].name).toBe('platinum');
    });
  });

  describe('getCoinTypesAboveValue', () => {
    it('should return coin types with value greater than the specified value', () => {
      const types = getCoinTypesAboveValue(10, coinSystem);
      // Should include electrum (50), gold (100), platinum (1000)
      expect(types).toHaveLength(3);
      expect(types.map(t => t.name)).toContain('electrum');
      expect(types.map(t => t.name)).toContain('gold');
      expect(types.map(t => t.name)).toContain('platinum');
      expect(types.map(t => t.name)).not.toContain('silver'); // silver is 10, not > 10
    });

    it('should return empty array if no coin types are above value', () => {
      const types = getCoinTypesAboveValue(2000, coinSystem);
      expect(types).toHaveLength(0);
    });
  });

  describe('getCoinTypesBelowValue', () => {
    it('should return coin types with value less than the specified value', () => {
      const types = getCoinTypesBelowValue(10, coinSystem);
      // Should include copper (1)
      expect(types).toHaveLength(1);
      expect(types[0].name).toBe('copper');
    });

    it('should return empty array if no coin types are below value', () => {
      const types = getCoinTypesBelowValue(1, coinSystem);
      expect(types).toHaveLength(0);
    });
  });

  describe('getIndexOfCoinType', () => {
    it('should return the correct index for a valid denomination', () => {
      expect(getIndexOfCoinType('copper', coinSystem)).toBe(0);
      expect(getIndexOfCoinType('gold', coinSystem)).toBe(3);
    });

    it('should return -1 for an invalid denomination', () => {
      expect(getIndexOfCoinType('diamond', coinSystem)).toBe(-1);
    });
  });

  describe('getMaxCoinTypeForValue', () => {
    it('should return the highest value coin type that fits within the value', () => {
      expect(getMaxCoinTypeForValue(2000, coinSystem).name).toBe('platinum');
      expect(getMaxCoinTypeForValue(500, coinSystem).name).toBe('gold');
      expect(getMaxCoinTypeForValue(99, coinSystem).name).toBe('electrum');
      expect(getMaxCoinTypeForValue(5, coinSystem).name).toBe('copper');
    });

    it('should return the smallest coin type if value is very small but positive', () => {
      // Even if value is 0.5, it should probably return copper (1) as the fallback based on implementation?
      // Let's check implementation:
      // for (const denomination of sortedDenominations) { if (value >= denomination.value) return denomination; }
      // return sortedDenominations[sortedDenominations.length - 1];
      // So if value is 0.5, loop finishes, returns last (smallest) -> copper.
      expect(getMaxCoinTypeForValue(0.5, coinSystem).name).toBe('copper');
    });
  });

  describe('getAppropriateCoinTypes', () => {
    it('should return copper for small value', () => {
      const types = getAppropriateCoinTypes(5, coinSystem);
      // Copper (1) is the only one <= 5
      expect(types).toHaveLength(1);
      expect(types[0].name).toBe('copper');
    });

    it('should return multiple types for larger value, sorted by rarity', () => {
      const types = getAppropriateCoinTypes(1000, coinSystem);
      // Should include copper, silver, electrum, gold, platinum
      // Sorted by rarity: Copper(20), Gold(15), Silver(10), Platinum(5), Electrum(1)
      expect(types.length).toBeGreaterThan(0);
      expect(types[0].name).toBe('copper');
      expect(types[1].name).toBe('gold');
      expect(types[types.length - 1].name).toBe('electrum');
    });

    it('should filter out very small denominations for huge values', () => {
      const types = getAppropriateCoinTypes(1000000, coinSystem);
      // 1,000,000 value.
      // Threshold: 1,000,000 / 5000 = 200.
      // Copper (1), Silver (10), Electrum (50), Gold (100) are < 200.
      // Platinum (1000) is >= 200.
      // So only Platinum should be "reasonable".
      // Wait, if only platinum is reasonable, it returns that.
      // But if reasonable is empty, it returns all possible.

      // Let's check my logic:
      // reasonableCoins = possibleCoins.filter(d => d.value >= value / 5000);
      // value=1000000. value/5000 = 200.
      // Platinum (1000) >= 200.
      // So Platinum is reasonable.
      // Others are not.

      expect(types).toHaveLength(1);
      expect(types[0].name).toBe('platinum');
    });
  });
});
