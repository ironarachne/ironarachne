import * as MT from '$lib/math_translation';
import type { Climate, ClimateGeneratorConfig, ClimateType, Season } from './climate_types';
import * as RNG from '@ironarachne/rng';

export function describe(climate: Climate, seed: string): string {
  const rng = new RNG.RNG(seed);

  const adjectives = ['notable for its', 'characterized by', 'known for', 'defined by'];

  const seasonPhrases = [
    `It experiences ${climate.seasons.length} distinct seasons.`,
    `There are ${climate.seasons.length} seasons throughout the year.`,
    `The year is divided into ${climate.seasons.length} seasons.`,
  ];

  let tempPhrase = 'moderate temperatures';
  if (climate.temperatureMax > 30) tempPhrase = 'scorching heat';
  else if (climate.temperatureMax > 20) tempPhrase = 'warm temperatures';
  else if (climate.temperatureMax < 0) tempPhrase = 'freezing cold';
  else if (climate.temperatureMax < 10) tempPhrase = 'chilly weather';

  let precipPhrase = 'average precipitation';
  if (climate.precipitationAmount > 0.8) precipPhrase = 'heavy rainfall';
  else if (climate.precipitationAmount > 0.5) precipPhrase = 'frequent rain';
  else if (climate.precipitationAmount < 0.2) precipPhrase = 'very little precipitation';
  else if (climate.precipitationAmount < 0.4) precipPhrase = 'sparse rain';

  const description = `The climate here is ${climate.name}, ${rng.item(adjectives)} ${tempPhrase} and ${precipPhrase}. ${rng.item(seasonPhrases)}`;

  return description;
}

export function generate(config: ClimateGeneratorConfig): Climate {
  const temperatureRange = getTemperatureRange(
    config.elevation,
    config.latitude,
    config.temperatureAtEquator,
  );
  const temperatureMin = temperatureRange[0];
  const temperatureMax = temperatureRange[1];
  const wind = getWind(
    config.latitude,
    config.waterDirection,
    config.terrainNormalVector,
    config.current,
  );

  const precipitationAmount = getPrecipitation(
    temperatureMax,
    wind,
    config.terrainNormalVector,
    config.waterDirection,
  );
  const precipitationFrequency = MT.clamp(precipitationAmount * config.rng.float(0.25, 1.25), 0, 1);

  const humidity = getHumidity(precipitationAmount, temperatureMax);

  const seasons = getSeasons(config.latitude, temperatureMax, precipitationAmount);

  const cloudCover = getCloudCover(
    config.latitude,
    temperatureMin + (temperatureMax - temperatureMin) / 2,
    wind,
  );

  const partialClimate: Climate = {
    name: 'unknown',
    description: '',
    cloudCover,
    wind,
    temperature: (temperatureMin + temperatureMax) / 2,
    temperatureMin,
    temperatureMax,
    precipitationAmount,
    precipitationFrequency,
    seasons,
    humidity,
  };

  const name = generateClimateName(partialClimate, config.latitude);

  return { ...partialClimate, name };
}

export function generateClimateName(climate: Climate, latitude: number): string {
  const climateTypes = getClimateTypes();

  let minDistance = Infinity;
  let bestMatch = climateTypes[0];

  for (const type of climateTypes) {
    const typeMidTemp = (type.temperatureMax + type.temperatureMin) / 2;
    // Temperature typical range -40 to 45 (approx 85)
    // We normalize to avoid temperature overwhelming the distance metric completely
    const tempDistance = Math.abs(climate.temperature - typeMidTemp) / 85;

    const typeMidPrecipitation = (type.precipitationMax + type.precipitationMin) / 2;
    const precipitationDistance = Math.abs(climate.precipitationAmount - typeMidPrecipitation);

    const typeMidHumidity = (type.humidityMax + type.humidityMin) / 2;
    const humidityDistance = Math.abs(climate.humidity - typeMidHumidity);

    const typeMidLatitude = (type.latitudeMax + type.latitudeMin) / 2;
    const latitudeDistance = Math.abs(Math.abs(latitude) - typeMidLatitude) / 90;

    const distance = tempDistance + precipitationDistance + humidityDistance + latitudeDistance;

    if (distance < minDistance) {
      minDistance = distance;
      bestMatch = type;
    }
  }

  return bestMatch.name;
}

export function getClimateTypeByName(name: string): ClimateType {
  const types = getClimateTypes();
  const result = types.find((type) => type.name === name);

  if (result === undefined) {
    console.debug(`Climate type ${name} not found, defaulting to ${types[0].name}`);
    return types[0];
  }

  return result;
}

export function getClimateTypes(): ClimateType[] {
  return [
    {
      name: 'tropical',
      precipitationMax: 1,
      precipitationMin: 0.5,
      temperatureMax: 40,
      temperatureMin: 18,
      humidityMax: 1,
      humidityMin: 0.5,
      latitudeMax: 23.5,
      latitudeMin: 0,
    },
    {
      name: 'arid',
      precipitationMax: 0.25,
      precipitationMin: 0,
      temperatureMax: 40,
      temperatureMin: -10,
      humidityMax: 0.25,
      humidityMin: 0.0,
      latitudeMax: 40,
      latitudeMin: 25,
    },
    {
      name: 'temperate',
      precipitationMax: 1.0,
      precipitationMin: 0.25,
      temperatureMax: 30,
      temperatureMin: 10,
      humidityMax: 0.75,
      humidityMin: 0.25,
      latitudeMax: 60,
      latitudeMin: 40,
    },
    {
      name: 'continental',
      precipitationMax: 0.5,
      precipitationMin: 0,
      temperatureMax: 18,
      temperatureMin: -30,
      humidityMax: 0.35,
      humidityMin: 0.0,
      latitudeMax: 70,
      latitudeMin: 50,
    },
    {
      name: 'polar',
      precipitationMax: 0.5,
      precipitationMin: 0,
      temperatureMax: 10,
      temperatureMin: -40,
      humidityMax: 0.25,
      humidityMin: 0.0,
      latitudeMax: 90,
      latitudeMin: 70,
    },
  ];
}

/**
 * The default climate settings, with the RNG the caller is generating from.
 *
 * Required rather than clock-defaulted, per decision 1 of docs/tool-readiness.md; see
 * `biomes.ts` for the whole of the reasoning.
 */
export function getDefaultConfig(rng: RNG.RNG): ClimateGeneratorConfig {
  return {
    elevation: 0.5,
    latitude: 0,
    longitude: 0,
    waterDirection: [0, 0, 0], // direction and distance to nearest body of water
    current: [0, 0, 0], // current is not present
    temperatureAtEquator: 35,
    terrainNormalVector: [0, 0, 0], // flat terrain
    rng,
  };
}

function getCloudCover(latitude: number, temperature: number, wind: number[]): number {
  // Cloud cover is influenced by latitude, temperature, and wind
  // Generally, cloud cover should be close to 0.65, with up to a 0.3 variance

  let cloudCover = 0.65;

  // Cloud cover is higher away from the equator
  cloudCover += 0.2 * (1 - Math.abs(latitude) / 90); // 90 degrees is the maximum latitude

  // Cloud cover is higher at lower temperatures
  cloudCover = cloudCover + 0.1 * (1 - temperature / 40); // 40 degrees Celsius is the maximum temperature

  // Cloud cover is lower with high wind speeds
  const windSpeed = Math.sqrt(Math.pow(wind[0], 2) + Math.pow(wind[1], 2));

  cloudCover = cloudCover - 0.2 * windSpeed; // normalize wind speed influence

  return MT.clamp(cloudCover, 0, 1);
}

function getHumidity(precipitation: number, temperature: number): number {
  // Humidity is influenced by precipitation and temperature
  // The humidity is higher at higher precipitation and higher temperatures

  let humidity = 0;

  // Humidity is higher at higher precipitation
  humidity += precipitation * 0.5;

  // Humidity is higher at higher temperatures
  humidity += (temperature / 40) * 0.5; // 40 degrees Celsius is the maximum temperature

  return MT.clamp(humidity, 0, 1);
}

function getPrecipitation(
  temperature: number,
  wind: number[],
  terrainTilt: number[],
  waterDirection: number[],
): number {
  // Precipitation is influenced by temperature, wind, and water distance
  // The amount of precipitation is higher at higher temperatures, higher wind speeds, and closer to water
  // Downslope motion of wind reduces precipitation, while upslope motion increases precipitation

  let precipitation = 0;

  // Normalize all factors to a 0-1 range first
  const tempInfluence = MT.clamp(temperature / 40, 0, 1); // 40 degrees Celsius maximum expected

  const dotProduct = wind[0] * terrainTilt[0] + wind[1] * terrainTilt[1];
  const terrainInfluence = MT.clamp(dotProduct > 0 ? dotProduct : -dotProduct * 0.5, 0, 1);

  const windSpeed = Math.sqrt(Math.pow(wind[0], 2) + Math.pow(wind[1], 2));
  const windInfluence = MT.clamp(windSpeed / 10, 0, 1); // normalize wind speed influence

  const waterDistance = MT.clamp(
    Math.sqrt(Math.pow(waterDirection[0], 2) + Math.pow(waterDirection[1], 2)) / 5,
    0,
    1,
  );
  const waterInfluence = 1 - waterDistance; // Precipitation is higher closer to water

  // Calculate weighted average to prevent precipitation from consistently capping out
  // Water: 40%, Temperature: 30%, Terrain: 20%, Wind Speed: 10%
  precipitation =
    waterInfluence * 0.4 + tempInfluence * 0.3 + terrainInfluence * 0.2 + windInfluence * 0.1;

  return MT.clamp(precipitation, 0, 1);
}

function getSeasons(latitude: number, _temperature: number, _precipitation: number): Season[] {
  // Seasons are influenced by latitude, temperature, and precipitation
  // The number of seasons is determined by the temperature and precipitation
  // The length of each season is determined by the temperature and precipitation

  let seasons: Season[] = [];

  // if latitude is between 23.5 and -23.5, there are two seasons; otherwise, there are four

  if (latitude < 23.5 && latitude > -23.5) {
    seasons = [
      {
        name: 'dry',
        startDay: 200,
        endDay: 50,
        temperatureAdjustment: 0.1,
        humidityAdjustment: 0,
      },
      {
        name: 'wet',
        startDay: 51,
        endDay: 199,
        temperatureAdjustment: 0,
        humidityAdjustment: 0.2,
      },
    ];
  } else {
    seasons = [
      {
        name: 'spring',
        startDay: 91,
        endDay: 181,
        temperatureAdjustment: 0,
        humidityAdjustment: 0.1,
      },
      {
        name: 'summer',
        startDay: 182,
        endDay: 272,
        temperatureAdjustment: 0.1,
        humidityAdjustment: 0.1,
      },
      {
        name: 'autumn',
        startDay: 273,
        endDay: 363,
        temperatureAdjustment: 0,
        humidityAdjustment: 0,
      },
      {
        name: 'winter',
        startDay: 364,
        endDay: 90,
        temperatureAdjustment: -0.1,
        humidityAdjustment: -0.1,
      },
    ];
  }

  // TODO: adjust the temperatureAdjustment and precipitationAdjustment based on the temperature and precipitation

  return seasons;
}

function getTemperatureRange(
  elevation: number,
  latitude: number,
  temperatureAtEquator: number,
): [number, number] {
  // Temperature is influenced by latitude and elevation
  // The temperature at the equator is the base temperature
  // Range of temperature is shorter at the equator and poles, and longer at the mid-latitudes

  const midTemperature = temperatureAtEquator - (10 * Math.abs(latitude)) / 20;

  // Temperature should be modified by elevation such that the temperature at the highest elevation is 0 degrees Celsius
  const elevationTemperature = midTemperature * (1 - elevation);

  // Temperature range variance is a bell curve, with the lowest variance at the equator and poles, and the highest variance at the mid-latitudes
  const inner = Math.abs(latitude) - 45;
  const power = Math.pow(inner, 2);
  const fraction = 1 / 2025;
  const temperatureRangeVariance = -1 * fraction * power + 1;
  const temperatureRangeStrength = 10; // the maximum variance is 10 degrees Celsius

  const temperatureMin = elevationTemperature - temperatureRangeVariance * temperatureRangeStrength;
  const temperatureMax = elevationTemperature + temperatureRangeVariance * temperatureRangeStrength;

  return [temperatureMin, temperatureMax];
}

function getWind(
  latitude: number,
  water: number[],
  terrainTilt: number[],
  current: number[],
): number[] {
  // Wind is a 3D vector representing the direction and strength of the wind
  // The wind direction is influenced by latitude, water distance, and terrain tilt
  // The wind strength is influenced by water distance, terrain tilt, and water current
  // We don't care about the Z-axis, so we only calculate the X and Y axes
  // X represents the east-west direction, Y represents the north-south direction

  const latitudeInfluence = 2 * (Math.abs(latitude) / 90) - 1; // -1 to 1, 1 being the equator, -1 being the poles

  const wind = [0, 0, 0];

  wind[0] = latitudeInfluence;

  // The water vector, unlike the terrain tilt, is a direction vector and is unbounded
  // We need to normalize the water vector to get a distance of 0-1 and a direction of -1 to 1
  const waterDistance = Math.sqrt(Math.pow(water[0], 2) + Math.pow(water[1], 2));
  let waterDirection = [0, 0];
  if (waterDistance > 0) {
    waterDirection = [water[0] / waterDistance, water[1] / waterDistance];
  }

  // If water distance is 0, the wind has the strongest influence
  const waterInfluenceStrength = 1 - MT.clamp(waterDistance / 5, 0, 1);

  // Wind moves away from water, so increase wind direction opposite to the water direction
  wind[0] = MT.clamp(wind[0] + waterDirection[0] * waterInfluenceStrength, -1.0, 1.0);
  wind[1] = MT.clamp(wind[1] + waterDirection[1] * waterInfluenceStrength, -1.0, 1.0);

  const terrainInfluenceStrength = 1.0;

  // Wind moves away from uphill, so increase wind direction opposite to the terrain tilt
  wind[0] = MT.clamp(wind[0] - terrainTilt[0] * terrainInfluenceStrength, -1.0, 1.0);
  wind[1] = MT.clamp(wind[1] - terrainTilt[1] * terrainInfluenceStrength, -1.0, 1.0);

  // Water current strengthens the wind in the same direction
  wind[0] = MT.clamp(wind[0] + current[0], -1.0, 1.0);
  wind[1] = MT.clamp(wind[1] + current[1], -1.0, 1.0);

  return wind;
}
