import type { BiologicalHabitatRule, BiologicalOccurrenceForm } from '$lib/environment';
import type { Resource } from './resource_types';
import type { GeologicalResourceDefinition } from './geological_resource_types';

export type RawResourceUse =
  | 'food'
  | 'textile'
  | 'construction'
  | 'fuel'
  | 'dye'
  | 'pigment'
  | 'tanning'
  | 'medicinal'
  | 'industrial'
  | 'ornament';
export type FoodPreparation = 'ordinary' | 'recipe-required';
export type FoodSuitability =
  | { kind: 'not-food' }
  | { kind: 'unknown' }
  | { kind: 'food'; preparation: FoodPreparation; productKeys: string[] };
export type FoodProductUse = 'ingredient' | 'provision';
export type ProductFoodPolicy =
  | { kind: 'not-food' }
  | { kind: 'unknown' }
  | { kind: 'food'; use: FoodProductUse; reviewRuleId: string; requirements: string[] };
export type FoodInputUse = 'ingredient' | 'process-water' | 'support';
export type ImportedFoodDescriptor = {
  kind: 'raw' | 'product';
  catalogKey: string;
  name: string;
  food: FoodSuitability;
  use: FoodProductUse;
  reviewRuleId: string;
  requirements: string[];
};
export type ProducerRef =
  | { kind: 'plant'; plantId: string }
  | { kind: 'species'; speciesName: string };
export type ManagedProductionMode = 'cultivation' | 'husbandry' | 'apiary';
export type ProductionMode = 'wild' | ManagedProductionMode;
export type ManagedSupportRequirement =
  | 'cultivable-ground'
  | 'freshwater'
  | 'grazing'
  | 'flowering-forage';
export type HarvestMethod =
  | 'gathering'
  | 'cutting'
  | 'hunting'
  | 'fishing'
  | 'shellfish-collection'
  | 'shearing'
  | 'milking'
  | 'egg-collection'
  | 'colony-harvest'
  | 'slaughtering'
  | 'quarrying'
  | 'mining'
  | 'drilling';
export type RawResourceDefinition = {
  id: string;
  resource: Resource;
  uses: RawResourceUse[];
  food: FoodSuitability;
};
export type RawResourceSnapshot = {
  id: string;
  name: string;
  majorType: string;
  minorType: string;
  uses: RawResourceUse[];
  food: FoodSuitability;
};
export type BiologicalSourceDefinition = {
  id: string;
  rawResourceId: string;
  producer: ProducerRef;
  mode: ProductionMode;
  wildOccurrenceForm: BiologicalOccurrenceForm | null;
  part: string;
  method: HarvestMethod;
  requirements: string[];
  habitats: BiologicalHabitatRule[];
  reviewRefs: string[];
  reviewNote: string;
};
export type ManagedProductionRule = {
  id: string;
  producer: ProducerRef;
  mode: ManagedProductionMode;
  habitats: BiologicalHabitatRule[];
  soilTypes: string[];
  supportRequirements: ManagedSupportRequirement[];
  reviewRefs: string[];
  reviewNote: string;
};
export type GeologicalSourceDefinition = {
  id: string;
  rawResourceId: string;
  occurrence: GeologicalResourceDefinition;
  requirements: string[];
  reviewRefs: string[];
  reviewNote: string;
};

/** Compact authoring row; expanded into public definitions without parsing names or parts. */
export type BiologicalSourceSpec = [
  rawId: string,
  producerKind: ProducerRef['kind'],
  producerId: string,
  name: string,
  part: string,
  habitatProfile: string,
  mode: ProductionMode,
  method: HarvestMethod,
  majorType: string,
  minorType: string,
  uses: RawResourceUse[],
  foodProductKeys: string[] | null,
  reviewRefs: string[],
];
