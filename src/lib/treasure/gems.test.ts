import { describe, it, expect } from 'vitest';
import { generateGem, getGemTypesUpToValue, getGemsForValue, gemTypes } from './gems';

describe('gems', () => {
  describe('generateGem', () => {
    it('should create a gem', () => {
      const gem = generateGem('test-id', 'ruby', 400, true);
      expect(gem.id).toBe('test-id');
      expect(gem.name).toBe('ruby');
      expect(gem.value).toBe(400);
      expect(gem.isCut).toBe(true);
    });
  });

  describe('getGemTypesUpToValue', () => {
    it('should return gems within max value', () => {
      const maxValue = 50;
      const gems = getGemTypesUpToValue(maxValue);

      // amber is 50, quartz is 20, lapis lazuli is 40.
      expect(gems.some(g => g.name === 'amber')).toBe(true);
      expect(gems.some(g => g.name === 'diamond')).toBe(false); // diamond is 500
    });
  });

  describe('getGemsForValue', () => {
    it('should return gems summing up to total value', () => {
      const totalValue = 1000;
      const gems = getGemsForValue(totalValue);
      const sum = gems.reduce((acc, gem) => acc + gem.value, 0);

      expect(sum).toBeLessThanOrEqual(totalValue);
      // With the greedy algorithm and available gem values, 1000 should be exactly fillable (e.g. 2 diamonds)
      expect(sum).toBe(totalValue);
    });

    it('should return empty list for very low value', () => {
      const totalValue = 10; // Lowest gem is quartz at 20
      const gems = getGemsForValue(totalValue);
      expect(gems).toHaveLength(0);
    });
  });
});
