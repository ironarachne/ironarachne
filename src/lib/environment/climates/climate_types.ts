import type { RNG } from '@ironarachne/rng';

export type Season = {
  name: string;
  startDay: number; // 1-365
  endDay: number; // 1-365
  temperatureAdjustment: number;
  humidityAdjustment: number;
};

export type ClimateType = {
  name: string;
  precipitationMax: number;
  precipitationMin: number;
  temperatureMax: number;
  temperatureMin: number;
  humidityMax: number;
  humidityMin: number;
  latitudeMin: number;
  latitudeMax: number;
};

export type ClimateGeneratorConfig = {
  elevation: number; // -1.0-1.0, 0 being sea level, -1 being the lowest possible elevation, 1 being the highest
  latitude: number; // -90-90, 0 being the equator, -90 being the south pole, 90 being the north pole
  longitude: number; // -180-180, 0 being the prime meridian, -180 being the international date line
  waterDirection: number[]; // vector representing the direction and distance to the nearest water
  current: number[]; // vector representing the direction of the water current
  temperatureAtEquator: number; // the average temperature at sea level at the equator, in degrees Celsius
  terrainNormalVector: number[]; // the "tilt" of the terrain plane
  rng: RNG;
};

export type Climate = {
  name: string;
  description: string;
  cloudCover: number; // 0-1, 0 being no clouds, 1 being completely overcast
  wind: number[]; // the wind direction and strength as a 3D vector; [0, 0, 0] is no wind
  temperature: number; // the average temperature in celsius
  temperatureMin: number; // the base temperature at night in celsius
  temperatureMax: number; // the base temperature at midday in celsius
  precipitationAmount: number; // 0-1, 0 being no precipitation, 1 being the maximum possible precipitation
  precipitationFrequency: number; // 0-1, 0 being no precipitation, 1 being constant precipitation
  humidity: number; // 0-1, 0 being no humidity, 1 being maximum humidity
  seasons: Season[];
};
