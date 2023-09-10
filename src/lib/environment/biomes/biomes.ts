import * as RND from "@ironarachne/rng";
import type Climate from "../climates/climate.js";
import temperate from "../climates/temperate.js";
import type Biome from "./biome.js";
import ConiferousForest from "./coniferous_forest.js";
import DeciduousForest from "./deciduous_forest.js";
import Desert from "./desert.js";
import type BiomeGeneratorConfig from "./generator_config.js";
import Grassland from "./grassland.js";
import Mountain from "./mountain.js";
import Rainforest from "./rainforest.js";
import Tundra from "./tundra.js";

export function all(): Biome[] {
  return [
    Desert,
    DeciduousForest,
    ConiferousForest,
    Rainforest,
    Grassland,
    Mountain,
    Tundra,
  ];
}

export function generate(config: BiomeGeneratorConfig): Biome {
  let options = [];

  for (let i = 0; i < config.availableBiomes.length; i++) {
    let biome = config.availableBiomes[i];

    if (matchesClimate(biome, config.climate)) {
      options.push(biome);
    }
  }

  if (options.length === 0) {
    throw new Error(
      `No biomes in config with length ${config.availableBiomes.length} match the climate ${config.climate.name}.`,
    );
  }

  let biome = RND.item(options);

  return biome;
}

export function getDefaultConfig(): BiomeGeneratorConfig {
  return {
    availableBiomes: all(),
    climate: temperate,
  };
}

export function matchesClimate(biome: Biome, climate: Climate): boolean {
  let humidityMin = climate.precipitationAmount - 2;
  let humidityMax = climate.precipitationAmount + 2;
  let tempMin = climate.temperatureMin;
  let tempMax = climate.temperatureMax;
  if (
    biome.humidity <= humidityMax
    && biome.humidity >= humidityMin
    && biome.temperature <= tempMax
    && biome.temperature >= tempMin
  ) {
    return true;
  }

  return false;
}
