import type { BiologicalHabitatPatch } from '$lib/environment';
import type Region from './region';
import type { EcologyPatch } from './region_ecology_rule_types';
import type { WaterSourceRef } from './region_raw_source_types';

/** Explicit water witnesses at a land patch, kept distinct from climate suitability. */
export function biologicalWaterSources(
  region: Pick<Region, 'map'>,
  nodeId: number,
): WaterSourceRef[] {
  const node = region.map.nodes.find((entry) => entry.id === nodeId);
  if (!node || node.isWater || node.isOcean) return [];
  return [
    ...[...region.map.edges]
      .sort((a, b) => a.id - b.id)
      .filter((edge) => edge.river > 0 && (edge.d0 === nodeId || edge.d1 === nodeId))
      .map((edge) => ({ kind: 'river' as const, edgeId: edge.id })),
    ...[...region.map.nodes]
      .sort((a, b) => a.id - b.id)
      .filter((entry) => node.neighbors.includes(entry.id) && (entry.isOcean || entry.isWater))
      .map((entry) => ({
        kind: entry.isOcean ? ('ocean' as const) : ('lake' as const),
        nodeId: entry.id,
      })),
  ];
}
export function biologicalPatch(
  region: Pick<Region, 'map'>,
  patch: EcologyPatch,
): BiologicalHabitatPatch {
  const water = biologicalWaterSources(region, patch.node.id);
  return {
    environments: patch.environments,
    temperature: patch.node.temperature,
    moisture: patch.node.moisture,
    landform: patch.landform,
    water: [
      'none',
      ...water.flatMap((source): BiologicalHabitatPatch['water'] =>
        source.kind === 'river'
          ? ['freshwater-bank']
          : source.kind === 'lake'
            ? ['freshwater-shore']
            : patch.node.isCoast
              ? ['coastal-margin']
              : [],
      ),
    ],
  };
}
