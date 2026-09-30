import type { BiomeClassification } from '$lib/environment';
import type { Species } from '$lib/species';
import type { LandformClass, MapNode } from '$lib/map';
import type { FactSource } from './region_fact_types';
import type { EcologyCategory, EcologicalRole, InhabitantSource } from './region_ecology_types';

/** Injectable catalogs let sparse worlds use the same conservative selection rules. */
export type RegionEcologyCatalog = {
  species: readonly Species[];
  biomes: readonly BiomeClassification[];
};
export type EcologyRule = {
  label: string;
  category: EcologyCategory;
  roles: EcologicalRole[];
  environments: string[];
  temperature: [number, number];
  moisture: [number, number];
  landforms?: LandformClass[];
  water?: 'freshwater' | 'coast';
  description: string;
};
export type EcologyCandidate = {
  key: string;
  name: string;
  source: InhabitantSource;
  category: EcologyCategory;
  roles: EcologicalRole[];
  description: string;
  ruleId: string;
  sources: FactSource[];
};
export type EcologyPatch = {
  node: MapNode;
  biome: BiomeClassification;
  environments: string[];
  landform: LandformClass;
  waterSources: FactSource[];
};
