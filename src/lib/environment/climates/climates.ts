import random from "random";
import type Climate from "./climate.js";
import ContinentalClimate from "./continental.js";
import DryClimate from "./dry.js";
import type ClimateGeneratorConfig from "./generator_config.js";
import PolarClimate from "./polar.js";
import TemperateClimate from "./temperate.js";
import TropicalClimate from "./tropical.js";

export function all(): Climate[] {
  return [
    TropicalClimate,
    DryClimate,
    TemperateClimate,
    ContinentalClimate,
    PolarClimate,
  ];
}

export function describe(climate: Climate): string {
  const description = `The climate here is ${climate.name}, with ${climate.seasons.length} seasons.`;

  return description;
}

export function generate(config: ClimateGeneratorConfig): Climate {
  const temperatureRange = getTemperatureRange(config.elevation, config.latitude, config.temperatureAtEquator);
  const temperatureMin = temperatureRange[0];
  const temperatureMax = temperatureRange[1];

  // generate wind direction based on latitude, water direction, and terrain tilt
  const windDirection = getWindDirection(config.latitude, config.waterDirection, config.terrainNormalVector);

  // generate wind strength based on wind direction, water direction, and water current
  const windStrength = getWindStrength(windDirection, config.waterDirection, config.currentDirection);
}

export function getDefaultConfig(): ClimateGeneratorConfig {
  return {
    elevation: 0.5,
    latitude: 0,
    longitude: 0,
    waterDistance: 0,
    waterDirection: [0, 0, 0],
    currentDirection: [0, 0, 0],
    temperatureAtEquator: 30,
    terrainNormalVector: [0, 0, 0],
  };
}

function getTemperatureRange(elevation: number, latitude: number, temperatureAtEquator: number): [number, number] {
  const baseTemperature = temperatureAtEquator - 10 * Math.abs(latitude) / 90;
  const elevationTemperature = 10 * elevation;
  const temperatureMin = baseTemperature - elevationTemperature;
  const temperatureMax = baseTemperature + elevationTemperature;

  return [temperatureMin, temperatureMax];
}

function getWindDirection(latitude: number, waterDirection: number[], terrainNormalVector: number[]): number {
  // wind direction is influenced by latitude, water distance, and terrain tilt
  // at the equator, the wind is generally from the east
  // at the poles, the wind is generally from the west
  // the closer to water, the more the wind is influenced by the water
  // the more the terrain is tilted, the more the wind is influenced by the terrain
  // the wind direction is a number from 0 to 360, with 0 being north, 90 being east, 180 being south, and 270 being west
  // the wind direction should be calculated based on these factors
  // and should be a random number within a certain range

  const latitudeInfluence = Math.abs(latitude) / 90;
  const waterInfluence = waterDirection[2];
  const terrainInfluence = terrainNormalVector[2];

  let windDirection = random.float(0, 360);

  windDirection = windDirection + latitudeInfluence * 90;
  windDirection = windDirection + waterInfluence * 90;
  windDirection = windDirection + terrainInfluence * 90;

  return windDirection;
}

function getWindStrength(windDirection: number, waterDirection: number[], currentDirection: number[]): number {
  // wind strength is influenced by wind direction, water direction, and water current
  // the closer the wind is to the water direction, the stronger the wind
  // the closer the wind is to the water current, the stronger the wind
  // the wind strength is a number from 0 to 1, with 0 being no wind, and 1 being very strong wind
  // the wind strength should be calculated based on these factors
  // and should be a random number within a certain range

  const directionDifference = Math.abs(windDirection - waterDirection[2]);
  const currentDifference = Math.abs(windDirection - currentDirection[2]);

  let windStrength = random.float(0, 1);

  windStrength = windStrength + directionDifference / 360;
  windStrength = windStrength + currentDifference / 360;

  return windStrength;
}
