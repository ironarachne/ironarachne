import { describe, it, expect } from 'vitest';
import { RNG } from '@ironarachne/rng';
import { generate, getDefaultConfig, possibleSoils, possibleRocks } from './terrain';
import type { TerrainGeneratorConfig } from './terrain_types';

describe('Terrain Generator', () => {
  it('should generate a terrain deterministically given a seed', () => {
    const config1: TerrainGeneratorConfig = {
      ...getDefaultConfig(),
      rng: new RNG('test-seed-1'),
    };

    const terrain1 = generate(config1);

    const config2: TerrainGeneratorConfig = {
      ...getDefaultConfig(),
      rng: new RNG('test-seed-1'),
    };

    const terrain2 = generate(config2);

    expect(terrain1).toEqual(terrain2);
  });

  it('should assign valid geology materials to a generated terrain', () => {
    const config: TerrainGeneratorConfig = {
      ...getDefaultConfig(),
      rng: new RNG('geology-seed'),
    };

    const terrain = generate(config);
    expect(terrain.geologicalMakeup).toBeDefined();

    expect(terrain.geologicalMakeup.soilTypes.length).toBeGreaterThan(0);
    expect(terrain.geologicalMakeup.rockTypes.length).toBeGreaterThan(0);

    for (const soil of terrain.geologicalMakeup.soilTypes) {
      expect(possibleSoils).toContain(soil);
    }

    for (const rock of terrain.geologicalMakeup.rockTypes) {
      expect(possibleRocks).toContain(rock);
    }
  });
});
