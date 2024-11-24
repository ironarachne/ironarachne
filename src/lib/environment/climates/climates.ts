import * as MT from "$lib/math_translation";
import random from "random";
import type Climate from "./climate.js";
import type ClimateGeneratorConfig from "./generator_config";
import type ClimateType from "./climate_type.js";
import type Season from "./season.js";

export function describe(climate: Climate): string {
  const description = `The climate here is ${climate.name}, with ${climate.seasons.length} seasons.`;

  return description;
}

export function generate(config: ClimateGeneratorConfig): Climate {
  const temperatureRange = getTemperatureRange(config.elevation, config.latitude, config.temperatureAtEquator);
  const temperatureMin = temperatureRange[0];
  const temperatureMax = temperatureRange[1];
  const wind = getWind(config.latitude, config.waterDirection, config.terrainNormalVector, config.current);

  const precipitationAmount = getPrecipitation(temperatureMax, wind, config.terrainNormalVector, config.waterDirection);
  const precipitationFrequency = MT.clamp(precipitationAmount * random.float(0.25, 1.25), 0, 1);

  const humidity = getHumidity(precipitationAmount, temperatureMax);

  const seasons = getSeasons(config.latitude, temperatureMax, precipitationAmount);

  const cloudCover = getCloudCover(config.latitude, temperatureMin + ((temperatureMax - temperatureMin) / 2), wind);

  let result: Climate = {
    name: "unknown",
    description: "",
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

  result.name = generateClimateName(result, config.latitude);

  return result;
}

export function generateClimateName(climate: Climate, latitude: number): string {
  let name = "";

  // These are divided into five main categories: tropical, dry, temperate, continental, and polar
  // We determine the category based on the temperature and precipitation of the climate

  // Use a generational approach to determine the climate name, scoring each category based on the climate's temperature and precipitation
  // The category with the highest score is the one we choose
  const climateTypes = getClimateTypes();
  let scores = new Map<string, number>();

  console.debug(`Precipitation: ${climate.precipitationAmount}, Temperature: ${climate.temperature}, Night Temp.: ${climate.temperatureMin}, Daytime Temp.: ${climate.temperatureMax}`);

  for (let type of climateTypes) {
    let score = 0;

    if (climate.temperature >= type.temperatureMin) {
      score += 1;
    } else if (climate.temperature <= type.temperatureMin) {
      score -= 1;
    }

    if (climate.temperature <= type.temperatureMax) {
      score += 1;
    } else if (climate.temperature >= type.temperatureMax) {
      score -= 1;
    }

    if (climate.precipitationAmount >= type.precipitationMin) {
      score += 1;
    } else if (climate.precipitationAmount <= type.precipitationMax) {
      score -= 1;
    }

    if (climate.precipitationAmount <= type.precipitationMax) {
      score += 1;
    } else if (climate.precipitationAmount >= type.precipitationMin) {
      score -= 1;
    }

    if (climate.humidity >= type.humidityMin) {
      score += 1;
    } else if (climate.humidity < type.humidityMin) {
      score -= 1;
    }

    if (climate.humidity <= type.humidityMax) {
      score += 1;
    } else if (climate.humidity > type.humidityMax) {
      score -= 1;
    }

    if (latitude <= type.latitudeMax) {
      score += 1;
    } else if (latitude > type.latitudeMax) {
      score -= 1;
    }

    if (latitude >= type.latitudeMin) {
      score += 1;
    } else if (latitude < type.latitudeMin) {
      score -= 1;
    }

    scores.set(type.name, score);
  }

  let highestScore = 0;
  let highestScoreName = "";

  for (let [key, value] of scores) {
    console.debug(`Climate type: ${key}, score: ${value}`);
    if (value > highestScore) {
      highestScore = value;
      highestScoreName = key;
    }
  }

  name = highestScoreName;

  return name;
}

export function getClimateTypeByName(name: string): ClimateType {
  const types = getClimateTypes();
  let result = types.find((type) => type.name === name);

  if (result === undefined) {
    console.debug(`Climate type ${name} not found, defaulting to ${types[0].name}`);
    result = types[0];
  }

  return result;
}

export function getClimateTypes(): ClimateType[] {
  return [
    {
      name: "tropical",
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
      name: "arid",
      precipitationMax: 0.25,
      precipitationMin: 0,
      temperatureMax: 40,
      temperatureMin: -10,
      humidityMax: 0.25,
      humidityMin: 0.0,
      latitudeMax: 40,
      latitudeMin: 25
    },
    {
      name: "temperate",
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
      name: "continental",
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
      name: "polar",
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

export function getDefaultConfig(): ClimateGeneratorConfig {
  return {
    elevation: 0.5,
    latitude: 0,
    longitude: 0,
    waterDirection: [0, 0, 0], // direction and distance to nearest body of water
    current: [0, 0, 0], // current is not present
    temperatureAtEquator: 35,
    terrainNormalVector: [0, 0, 0], // flat terrain
  };
}

function getCloudCover(latitude: number, temperature: number, wind: number[]): number {
  // Cloud cover is influenced by latitude, temperature, and wind
  // Generally, cloud cover should be close to 0.65, with up to a 0.3 variance

  let cloudCover = 0.65;

  // Cloud cover is higher away from the equator
  cloudCover += (0.2 * (1 - (Math.abs(latitude) / 90))); // 90 degrees is the maximum latitude

  // Cloud cover is higher at lower temperatures
  cloudCover = cloudCover + (0.1 * (1 - (temperature / 40))); // 40 degrees Celsius is the maximum temperature

  // Cloud cover is lower with high wind speeds
  const windSpeed = Math.sqrt(Math.pow(wind[0], 2) + Math.pow(wind[1], 2));

  cloudCover = cloudCover - (0.2 * windSpeed); // normalize wind speed influence

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

function getPrecipitation(temperature: number, wind: number[], terrainTilt: number[], waterDirection: number[]): number {
  // Precipitation is influenced by temperature, wind, and water distance
  // The amount of precipitation is higher at higher temperatures, higher wind speeds, and closer to water
  // Downslope motion of wind reduces precipitation, while upslope motion increases precipitation

  let precipitation = 0;

  // Precipitation is higher at higher temperatures
  precipitation += temperature / 40; // 40 degrees Celsius is the maximum temperature

  // Precipitation is higher if terrain tilt matches wind direction
  const dotProduct = wind[0] * terrainTilt[0] + wind[1] * terrainTilt[1];
  precipitation += dotProduct > 0 ? dotProduct : -dotProduct * 0.5; // reduce precipitation if wind is not aligned with terrain tilt

  // Precipitation is higher at higher wind speeds
  const windSpeed = Math.sqrt(Math.pow(wind[0], 2) + Math.pow(wind[1], 2));
  precipitation += windSpeed / 10; // normalize wind speed influence

  const waterDistance = MT.clamp(Math.sqrt(Math.pow(waterDirection[0], 2) + Math.pow(waterDirection[1], 2)) / 5, 0, 1);

  // Precipitation is higher closer to water
  precipitation += 1 - waterDistance;
  
  // TODO: precipitation amount tends to be too high, need to figure out why

  return MT.clamp(precipitation, 0, 1);
}

function getSeasons(latitude: number, temperature: number, precipitation: number): Season[] {
  // Seasons are influenced by latitude, temperature, and precipitation
  // The number of seasons is determined by the temperature and precipitation
  // The length of each season is determined by the temperature and precipitation

  let seasons: Season[] = [];

  // if latitude is between 23.5 and -23.5, there are two seasons; otherwise, there are four

  if (latitude < 23.5 && latitude > -23.5) {
    seasons = [
      {
        name: "dry",
        startDay: 200,
        endDay: 50,
        temperatureAdjustment: 0.1,
        humidityAdjustment: 0,
      },
      {
        name: "wet",
        startDay: 51,
        endDay: 199,
        temperatureAdjustment: 0,
        humidityAdjustment: 0.2,
      },
    ];
  } else {
    seasons = [
      {
        name: "spring",
        startDay: 91,
        endDay: 181,
        temperatureAdjustment: 0,
        humidityAdjustment: 0.1,
      },
      {
        name: "summer",
        startDay: 182,
        endDay: 272,
        temperatureAdjustment: 0.1,
        humidityAdjustment: 0.1,
      },
      {
        name: "autumn",
        startDay: 273,
        endDay: 363,
        temperatureAdjustment: 0,
        humidityAdjustment: 0,
      },
      {
        name: "winter",
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

function getTemperatureRange(elevation: number, latitude: number, temperatureAtEquator: number): [number, number] {
  // Temperature is influenced by latitude and elevation
  // The temperature at the equator is the base temperature
  // Range of temperature is shorter at the equator and poles, and longer at the mid-latitudes

  const midTemperature = temperatureAtEquator - (10 * Math.abs(latitude) / 20);

  // Temperature should be modified by elevation such that the temperature at the highest elevation is 0 degrees Celsius
  const elevationTemperature = midTemperature * (1 - elevation);

  // Temperature range variance is a bell curve, with the lowest variance at the equator and poles, and the highest variance at the mid-latitudes
  const inner = Math.abs(latitude) - 45;
  const power = Math.pow(inner, 2);
  const fraction = 1/2025;
  const temperatureRangeVariance = (-1 * fraction * power) + 1;
  const temperatureRangeStrength = 10; // the maximum variance is 10 degrees Celsius
  
  const temperatureMin = elevationTemperature - (temperatureRangeVariance * temperatureRangeStrength);
  const temperatureMax = elevationTemperature + (temperatureRangeVariance * temperatureRangeStrength);

  return [temperatureMin, temperatureMax];
}

function getWind(latitude: number, water: number[], terrainTilt: number[], current: number[]): number[] {
  // Wind is a 3D vector representing the direction and strength of the wind
  // The wind direction is influenced by latitude, water distance, and terrain tilt
  // The wind strength is influenced by water distance, terrain tilt, and water current
  // We don't care about the Z-axis, so we only calculate the X and Y axes
  // X represents the east-west direction, Y represents the north-south direction

  const latitudeInfluence = 2 * (Math.abs(latitude) / 90) - 1; // -1 to 1, 1 being the equator, -1 being the poles

  let wind = [0, 0, 0];

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
  wind[0] = MT.clamp(wind[0] + (waterDirection[0] * waterInfluenceStrength), -1.0, 1.0);
  wind[1] = MT.clamp(wind[1] + (waterDirection[1] * waterInfluenceStrength), -1.0, 1.0);

  const terrainInfluenceStrength = 1.0;

  // Wind moves away from uphill, so increase wind direction opposite to the terrain tilt
  wind[0] = MT.clamp(wind[0] - (terrainTilt[0] * terrainInfluenceStrength), -1.0, 1.0);
  wind[1] = MT.clamp(wind[1] - (terrainTilt[1] * terrainInfluenceStrength), -1.0, 1.0);

  // Water current strengthens the wind in the same direction
  wind[0] = MT.clamp(wind[0] + current[0], -1.0, 1.0);
  wind[1] = MT.clamp(wind[1] + current[1], -1.0, 1.0);

  return wind;
}
