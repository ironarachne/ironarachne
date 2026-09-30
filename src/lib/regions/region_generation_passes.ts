import { RNG } from '@ironarachne/rng';
import { classifyAltitude, classifyRelief, measureRegionTerrain } from '$lib/map';
import type Region from './region.js';
export { generateHabitatFacts } from './region_habitats.js';
export { generateHabitationFacts } from './region_settlement_roles.js';
export { generateNotableFacts } from './region_notables.js';
import type { RegionGenerationStage, RegionTerrainProfile } from './region_generation_types.js';
import type { FactReason, FactSource } from './region_fact_types.js';

/** Derive by name, never by drawing child seeds in pass order. */
export function createRegionStageRng(seed: string, stage: RegionGenerationStage): RNG {
  return new RNG(JSON.stringify(['region-passes-v1', seed, stage]));
}

const reason = (rule: string, sources: FactSource[]): FactReason => ({
  ruleId: `fantasy:region:${rule}:v1`,
  status: 'current',
  sources,
});
const factSource = (factId: string): FactSource => ({ kind: 'fact', factId });

/** Preserve the realized map, including an explicit explanation of the known #249 mismatch. */
export function recordPhysicalFacts(region: Region, requested: RegionTerrainProfile): void {
  const land = region.map.nodes.filter((node) => !node.isOcean && !node.isWater);
  if (land.length === 0) throw new Error('Region geography has no land for habitation.');
  const metrics = measureRegionTerrain(region.map);
  const altitude = classifyAltitude(metrics.medianElevation);
  const relief = classifyRelief(metrics.reliefSpread);
  const matches =
    altitude === requested.altitude &&
    relief === requested.relief &&
    (requested.relief !== 'flat' ||
      metrics.mountainFraction + metrics.highMountainFraction === 0) &&
    (requested.relief !== 'mountainous' ||
      metrics.mountainFraction + metrics.highMountainFraction >= 0.15);
  region.facts!.areas.push({
    id: 'area:land',
    name: 'Regional land',
    origin: 'generated',
    description: matches
      ? `The realized land is ${relief} and ${altitude}-altitude.`
      : `The requested ${requested.relief}, ${requested.altitude}-altitude profile was not achieved by the map. The realized land is ${relief} and ${altitude}-altitude; downstream facts use the saved map.`,
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

/** Freshwater is asserted only where the saved graph contains a river. */
export function generateResourceFacts(region: Region, rng: RNG): void {
  const candidates = region.map.edges.filter(
    (edge) => edge.river > 0 && region.facts!.areas[0].mapNodeIds.includes(edge.d0),
  );
  if (candidates.length === 0) return;
  const edge = rng.item(candidates);
  const area = region.facts!.areas[0];
  const habitats = region.facts!.habitats.filter((habitat) =>
    habitat.anchor?.nodeIds.includes(edge.d0),
  );
  region.facts!.resources.push({
    id: 'resource:freshwater',
    kind: 'freshwater',
    name: 'River water',
    description: 'A river on the saved map provides a freshwater source.',
    origin: 'generated',
    areaIds: [area.id],
    habitatIds: habitats.map((habitat) => habitat.id),
    anchor: { nodeIds: [edge.d0], edgeIds: [edge.id] },
    reason: reason('river-water', [
      factSource(area.id),
      ...habitats.map((habitat) => factSource(habitat.id)),
      { kind: 'map-edge', edgeId: edge.id, property: 'river', observedValue: String(edge.river) },
    ]),
  });
}

/** Keep existing prose until #333 adds causal overview rendering. */
export function presentRegion(region: Region, _rng: RNG): void {
  region.description = region.environment.description;
}
