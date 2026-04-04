import type { RNG } from '@ironarachne/rng';

export type Biome = {
  name: string;
  temperature: number;
  altitude: number;
  humidity: number;
  isAquatic: boolean;
  descriptions: string[];
  features: string[];
};

export type BiomeClassification = {
  name: string;
  altitudeMax: number;
  altitudeMin: number;
  humidityMax: number;
  humidityMin: number;
  temperatureMax: number;
  temperatureMin: number;
  faunaTypes: string[]; // possible fauna types for this biome
  faunaDensity: number; // 0-1
  vegetationTypes: string[]; // possible vegetation types for this biome
  vegetationDensity: number; // 0-1
  waterFeatures: string[]; // possible water features for this biome
  waterFeatureDensity: number; // 0-1
  isAquatic: boolean;
};

export type BiomeGeneratorConfig = {
  altitude: number;
  temperatureMin: number;
  temperatureMax: number;
  humidityMin: number;
  humidityMax: number;
  isAquatic: boolean;
  rng: RNG;
};
