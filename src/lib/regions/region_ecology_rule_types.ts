import type {
  BiomeClassification,
  PlantDefinition,
  BiologicalOccurrenceForm,
} from '$lib/environment';
import type { Species } from '$lib/species';
import type { LandformClass, MapNode } from '$lib/map';
import type { FactSource } from './region_fact_types';
import type { EcologyCategory, EcologicalRole, InhabitantSource } from './region_ecology_types';

/** Injectable catalogs let sparse worlds use the same conservative selection rules. */
export type RegionEcologyCatalog = {
  species: readonly Species[];
  biomes: readonly BiomeClassification[];
  plants?: readonly PlantDefinition[];
  reviewedSources?: boolean;
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
  occurrenceForm?: BiologicalOccurrenceForm;
  name: string;
  source: InhabitantSource;
  category: EcologyCategory;
  roles: EcologicalRole[];
  description: string;
  ruleId: string;
  sources: FactSource[];
  nodeSources: Map<number, FactSource[]>;
};
export type EcologyPatch = {
  node: MapNode;
  biome: BiomeClassification;
  environments: string[];
  landform: LandformClass;
  waterSources: FactSource[];
};
