import { generateSettlementArchitecture } from '$lib/settlements';
import type Region from './region';
import {
  planRegionConstruction,
  constructionOperationSeed,
  hasDrawableResidentialArchitecture,
} from './region_construction';
export { regionArchitectureResources } from './region_architecture_resources';

/** Only explicit generation owns completion. Snapshot reads and evidence queries never add supply. */
export function generateRegionArchitecture(region: Region, seed: string): void {
  const plan = planRegionConstruction(region, seed);
  region.settlements = region.settlements.map((settlement, index) => {
    // Authored aquatic settlements remain unsupported; do not change their stored environment.
    if (settlement.environment.biome.isAquatic) return settlement;
    const entry = plan.settlements[index];
    const architecture = generateSettlementArchitecture(settlement, {
      seed: constructionOperationSeed(seed, entry.settlementId, entry.needsCompletion),
      resources: entry.effectiveResources,
    });
    if (!hasDrawableResidentialArchitecture(architecture))
      throw new Error(`Regional construction did not produce buildings for ${entry.settlementId}`);
    return { ...settlement, architecture };
  });
}
