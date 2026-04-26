import type { Biome } from './biome_types';
import type { BiomeGeneratorConfig } from './biome_types';
import * as BiomeClassifications from './biome_classifications';
import * as RNG from '@ironarachne/rng';
import * as Words from '@ironarachne/words';

import type { BiomeClassification } from './biome_types.js';

export function generate(config: BiomeGeneratorConfig): Biome {
  const biomeClassification = getBiomeClassificationForConfig(config);

  const features = generateBiomeFeatures(config.rng.randomString(13), biomeClassification);
  const descriptions = generateBiomeDescriptions(config.rng.randomString(13), biomeClassification);

  let biome: Biome = {
    name: biomeClassification.name,
    altitude: config.altitude,
    humidity: config.rng.float(config.humidityMin, config.humidityMax),
    isAquatic: config.isAquatic,
    temperature: config.rng.float(config.temperatureMin, config.temperatureMax),
    descriptions,
    features,
  };

  return biome;
}

export function generateBiomeDescriptions(
  seed: string,
  biomeClassification: BiomeClassification
): string[] {
  const rng = new RNG.RNG(seed);
  let descriptions = [];

  const averageHumidity = (biomeClassification.humidityMax + biomeClassification.humidityMin) / 2;
  const averageTemperature =
    (biomeClassification.temperatureMax + biomeClassification.temperatureMin) / 2;
  const averageAltitude = (biomeClassification.altitudeMax + biomeClassification.altitudeMin) / 2;

  let temperatureDescriptors = [];

  if (averageTemperature < 0) {
    temperatureDescriptors = ['freezing'];
  } else if (averageTemperature < 10) {
    temperatureDescriptors = ['cold'];
  } else if (averageTemperature < 20) {
    temperatureDescriptors = ['cool'];
  } else if (averageTemperature < 30) {
    temperatureDescriptors = ['warm'];
  } else {
    temperatureDescriptors = ['hot'];
  }

  let humidityDescriptors = [];

  if (averageHumidity < 0.2) {
    humidityDescriptors = ['arid'];
  } else if (averageHumidity < 0.4) {
    humidityDescriptors = ['dry'];
  } else if (averageHumidity < 0.6) {
    humidityDescriptors = ['damp'];
  } else {
    humidityDescriptors = ['humid'];
  }

  let altitudeDescriptors = [];

  if (averageAltitude < 0.2) {
    altitudeDescriptors = ['low-altitude'];
  } else if (averageAltitude < 0.6) {
    altitudeDescriptors = ['mid-altitude'];
  } else {
    altitudeDescriptors = ['high-altitude'];
  }

  descriptions = [
    `The area is ${rng.item(temperatureDescriptors)} and ${rng.item(humidityDescriptors)}. It's ${Words.article(biomeClassification.name)} ${biomeClassification.name}.`,
    `This ${biomeClassification.name} is ${rng.item(temperatureDescriptors)} and ${rng.item(humidityDescriptors)}.`,
    `The area is a ${rng.item(altitudeDescriptors)} ${biomeClassification.name}.`,
  ];

  return descriptions;
}

export function generateBiomeFeatures(
  seed: string,
  biomeClassification: BiomeClassification
): string[] {
  const rng = new RNG.RNG(seed);
  let features = [];

  if (biomeClassification.vegetationDensity > 0) {
    const vegetation = rng.item(biomeClassification.vegetationTypes);
    if (biomeClassification.vegetationDensity > 0.5) {
      const denseWord = rng.item(['filled', 'thick', 'dense', 'overgrown']);
      features.push(`The area is ${denseWord} with ${vegetation}s.`);
    } else if (biomeClassification.vegetationDensity > 0.3) {
      const patchesWord = rng.item(['patches', 'patches of', 'patches of vegetation']);
      features.push(`There are ${patchesWord} ${vegetation}s.`);
    } else {
      const fewWord = rng.item(['few', 'scattered', 'occasional', 'rare']);
      features.push(`There are ${fewWord} ${vegetation}s.`);
    }
  }

  if (biomeClassification.faunaDensity > 0) {
    const fauna = rng.item(biomeClassification.faunaTypes);
    if (biomeClassification.faunaDensity > 0.5) {
      const denseWord = rng.item(['teeming', 'swarming', 'packed', 'thick']);
      features.push(`The area is ${denseWord} with ${fauna}s.`);
    } else if (biomeClassification.faunaDensity > 0.3) {
      const manyWord = rng.item(['many', 'numerous', 'plentiful', 'abundant']);
      features.push(`There are ${manyWord} ${fauna}s.`);
    } else {
      const fewWord = rng.item(['few', 'scattered', 'occasional', 'rare']);
      features.push(`There are ${fewWord} ${fauna}s.`);
    }
  }

  if (biomeClassification.waterFeatureDensity > 0) {
    const waterFeature = rng.item(biomeClassification.waterFeatures);
    if (biomeClassification.waterFeatureDensity > 0.5) {
      features.push(`There is a large ${waterFeature} here.`);
    } else if (biomeClassification.waterFeatureDensity > 0.3) {
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
    rng: new RNG.RNG(Date.now().toString()),
  };
}

function getBiomeClassificationForConfig(config: BiomeGeneratorConfig): BiomeClassification {
  const biomeClassifications = BiomeClassifications.getAll();

  // Using a distance algorithm, select the biome type that most closely matches the config
  let minDistance = Infinity;
  let bestMatch = biomeClassifications[0];

  for (const type of biomeClassifications) {
    if (config.isAquatic !== type.isAquatic) continue;

    // Calculate distance based on midpoints to find the most conceptually similar biome
    const typeMidAltitude = (type.altitudeMax + type.altitudeMin) / 2;
    const altitudeDistance = Math.abs(config.altitude - typeMidAltitude);

    const configMidHumidity = (config.humidityMax + config.humidityMin) / 2;
    const typeMidHumidity = (type.humidityMax + type.humidityMin) / 2;
    const humidityDistance = Math.abs(configMidHumidity - typeMidHumidity);

    const configMidTemp = (config.temperatureMax + config.temperatureMin) / 2;
    const typeMidTemp = (type.temperatureMax + type.temperatureMin) / 2;
    // Normalize temperature distance so it isn't over-weighted (typical range -30 to 50, diff ~80)
    const tempDistance = Math.abs(configMidTemp - typeMidTemp) / 80;

    // Sum of distances (can be weighted if desired)
    const distance = altitudeDistance + humidityDistance + tempDistance;

    if (distance < minDistance) {
      minDistance = distance;
      bestMatch = type;
    }
  }

  return bestMatch;
}
