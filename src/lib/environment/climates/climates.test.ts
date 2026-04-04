import { describe, it, expect } from 'vitest';
import * as Climates from './climates';
import type { ClimateGeneratorConfig } from './climate_types';
import { RNG } from '@ironarachne/rng';

describe('Climates Generator', () => {
  it('generates a climate deterministically with a given seed', () => {
    const config: ClimateGeneratorConfig = {
      elevation: 0.5,
      latitude: 45,
      longitude: -120,
      waterDirection: [0.5, -0.5, 0],
      current: [0.1, 0, 0],
      temperatureAtEquator: 30,
      terrainNormalVector: [0, 0, 1],
      rng: new RNG('test-seed-123'),
    };

    const climate1 = Climates.generate(config);

    const config2: ClimateGeneratorConfig = {
      ...config,
      rng: new RNG('test-seed-123'),
    };

    const climate2 = Climates.generate(config2);

    expect(climate1).toEqual(climate2);
  });

  it('generates climate name properly', () => {
    const config: ClimateGeneratorConfig = {
      elevation: 0,
      latitude: 0,
      longitude: 0,
      waterDirection: [0, 0, 0],
      current: [0, 0, 0],
      temperatureAtEquator: 40,
      terrainNormalVector: [0, 0, 0],
      rng: new RNG('equator-seed'),
    };

    const climate = Climates.generate(config);
    expect(climate.name).toBe('tropical'); // expected at 0 lat with high temp
  });

  it('gets climate type by name', () => {
    const tropical = Climates.getClimateTypeByName('tropical');
    expect(tropical.name).toBe('tropical');

    const notFound = Climates.getClimateTypeByName('nonexistent');
    expect(notFound.name).toBe('tropical'); // default fallback
  });

  it('returns valid seasons', () => {
    const config: ClimateGeneratorConfig = {
      ...Climates.getDefaultConfig(),
      latitude: 80, // Polar
    };
    const climate = Climates.generate(config);

    expect(climate.seasons.length).toBe(4);
    expect(climate.seasons[0].name).toBe('spring');
  });

  it('describes a climate', () => {
    const config = Climates.getDefaultConfig();
    const climate = Climates.generate(config);
    const description = Climates.describe(climate, 'test-seed');
    expect(description).toContain('seasons');
    expect(description).toContain(climate.name);
  });

  describe('Precipitation Verification', () => {
    it('generates low precipitation for dry, inland configurations', () => {
      const config: ClimateGeneratorConfig = {
        elevation: 0.1,
        latitude: 35,
        longitude: 0,
        waterDirection: [20, 20, 0], // far inland (distance > 5 normalizes to 0 influence)
        current: [0, 0, 0],
        temperatureAtEquator: 40,
        terrainNormalVector: [0, 0, 0],
        rng: new RNG('dry-seed'),
      };
      const climate = Climates.generate(config);

      // With far water and typical conditions, it should be fairly dry
      expect(climate.precipitationAmount).toBeLessThan(0.4);

      // Should categorize as something like arid or continental depending on temp
      const climateType = Climates.getClimateTypeByName(climate.name);
      expect(climate.precipitationAmount).toBeLessThanOrEqual(climateType.precipitationMax + 0.15);
    });

    it('generates high precipitation for warm, coastal configurations', () => {
      const config: ClimateGeneratorConfig = {
        elevation: 0.1,
        latitude: 5,
        longitude: 0,
        waterDirection: [0.1, 0.1, 0], // close to water
        current: [0.5, 0.5, 0],
        temperatureAtEquator: 40,
        terrainNormalVector: [0.5, 0.5, 0], // favorable terrain tilt
        rng: new RNG('wet-seed'),
      };
      const climate = Climates.generate(config);

      // Near equator, close to water, and warm should yield high rain
      expect(climate.precipitationAmount).toBeGreaterThan(0.5);

      // Will likely match tropical or temperate
      const climateType = Climates.getClimateTypeByName(climate.name);
      expect(climate.precipitationAmount).toBeGreaterThanOrEqual(
        climateType.precipitationMin - 0.15,
      );
    });
  });
});
