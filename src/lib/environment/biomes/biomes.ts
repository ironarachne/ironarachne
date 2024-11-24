import type Biome from "./biome";
import type BiomeGeneratorConfig from "./generator_config";
import * as BiomeTypes from "./biome_types";
import * as RND from "@ironarachne/rng";
import * as Words from "@ironarachne/words";
import random from "random";
import type BiomeType from "./biome_type.js";

export function generate(config: BiomeGeneratorConfig): Biome {
  const biomeType = getBiomeTypeForConfig(config);

  const features = generateBiomeFeatures(biomeType);
  const descriptions = generateBiomeDescriptions(biomeType);

  let biome: Biome = {
    name: biomeType.name,
    altitude: config.altitude,
    humidity: random.float(config.humidityMin, config.humidityMax),
    isAquatic: config.isAquatic,
    temperature: random.float(config.temperatureMin, config.temperatureMax),
    descriptions,
    features,
  };

  return biome;
}

export function generateBiomeName(biome: Biome): string {
  let name = "plains";

  if (biome.temperature > 25) {
    if (biome.humidity > 0.5) {
      name = "rainforest";
    } else {
      name = "desert";
    }
  } else if (biome.temperature > 15) {
    if (biome.humidity > 0.5) {
      name = "forest";
    } else {
      name = "grassland";
    }
  } else if (biome.temperature > 5) {
    if (biome.humidity > 0.5) {
      name = "temperate forest";
    } else {
      name = "tundra";
    }
  }

  return name;
}

export function generateBiomeDescriptions(biomeType: BiomeType): string[] {
  let descriptions = [];

  const averageHumidity = (biomeType.humidityMax + biomeType.humidityMin) / 2;
  const averageTemperature = (biomeType.temperatureMax + biomeType.temperatureMin) / 2;
  const averageAltitude = (biomeType.altitudeMax + biomeType.altitudeMin) / 2;

  let temperatureDescriptors = [];

  if (averageTemperature < 0) {
    temperatureDescriptors = ["freezing"];
  } else if (averageTemperature < 10) {
    temperatureDescriptors = ["cold"];
  } else if (averageTemperature < 20) {
    temperatureDescriptors = ["cool"];
  } else if (averageTemperature < 30) {
    temperatureDescriptors = ["warm"];
  } else {
    temperatureDescriptors = ["hot"];
  }

  let humidityDescriptors = [];

  if (averageHumidity < 0.2) {
    humidityDescriptors = ["arid"];
  } else if (averageHumidity < 0.4) {
    humidityDescriptors = ["dry"];
  } else if (averageHumidity < 0.6) {
    humidityDescriptors = ["damp"];
  } else {
    humidityDescriptors = ["humid"];
  }

  let altitudeDescriptors = [];

  if (averageAltitude < 0.2) {
    altitudeDescriptors = ["low-altitude"];
  } else if (averageAltitude < 0.6) {
    altitudeDescriptors = ["mid-altitude"];
  } else {
    altitudeDescriptors = ["high-altitude"];
  }

  descriptions = [
    `The area is ${RND.item(temperatureDescriptors)} and ${RND.item(humidityDescriptors)}. It's ${Words.article(biomeType.name)} ${biomeType.name}.`,
    `This ${biomeType.name} is ${RND.item(temperatureDescriptors)} and ${RND.item(humidityDescriptors)}.`,
    `The area is a ${RND.item(altitudeDescriptors)} ${biomeType.name}.`,
  ];

  return descriptions;
}

export function generateBiomeFeatures(biomeType: BiomeType): string[] {
  let features = [];

  if (biomeType.vegetationDensity > 0) {
    const vegetation = RND.item(biomeType.vegetationTypes);
    if (biomeType.vegetationDensity > 0.5) {
      features.push(`The area is filled with ${vegetation}.`);
    } else if (biomeType.vegetationDensity > 0.3) {
      features.push(`There are patches of ${vegetation}.`);
    } else {
      features.push(`There are a few ${vegetation}.`);
    }
  }

  if (biomeType.faunaDensity > 0) {
    const fauna = RND.item(biomeType.faunaTypes);
    if (biomeType.faunaDensity > 0.5) {
      features.push(`The area is teeming with ${fauna}.`);
    } else if (biomeType.faunaDensity > 0.3) {
      features.push(`There are many ${fauna}.`);
    } else {
      features.push(`There are a few ${fauna}.`);
    }
  }

  if (biomeType.waterFeatureDensity > 0) {
    const waterFeature = RND.item(biomeType.waterFeatures);
    if (biomeType.waterFeatureDensity > 0.5) {
      features.push(`There is a large ${waterFeature} here.`);
    } else if (biomeType.waterFeatureDensity > 0.3) {
      features.push(`There is a small ${waterFeature} here.`);
    } else {
      features.push(`There is ${Words.article(waterFeature)} ${waterFeature} here.`);
    }
  }

  return features;
}

export function getDefaultConfig(): BiomeGeneratorConfig {
  return {
    altitude: 0,
    humidityMin: 0,
    humidityMax: 1,
    isAquatic: false,
    temperatureMin: 0,
    temperatureMax: 30,
  };
}

function getBiomeTypeForConfig(config: BiomeGeneratorConfig): BiomeType {
  const biomeTypes = BiomeTypes.getAll();

  console.debug(`Biome config: ${JSON.stringify(config)}`);

  // Using a generational algorithm, select the biome type that most closely matches the config
  let scores = new Map<string, number>();

  for (let type of biomeTypes) {
    let score = 0;

    if (config.altitude >= type.altitudeMin && config.altitude <= type.altitudeMax) {
      score++;
    }

    if (config.humidityMin >= type.humidityMin && config.humidityMax <= type.humidityMax) {
      score++;
    }

    if (config.temperatureMin >= type.temperatureMin && config.temperatureMax <= type.temperatureMax) {
      score++;
    }

    if (config.isAquatic !== type.isAquatic) {
      score = 0;
    }

    scores.set(type.name, score);
  }

  let highestScore = 0;
  let highestScoreName = "";

  for (let [key, value] of scores) {
    console.debug(`Biome type: ${key}, score: ${value}`);
    if (value > highestScore) {
      highestScore = value;
      highestScoreName = key;
    }
  }

  return BiomeTypes.getByName(highestScoreName);
}
