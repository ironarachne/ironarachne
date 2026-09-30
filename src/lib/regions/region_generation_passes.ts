import { RNG } from '@ironarachne/rng';
import { classifyAltitude, classifyRelief, measureRegionTerrain, Suitability } from '$lib/map';
import type Region from './region.js';
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

/** Coarse biome-backed habitats; spatial subdivisions are the responsibility of #330. */
export function generateHabitatFacts(region: Region, _rng: RNG): void {
  const area = region.facts!.areas[0];
  const nodes = region.map.nodes.filter((node) => area.mapNodeIds.includes(node.id));
  const biomes = [
    ...new Set(nodes.map((node) => node.biomeId).filter((id) => id !== undefined)),
  ].sort();
  for (const [index, biome] of biomes.entries()) {
    const matching = nodes.filter((node) => node.biomeId === biome);
    region.facts!.habitats.push({
      id: `habitat:${index + 1}`,
      name: biome,
      description: `The saved map supports ${biome} habitat.`,
      origin: 'generated',
      areaIds: [area.id],
      anchor: { nodeIds: matching.map((node) => node.id), edgeIds: [] },
      reason: reason('biome-habitat', [
        factSource(area.id),
        ...matching.map(
          (node): FactSource => ({
            kind: 'map-node',
            nodeId: node.id,
            property: 'biomeId',
            observedValue: biome,
          }),
        ),
      ]),
    });
  }
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

/** Record placement evidence without claiming port/crossing roles ahead of #331. */
export function generateHabitationFacts(region: Region, _rng: RNG): void {
  for (const [index, settlement] of region.settlements.entries()) {
    const node = region.map.nodes.find((node) => node.id === settlement.mapNodeId);
    if (node === undefined || node.isOcean || node.isWater)
      throw new Error('Settlement has no valid land placement.');
    const fallback = Suitability.standardRules.flatTerrain()(node, region.map) === 0;
    const habitats = region.facts!.habitats.filter((habitat) =>
      habitat.anchor?.nodeIds.includes(node.id),
    );
    const resources = region.facts!.resources.filter((resource) =>
      resource.anchor?.nodeIds.includes(node.id),
    );
    region.facts!.settlementRoles.push({
      id: `role:${index + 1}`,
      name: 'Land settlement',
      origin: 'generated',
      description: fallback
        ? 'No preferred site remained for this settlement; the placement fallback selected dry land despite its unsuitable elevation.'
        : 'Selected from dry-land sites ranked by freshwater access, elevation and temperature.',
      settlement: { kind: 'embedded', settlementId: region.settlementIds![index] },
      areaIds: region
        .facts!.areas.filter((area) => area.mapNodeIds.includes(node.id))
        .map((area) => area.id),
      anchor: { nodeIds: [node.id], edgeIds: [] },
      reason: reason(fallback ? 'land-placement-fallback' : 'land-placement', [
        ...habitats.map((habitat) => factSource(habitat.id)),
        ...resources.map((resource) => factSource(resource.id)),
        { kind: 'map-node', nodeId: node.id, property: 'isOcean', observedValue: 'false' },
        { kind: 'map-node', nodeId: node.id, property: 'isWater', observedValue: 'false' },
        {
          kind: 'map-node',
          nodeId: node.id,
          property: 'elevation',
          observedValue: String(node.elevation),
        },
        {
          kind: 'map-node',
          nodeId: node.id,
          property: 'temperature',
          observedValue: String(node.temperature),
        },
      ]),
    });
  }
}

/** A grounded river landmark; richer notable rules follow in #332. */
export function generateNotableFacts(region: Region, _rng: RNG): void {
  const resource = region.facts!.resources[0];
  if (resource === undefined) return;
  region.facts!.notables.push({
    id: 'landmark:river',
    kind: 'landmark',
    name: 'River reach',
    origin: 'generated',
    description: 'This river reach is the recorded freshwater source.',
    areaIds: [...resource.areaIds],
    anchor: structuredClone(resource.anchor),
    reason: reason('river-landmark', [factSource(resource.id)]),
  });
}

/** Keep existing prose until #333 adds causal overview rendering. */
export function presentRegion(region: Region, _rng: RNG): void {
  region.description = region.environment.description;
}
