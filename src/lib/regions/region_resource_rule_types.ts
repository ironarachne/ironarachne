import type { GeologicalResourceDefinition, Resource } from '$lib/resources';
import type { RegionEcologyCatalog } from './region_ecology_rule_types';
import type { FactSource, ResourceFact } from './region_fact_types';
export type RegionResourceCatalog = {
  geology: readonly GeologicalResourceDefinition[];
  ecology: RegionEcologyCatalog;
  buildingMaterials: readonly Resource[];
};
export type ResourceCandidate = {
  fact: ResourceFact;
  sources: FactSource[];
  supportIds: Set<string>;
};
