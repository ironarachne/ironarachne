export type * from './region_affiliation_types';
export type { default as Region } from './region';
export type * from './region_raw_source_types';
export type * from './region_food_types';
export * from './region_food';
export {
  buildRegionCreatureContext,
  describeRegionCreatureContext,
} from './region_creature_context';
export { regionMaterialSources, describeRegionMaterials } from './region_material_context';
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
export { ECOLOGY_SUMMARY_ID } from './region_ecology_narrative';
export { generateRegionIdentity, isRegionIdentityFact } from './region_identity';

export type * from './region_processing_types';
export { generateProcessingFacts } from './region_processing';
export { resolveProcessingChain } from './region_processing_chain';
export type * from './region_livelihood_types';
export { generateLivelihoodFacts } from './region_livelihoods';
export {
  settlementDailyLifeContext,
  describeSettlementDailyLife,
} from './region_livelihood_presentation';

export type * from './region_supply_types';
export { generateSupplyFacts } from './region_supply';
export { settlementSupplyContext, describeSettlementSupply } from './region_supply_presentation';

export { regionToUiDocument } from './region_ui_presentation';
export type * from './region_ui_presentation_types';

export { generateLandscapeNames } from './region_landscape_names';

export type * from './region_mountain_range_types';
export { generateMountainRangeFacts } from './region_mountain_ranges';

export type * from './region_dense_forest_types';
export { generateDenseForestFacts, generateDenseForestLandmark } from './region_dense_forests';

export type * from './region_assessment_types';
export { regionInspectionFacts, regionOverviewCurrent } from './region_narrative_evidence';

export { regionSourceQualifications } from './region_source_presentation';

export { generateManagedProduction, finalizeResourceInventory } from './region_managed_production';

export type * from './region_activity_types';
export { generateSettlementActivities } from './region_activities';
export { activityEvidenceCurrent } from './region_activity_support';
