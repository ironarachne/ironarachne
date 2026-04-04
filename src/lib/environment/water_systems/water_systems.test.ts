import { describe, it, expect } from 'vitest';
import * as WaterSystems from './water_systems';
import type { WaterSystemGeneratorConfig } from './water_system_types';
import { RNG } from '@ironarachne/rng';

describe('Water Systems Generator', () => {
  it('generates a water system deterministically with a given seed', () => {
    const config: WaterSystemGeneratorConfig = {
      current: [0.5, -0.5, 0],
      latitude: 45,
      temperatureMin: 0,
      temperatureMax: 30,
      surfaceLevelMin: -0.5,
      surfaceLevelMax: 0.5,
      waterTypes: ['fresh', 'salt', 'brackish'],
      rng: new RNG('water-seed-1'),
    };

    const waterSystem1 = WaterSystems.generate(config);

    const config2: WaterSystemGeneratorConfig = {
      ...config,
      rng: new RNG('water-seed-1'),
    };

    const waterSystem2 = WaterSystems.generate(config2);

    expect(waterSystem1).toEqual(waterSystem2);
  });

  it('calculates temperature based on latitude', () => {
    const configEquator: WaterSystemGeneratorConfig = {
      ...WaterSystems.getDefaultConfig(),
      latitude: 0,
      temperatureMin: 0,
      temperatureMax: 30,
      rng: new RNG('temp-seed'),
    };

    const equatorSystem = WaterSystems.generate(configEquator);
    expect(equatorSystem.temperature).toBe(30);

    const configPoles: WaterSystemGeneratorConfig = {
      ...configEquator,
      latitude: 90,
      rng: new RNG('temp-seed-poles'),
    };

    const polarSystem = WaterSystems.generate(configPoles);
    expect(polarSystem.temperature).toBe(0);
  });
});
