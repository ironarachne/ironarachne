import type { WaterSystem, WaterSystemGeneratorConfig } from './water_system_types';
import * as RNG from '@ironarachne/rng';

export function generate(config: WaterSystemGeneratorConfig): WaterSystem {
  // Generate a temperature based on latitude
  // At latitude 0, the temperature is always the max temperature
  // At latitude -90 or 90, the temperature is always the min temperature
  const latitudeFactor = 1 - Math.abs(config.latitude) / 90;
  const temperature =
    config.temperatureMin + (config.temperatureMax - config.temperatureMin) * latitudeFactor;

  return {
    current: config.current,
    surfaceLevel: config.rng.float(config.surfaceLevelMin, config.surfaceLevelMax),
    temperature,
    waterType: config.rng.item(config.waterTypes),
  };
}

/**
 * The default water-system settings, with the RNG the caller is generating from.
 *
 * Required rather than clock-defaulted, per decision 1 of docs/tool-readiness.md; see
 * `biomes.ts` for the whole of the reasoning.
 */
export function getDefaultConfig(rng: RNG.RNG): WaterSystemGeneratorConfig {
  return {
    current: [0, 0, 0],
    latitude: 0,
    temperatureMin: 0, // default to polar
    temperatureMax: 30, // default to tropical
    surfaceLevelMin: 0, // default to sea level
    surfaceLevelMax: 0, // default to sea level
    waterTypes: ['fresh', 'salt'],
    rng,
  };
}
