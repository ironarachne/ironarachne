export type { default as Region } from './region';
export type { default as RegionGeneratorConfig } from './region_generator_config';
export * from './regions';
export * from './settlement_tiles';
export * from './terrain_tiles';

export * as Regions from './regions';

export * from './region_artifact_kind';
export * from './region_editing';
export * from './region_presentation';
export * from './region_rehydrate';
export * from './region_roll';
export * from './region_snapshot';
export * from './region_fact_types';
export * from './region_facts';
export * from './region_overview';

export * from './region_ecology_types';
export { generateEcologyInhabitants } from './region_ecology';
export type { RegionEcologyCatalog } from './region_ecology_rule_types';
export { generateEcologyRelationships } from './region_ecology_relationships';

export type * from './region_resource_types';
export { generateGeologyFacts } from './region_geology';
export { generateResourceFacts, isUsableRegionResource } from './region_resources';
export type { RegionResourceCatalog } from './region_resource_rule_types';
export * from './region_resource_editing';

export type * from './region_processing_types';
export { generateProcessingFacts } from './region_processing';
export { resolveProcessingChain } from './region_processing_chain';
export type * from './region_livelihood_types';
export { generateLivelihoodFacts } from './region_livelihoods';
export {
  settlementDailyLifeContext,
  describeSettlementDailyLife,
} from './region_livelihood_presentation';
