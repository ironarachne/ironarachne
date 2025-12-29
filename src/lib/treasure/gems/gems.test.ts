import { describe, it, expect } from 'vitest';
import { generateGem, getGemTypesUpToValue, getGemsForValue, gemTypes, getDefaultGemGeneratorConfig, generateRandomGem, getGemWeightModifier, getRandomGemsForValue } from './gems';

describe('gems', () => {
  describe('generateGem', () => {
    it('should create a gem', () => {
      const gemType = gemTypes.find(g => g.name === 'ruby');
      if (!gemType) throw new Error('Ruby not found');
      const gem = generateGem('test-id', 'ruby', true, 'round', 'medium', gemType);
      expect(gem.id).toBe('test-id');
      expect(gem.name).toBe('ruby');
      expect(gem.value).toBe(gemType.baseValue);
      expect(gem.isCut).toBe(true);
      expect(gem.cut).toBe('round');
      expect(gem.size).toBe('medium');
    });
  });

  describe('getGemTypesUpToValue', () => {
    it('should return gems within max value', () => {
      const maxValue = 5000;
      const gems = getGemTypesUpToValue(maxValue);

      // amber is 5000, quartz is 200, lapis lazuli is 400.
      expect(gems.some(g => g.name === 'amber')).toBe(true);
      expect(gems.some(g => g.name === 'diamond')).toBe(false); // diamond is 50000
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

  describe('getDefaultGemGeneratorConfig', () => {
    it('should return default config', () => {
      const config = getDefaultGemGeneratorConfig();
      expect(config.allowCutGems).toBe(true);
      expect(config.allowUncutGems).toBe(true);
      expect(config.allowedCuts).toBeDefined();
      expect(config.allowedSizes).toBeDefined();
      expect(config.allowedTypes).toBeDefined();
    });
  });

  describe('generateRandomGem', () => {
    it('should generate a random gem', () => {
      const gem = generateRandomGem('test-seed');
      expect(gem).toBeDefined();
      expect(gem.id).toBeDefined();
      expect(gem.name).toBeDefined();
    });

    it('should be deterministic with seed', () => {
      const gem1 = generateRandomGem('seed-123');
      const gem2 = generateRandomGem('seed-123');
      expect(gem1).toEqual(gem2);
    });

    it('should respect config', () => {
      const config = getDefaultGemGeneratorConfig();
      config.allowCutGems = false;
      const gem = generateRandomGem('test-seed', config);
      expect(gem.isCut).toBe(false);
    });
  });

  describe('getGemWeightModifier', () => {
    it('should return correct modifier for medium cut gem', () => {
      const modifier = getGemWeightModifier(true, 'medium');
      expect(modifier).toBe(1);
    });

    it('should return correct modifier for medium uncut gem', () => {
      const modifier = getGemWeightModifier(false, 'medium');
      expect(modifier).toBe(1.2);
    });

    it('should return correct modifier for huge cut gem', () => {
      const modifier = getGemWeightModifier(true, 'huge');
      expect(modifier).toBe(2);
    });
  });

  describe('getRandomGemsForValue', () => {
    it('should return gems summing up to total value', () => {
      const totalValue = 1000;
      const gems = getRandomGemsForValue('test-seed', totalValue);
      const sum = gems.reduce((acc, gem) => acc + gem.value, 0);
      expect(sum).toBeLessThanOrEqual(totalValue);
    });

    it('should be deterministic with seed', () => {
      const gems1 = getRandomGemsForValue('seed-abc', 5000);
      const gems2 = getRandomGemsForValue('seed-abc', 5000);
      expect(gems1).toEqual(gems2);
    });
  });
});
