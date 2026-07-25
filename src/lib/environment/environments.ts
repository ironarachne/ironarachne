import * as RNG from '@ironarachne/rng';
import * as Biomes from './biomes/biomes';
import * as Climates from './climates/climates';
import * as EcosystemGeneration from './ecosystems/ecosystem_generation';
import * as TerrainGeneration from './terrain/index';
import * as WaterSystems from './water_systems/index';
import type Environment from './environment';
import type { Terrain } from './terrain/index';
import type EnvironmentGeneratorConfig from './environment_generator_config';

export function generate(config: EnvironmentGeneratorConfig): Environment {
  config.terrainConfig.elevationMin = Math.max(config.elevation - 0.1, -1.0);
  config.terrainConfig.elevationMax = Math.min(config.elevation + 0.1, 1.0);
  config.terrainConfig.erosionIterations = config.erosionIterations;
  config.terrainConfig.erosionStrength = config.erosionStrength;
  config.terrainConfig.rng = config.rng;
  config.terrainConfig.reliefEnergyMin = Math.max(config.reliefEnergy - 0.01, 0.0);
  config.terrainConfig.reliefEnergyMax = Math.min(config.reliefEnergy + 0.01, 1.0);
  config.terrainConfig.normalVector = config.terrainVector;
  const terrain = TerrainGeneration.generate(config.terrainConfig);

  config.waterSystemConfig.current = config.current;
  config.waterSystemConfig.latitude = config.latitude;
  config.waterSystemConfig.rng = config.rng;
  const waterSystem = WaterSystems.generate(config.waterSystemConfig);

  config.climateConfig.current = waterSystem.current;
  config.climateConfig.latitude = config.latitude;
  config.climateConfig.rng = config.rng;
  config.climateConfig.elevation = config.rng.float(terrain.elevationMin, terrain.elevationMax);
  config.climateConfig.terrainNormalVector = config.terrainVector;
  config.climateConfig.waterDirection = config.waterDirection;
  const climate = Climates.generate(config.climateConfig);
  climate.description = Climates.describe(climate, config.rng.randomString(16));

  const biomeConfig = config.biomeConfig;
  biomeConfig.rng = config.rng;
  biomeConfig.altitude = config.climateConfig.elevation;
  biomeConfig.temperatureMax = climate.temperatureMax;
  biomeConfig.temperatureMin = climate.temperatureMin;
  biomeConfig.humidityMax = Math.min(climate.humidity + 0.1, 1.0);
  biomeConfig.humidityMin = Math.max(climate.humidity - 0.1, 0.0);
  const biome = Biomes.generate(biomeConfig);

  const ecosystem = EcosystemGeneration.generate(config.ecosystemConfig);

  const environment: Environment = {
    biome,
    climate,
    terrain,
    dominantEcosystem: ecosystem,
    ecosystems: [ecosystem],
    waterSystem,
    description: '',
  };

  environment.description = `${config.rng.item(biome.descriptions)} ${config.rng.item(biome.features)}`;
  environment.description += ` ${environment.climate.description}`;
  environment.description += ` ${describeTerrain(terrain, config.rng)}`;

  return environment;
}

export function generateForClimate(climateName: string, rng: RNG.RNG): Environment {
  const config = getDefaultConfig();
  const climateType = Climates.getClimateTypeByName(climateName);
  config.latitude = rng.float(climateType.latitudeMin, climateType.latitudeMax);
  config.rng = rng;

  return generate(config);
}

export function describeTerrain(terrain: Terrain, rng: RNG.RNG): string {
  let relief = 'flat';

  if (terrain.reliefEnergy > 0.5) {
    relief = 'mountainous';
  } else if (terrain.reliefEnergy > 0.3) {
    relief = 'hilly';
  }

  const averageElevation = (terrain.elevationMin + terrain.elevationMax) / 2;

  let elevation = 'mid-altitude';

  if (averageElevation > 0.8) {
    elevation = 'high-altitude';
  } else if (averageElevation < 0.2) {
    elevation = 'low-altitude';
  }

  let description = `The terrain is ${relief} and ${elevation}`;

  const slope = getDirectionOfSlope(terrain);

  if (slope !== '') {
    const slopeStrength = getStrengthOfSlope(terrain);

    if (slopeStrength > 0.5) {
      description += rng.item([
        ` with a steep slope up to the ${slope}`,
        `. It has a steep slope up to the ${slope}`,
      ]);
    } else if (slopeStrength > 0.3) {
      description += rng.item([
        ` with a moderate slope up to the ${slope}`,
        `. It has a moderate slope up to the ${slope}`,
      ]);
    } else {
      description += rng.item([
        ` with a gentle slope up to the ${slope}`,
        `. It has a gentle slope up to the ${slope}`,
      ]);
    }
  }

  description += '.';

  return description;
}

export function getDefaultConfig(): EnvironmentGeneratorConfig {
  return {
    biomeConfig: Biomes.getDefaultConfig(),
    climateConfig: Climates.getDefaultConfig(),
    current: [0, 0, 0],
    ecosystemConfig: EcosystemGeneration.getDefaultConfig(),
    elevation: 0.35,
    erosionIterations: 3,
    erosionStrength: 2,
    latitude: 35,
    reliefEnergy: 0.05,
    terrainVector: [0, 0, 0],
    terrainConfig: TerrainGeneration.getDefaultConfig(),
    waterDirection: [0, 0, 0], // water is present
    waterSystemConfig: WaterSystems.getDefaultConfig(),
    rng: new RNG.RNG(Date.now().toString()),
  };
}

export function getDirectionOfSlope(terrain: Terrain): string {
  // If the normal vector is not [0, 0, 0], then the terrain is sloped
  // We want to know the direction of "uphill" for the terrain
  let slope = '';

  const x = terrain.normalVector[0];
  const y = terrain.normalVector[1];

  // We don't care about z because that would be rotation around the z-axis, which is irrelevant for our purposes

  if (x > 0.0 && y > 0.0) {
    slope = 'northwest';
  } else if (x > 0.0 && y < 0.0) {
    slope = 'northeast';
  } else if (x < 0.0 && y > 0.0) {
    slope = 'southwest';
  } else if (x < 0.0 && y < 0.0) {
    slope = 'southeast';
  } else if (x > 0.0 && y === 0.0) {
    slope = 'east';
  } else if (x < 0.0 && y === 0.0) {
    slope = 'west';
  } else if (x === 0.0 && y > 0.0) {
    slope = 'north';
  } else if (x === 0.0 && y < 0.0) {
    slope = 'south';
  }

  return slope;
}

export function getStrengthOfSlope(terrain: Terrain): number {
  // The strength of the slope is the average of the x, y, and z values of the normal vector
  return (terrain.normalVector[0] + terrain.normalVector[1] + terrain.normalVector[2]) / 3;
}
