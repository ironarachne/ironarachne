export { generateSupplyFacts } from './region_supply';
export { generateProcessingFacts } from './region_processing';
export { generateLivelihoodFacts } from './region_livelihoods';
export { generateGeologyFacts } from './region_geology';
export { generateResourceFacts } from './region_resources';
import { RNG } from '@ironarachne/rng';
import { classifyAltitude, classifyRelief, measureRegionTerrain } from '$lib/map';
import type Region from './region.js';
export { generateEcologyRelationships } from './region_ecology_relationships.js';
export { generateEcologyInhabitants } from './region_ecology.js';
export { generateLandscapeNames } from './region_landscape_names';
export { generateHabitatFacts } from './region_habitats.js';
export { generateHabitationFacts } from './region_settlement_roles.js';
export { generateNotableFacts } from './region_notables.js';
import type { RegionGenerationStage, RegionTerrainProfile } from './region_generation_types.js';
import type { FactReason, FactSource } from './region_fact_types.js';
import { generateRegionOverview } from './region_overview.js';
import { regionalLandNarrative } from './region_narrative';

/** Derive by name, never by drawing child seeds in pass order. */
export function createRegionStageRng(seed: string, stage: RegionGenerationStage): RNG {
  return new RNG(JSON.stringify(['region-passes-v1', seed, stage]));
}

const reason = (rule: string, sources: FactSource[]): FactReason => ({
  ruleId: `fantasy:region:${rule}:v1`,
  status: 'current',
  sources,
});

/** Describe the realized land in prose; requested settings are not part of the narrative. */
export function recordPhysicalFacts(
  region: Region,
  _requested: RegionTerrainProfile,
  rng: RNG,
): void {
  const land = region.map.nodes.filter((node) => !node.isOcean && !node.isWater);
  if (land.length === 0) throw new Error('Region geography has no land for habitation.');
  const metrics = measureRegionTerrain(region.map);
  const altitude = classifyAltitude(metrics.medianElevation);
  const relief = classifyRelief(metrics.reliefSpread);
  region.facts!.areas.push({
    id: 'area:land',
    name: 'Regional land',
    origin: 'generated',
    description: regionalLandNarrative(relief, altitude, rng),
    mapNodeIds: land.map((node) => node.id),
    reason: reason(
      'realized-land',
      land.map((node) => ({
        kind: 'map-node',
        nodeId: node.id,
        property: 'elevation',
        observedValue: String(node.elevation),
      })),
    ),
  });
}

/** Compose the overview after all supporting facts have been recorded. */
export function presentRegion(region: Region, rng: RNG): void {
  region.description = generateRegionOverview(region, rng);
}
