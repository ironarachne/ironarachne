import type { BiomeGeneratorConfig } from './biomes/biome_types';
import type ClimateGeneratorConfig from './climates/generator_config';
import type EcosystemConfig from './ecosystems/ecosystem_config';
import type { TerrainGeneratorConfig } from './terrain/index';
import type WaterSystemConfig from './water_systems/water_system_config';
import type { RNG } from '@ironarachne/rng';

export default interface EnvironmentGeneratorConfig {
  biomeConfig: BiomeGeneratorConfig;
  climateConfig: ClimateGeneratorConfig;
  current: number[];
  ecosystemConfig: EcosystemConfig;
  elevation: number;
  erosionIterations: number;
  erosionStrength: number;
  latitude: number;
  reliefEnergy: number;
  terrainConfig: TerrainGeneratorConfig;
  terrainVector: number[];
  waterDirection: number[];
  waterSystemConfig: WaterSystemConfig;
  rng: RNG;
}
