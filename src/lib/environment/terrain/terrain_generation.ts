import random from "random";
import type TerrainGeneratorConfig from "./generator_config";
import type Terrain from "./terrain";

export function generate(config: TerrainGeneratorConfig): Terrain {
  // a terrain is meant as a section of the world, with a certain elevation range, relief energy, and landforms
  // this will be used on its own for regions, but can also be used when generating a world or a map
  // sometimes it will be used as the basis for generating neighboring terrains

  const reliefEnergy = random.float(config.reliefEnergyMin, config.reliefEnergyMax);
  const baseElevation = random.float(config.elevationMin, config.elevationMax);
  const elevationMin = Math.max(baseElevation - reliefEnergy, -1.0);
  const elevationMax = Math.min(baseElevation + reliefEnergy, 1.0);

  let result: Terrain = {
    elevationMin: elevationMin,
    elevationMax: elevationMax,
    reliefEnergy: reliefEnergy,
    normalVector: config.normalVector,
    landforms: [],
  };

  for (let i = 0; i < config.erosionIterations; i++) {
    result = erode(result, config.erosionStrength);
  }

  return result;
}

export function getDefaultConfig(): TerrainGeneratorConfig {
  return {
    elevationMin: 0,
    elevationMax: 1.0,
    reliefEnergyMin: 0,
    reliefEnergyMax: 0.2,
    normalVector: [0, 0, 0],
    erosionIterations: 3,
    erosionStrength: 2,
  };
}

export function erode(terrain: Terrain, strength: number): Terrain {
  // Erode the terrain by the given strength
  // this alters the relief energy, the elevation min and max, and the normal vector
  // if there are landforms that are no longer valid, they should be removed
  // if there are new landforms that are valid, add a random one

  let result = {
    elevationMin: terrain.elevationMin / strength,
    elevationMax: terrain.elevationMax / strength,
    reliefEnergy: terrain.reliefEnergy / strength,
    normalVector: terrain.normalVector,
    landforms: terrain.landforms,
  }

  return result;
}
