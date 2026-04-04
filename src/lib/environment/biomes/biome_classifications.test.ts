import { describe, expect, it } from 'vitest';
import * as BiomeClassifications from './biome_classifications';

describe('biome_classifications', () => {
  it('getAll should return all 26 biomes', () => {
    const biomes = BiomeClassifications.getAll();
    expect(biomes.length).toBe(26);
  });

  it('getByName should return the correct biome classification', () => {
    const biome = BiomeClassifications.getByName('tropical rainforest');
    expect(biome.name).toBe('tropical rainforest');
    expect(biome.isAquatic).toBe(false);
  });

  it('getByName should throw an error for an invalid biome classification name', () => {
    expect(() => BiomeClassifications.getByName('nonexistent biome')).toThrowError(
      'Biome classification nonexistent biome not found',
    );
  });

  it('all classifications should have valid boundaries', () => {
    const biomes = BiomeClassifications.getAll();
    for (const biome of biomes) {
      expect(biome.altitudeMax).toBeGreaterThanOrEqual(biome.altitudeMin);
      expect(biome.humidityMax).toBeGreaterThanOrEqual(biome.humidityMin);
      expect(biome.temperatureMax).toBeGreaterThanOrEqual(biome.temperatureMin);

      // Densities should be between 0 and 1
      expect(biome.faunaDensity).toBeGreaterThanOrEqual(0);
      expect(biome.faunaDensity).toBeLessThanOrEqual(1);
      expect(biome.vegetationDensity).toBeGreaterThanOrEqual(0);
      expect(biome.vegetationDensity).toBeLessThanOrEqual(1);
      expect(biome.waterFeatureDensity).toBeGreaterThanOrEqual(0);
      expect(biome.waterFeatureDensity).toBeLessThanOrEqual(1);
    }
  });
});
