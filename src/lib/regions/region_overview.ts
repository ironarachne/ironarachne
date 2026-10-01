import { isUsableRegionResource } from './region_resources';
import type { RNG } from '@ironarachne/rng';
import { classifyAltitude, classifyRelief, measureRegionTerrain } from '$lib/map';
import type Region from './region.js';
import type { FactBase, SettlementRoleFact } from './region_fact_types.js';

function usable(fact: FactBase): boolean {
  return fact.reason?.status !== 'stale';
}

function geography(region: Region, rng: RNG): string {
  const land = region.map.nodes.filter((node) => !node.isOcean && !node.isWater);
  if (land.length === 0) return '';
  const metrics = measureRegionTerrain(region.map);
  const terrain = `${classifyRelief(metrics.reliefSpread)}, ${classifyAltitude(metrics.medianElevation)}-altitude land`;
  const habitats = (region.facts?.habitats ?? [])
    .filter((fact) => usable(fact) && fact.name.trim())
    .sort((a, b) => (b.anchor?.nodeIds.length ?? 0) - (a.anchor?.nodeIds.length ?? 0));
  const ecology = habitats
    .slice(0, 2)
    .map((fact) => fact.name.toLowerCase())
    .join(' and ');
  return rng.item([
    `${region.name} is ${terrain}${ecology ? `, characterized by ${ecology}` : ''}.`,
    `${region.name} stretches across ${terrain}${ecology ? `, with ${ecology} shaping its habitats` : ''}.`,
  ]);
}

function settlementName(region: Region, role: SettlementRoleFact): string | undefined {
  const target = role.settlement;
  if (target.kind !== 'embedded') return undefined;
  const index = region.settlementIds?.indexOf(target.settlementId) ?? -1;
  return region.settlements[index]?.name.trim() || undefined;
}

/** Each clause paraphrases an existing causal site rule; it adds no economic simulation. */
function siteClause(role: SettlementRoleFact): string | undefined {
  switch (role.reason?.ruleId) {
    case 'fantasy:region:river-crossing:v1':
      return 'stands where a road crosses a river, bringing overland travelers to the water';
    case 'fantasy:region:coastal-port-site:v1':
      return 'adjoins the ocean, offering access for coastal trade';
    case 'fantasy:region:agricultural-site:v1':
      return 'has low grassland with moderate warmth and moisture, supporting nearby farming';
    case 'fantasy:region:river-settlement:v1':
      return 'borders a river that provides local freshwater';
    case 'fantasy:region:forest-settlement:v1':
      return 'lies in forest, giving its inhabitants access to woodland resources';
    default:
      return undefined;
  }
}

function habitation(region: Region, rng: RNG): string {
  const candidates = (region.facts?.settlementRoles ?? []).filter(
    (role) => usable(role) && settlementName(region, role) && siteClause(role),
  );
  if (candidates.length === 0) return '';
  const role = rng.item(candidates);
  return `${settlementName(region, role)} ${siteClause(role)}.`;
}

function roadConnection(region: Region, rng: RNG): string {
  const roads = (region.facts?.routes ?? []).filter(
    (route) => usable(route) && route.kind === 'road',
  );
  const connections = roads.flatMap((road) => {
    const names = road.endpoints.map((endpoint) => {
      if (endpoint.kind !== 'settlement' || endpoint.settlement.kind !== 'embedded') return '';
      const index = region.settlementIds?.indexOf(endpoint.settlement.settlementId) ?? -1;
      return region.settlements[index]?.name.trim() ?? '';
    });
    return names.every(Boolean) ? [`A road links ${names[0]} and ${names[1]}.`] : [];
  });
  return connections.length ? rng.item(connections) : '';
}

function resource(region: Region, rng: RNG): string {
  const resources = (region.facts?.resources ?? []).filter(
    (fact) =>
      usable(fact) && isUsableRegionResource(fact) && fact.name.trim() && fact.description.trim(),
  );
  if (resources.length === 0) return '';
  const fact = rng.item(resources);
  if (fact.origin === 'generated' && fact.reason?.ruleId === 'fantasy:region:river-water:v1')
    return 'A river provides a freshwater source.';
  return `${fact.name}: ${fact.description.trim()}`;
}

function hazard(region: Region, rng: RNG): string {
  const hazards = (region.facts?.notables ?? []).filter(
    (fact) => usable(fact) && fact.kind === 'hazard' && fact.description.trim(),
  );
  if (hazards.length === 0) return '';
  // Hooks belong in the notable section; the overview retains its location and causal explanation.
  return rng.item(hazards).description.split(' Hook:')[0].trim();
}

/** Called only by generation, never while opening or exporting a saved artifact. */
export function generateRegionOverview(region: Region, rng: RNG): string {
  return [
    geography(region, rng),
    habitation(region, rng),
    resource(region, rng),
    roadConnection(region, rng),
    hazard(region, rng),
  ]
    .filter(Boolean)
    .join(' ');
}
