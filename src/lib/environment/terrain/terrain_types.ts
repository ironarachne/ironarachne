import type { RNG } from '@ironarachne/rng';

export type GeologicalMakeup = {
  soilTypes: string[];
  rockTypes: string[];
};

export type TerrainGeneratorConfig = {
  elevationMin: number;
  elevationMax: number;
  reliefEnergyMin: number;
  reliefEnergyMax: number;
  normalVector: number[];
  erosionIterations: number;
  erosionStrength: number;
  rng: RNG;
};

export type Terrain = {
  elevationMin: number;
  elevationMax: number;
  reliefEnergy: number;
  normalVector: number[];
  landforms: string[];
  geologicalMakeup: GeologicalMakeup;
};
