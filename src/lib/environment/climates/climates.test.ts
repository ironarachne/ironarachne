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
      ...Climates.getDefaultConfig(new RNG('base-seed')),
      latitude: 80, // Polar
    };
    const climate = Climates.generate(config);

    expect(climate.seasons.length).toBe(4);
    expect(climate.seasons[0].name).toBe('spring');
  });

  it('describes a climate', () => {
    const config = Climates.getDefaultConfig(new RNG('base-seed'));
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

describe('Site temperature', () => {
  const climate = Climates.generate({
    ...Climates.getDefaultConfig(new RNG('site-climate')),
    latitude: 40,
  });

  it('applies the saved season departures to a local annual mean', () => {
    const site = Climates.siteTemperature(climate, 5);
    expect(site.annualMean).toBe(5);
    expect(site.coldestMonth).toBeCloseTo(5 + climate.temperatureMin - climate.temperature, 10);
    expect(site.warmestMonth).toBeCloseTo(5 + climate.temperatureMax - climate.temperature, 10);
    expect(site.coldestSeason).toBe('winter');
    expect(site.warmestSeason).toBe('summer');
  });

  it('falls back to the stored range when there are no seasons', () => {
    const legacy = { ...climate, seasons: [] };
    const site = Climates.siteTemperature(legacy, 12);
    expect(site.coldestMonth).toBeCloseTo(12 + legacy.temperatureMin - legacy.temperature, 10);
    expect(site.warmestMonth).toBeCloseTo(12 + legacy.temperatureMax - legacy.temperature, 10);
    expect(site.coldestSeason).toBe('');
  });
});

describe('Climate prose', () => {
  it('describes the annual mean rather than a single warm month', () => {
    const climate = {
      ...Climates.generate({
        ...Climates.getDefaultConfig(new RNG('prose-climate')),
        latitude: 40,
      }),
      temperature: 12,
      temperatureMin: 2,
      temperatureMax: 32,
    };
    const description = Climates.describe(climate, 'prose-seed');
    expect(description).toContain('moderate temperatures');
    expect(description).not.toContain('scorching heat');
    expect(description).toContain('The coldest month averages 2°C');
    expect(description).toContain('warmest 32°C');
  });

  it('says temperatures vary little when the seasonal range is small', () => {
    const climate = {
      ...Climates.generate({
        ...Climates.getDefaultConfig(new RNG('prose-climate')),
        latitude: 0,
      }),
      temperature: 26,
      temperatureMin: 25,
      temperatureMax: 27,
    };
    expect(Climates.describe(climate, 'prose-seed')).toContain(
      'Temperatures vary little through the year.',
    );
  });
});
