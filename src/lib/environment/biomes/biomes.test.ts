import { describe, expect, it } from 'vitest';
import {
  generate,
  getDefaultConfig,
  generateBiomeDescriptions,
  generateBiomeFeatures,
} from './biomes';
import * as BiomeClassifications from './biome_classifications';
import { RNG } from '@ironarachne/rng';

describe('biomes generator', () => {
  it('generates a biome successfully using default config', () => {
    const config = getDefaultConfig();
    const biome = generate(config);

    expect(biome).toBeDefined();
    expect(biome.name).toBeDefined();
    expect(biome.temperature).toBeDefined();
    expect(biome.humidity).toBeDefined();
  });

  it('generates a terrestrial biome when isAquatic is false', () => {
    const config = getDefaultConfig();
    config.isAquatic = false;
    config.temperatureMin = 25;
    config.temperatureMax = 40;
    config.humidityMin = 0.8;
    config.humidityMax = 1.0;

    const biome = generate(config);
    expect(biome.isAquatic).toBe(false);
    expect(biome.name).toBeDefined();
  });

  it('generates an aquatic biome when isAquatic is true', () => {
    const config = getDefaultConfig();
    config.isAquatic = true;
    config.temperatureMin = 25;
    config.temperatureMax = 35;
    config.humidityMin = 1.0;
    config.humidityMax = 1.0;

    const biome = generate(config);
    expect(biome.isAquatic).toBe(true);
    expect(biome.name).toBeDefined();
  });

  it('generates biome descriptions', () => {
    const rng = new RNG('test_seed');
    const biomeClassification = BiomeClassifications.getByName('tropical rainforest');

    const descriptions = generateBiomeDescriptions(biomeClassification, rng);
    expect(descriptions.length).toBeGreaterThan(0);
    expect(descriptions[0]).toContain('tropical rainforest');
  });

  it('generates biome features based on density correctly', () => {
    const rng = new RNG('test_seed');
    const biomeClassification = BiomeClassifications.getByName('subtropical desert');
    const features = generateBiomeFeatures(biomeClassification, rng);
    expect(features.length).toBeGreaterThan(0);
  });
});
