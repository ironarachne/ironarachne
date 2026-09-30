import type { RNG } from '@ironarachne/rng';
import { classifyAltitude, type MapNode, type RegionMap } from '$lib/map';
import type Region from './region.js';
import type { FactReason, FactSource, MapNodeFactProperty } from './region_fact_types.js';

function reason(rule: string, sources: FactSource[]): FactReason {
  return { ruleId: `fantasy:region:${rule}:v1`, status: 'current', sources };
}

function observations(nodes: MapNode[]): FactSource[] {
  const properties: MapNodeFactProperty[] = [
    'biomeId',
    'elevation',
    'temperature',
    'moisture',
    'isWater',
    'isOcean',
    'isCoast',
  ];
  return nodes.flatMap((node) =>
    properties.map(
      (property): FactSource => ({
        kind: 'map-node',
        nodeId: node.id,
        property,
        observedValue: String(node[property]),
      }),
    ),
  );
}

/** Connected cells, with traversal and ties independent of map array order. */
function components(nodes: MapNode[]): MapNode[][] {
  const remaining = new Map(nodes.map((node) => [node.id, node]));
  const result: MapNode[][] = [];
  for (const node of nodes) {
    if (!remaining.has(node.id)) continue;
    const group = [node];
    remaining.delete(node.id);
    for (let index = 0; index < group.length; index++) {
      for (const id of [...group[index].neighbors].sort((a, b) => a - b)) {
        const neighbor = remaining.get(id);
        if (neighbor === undefined) continue;
        remaining.delete(id);
        group.push(neighbor);
      }
    }
    result.push(group.sort((a, b) => a.id - b.id));
  }
  return result.sort((a, b) => b.length - a.length || a[0].id - b[0].id);
}

function location(nodes: MapNode[], map: RegionMap): string {
  const x = nodes.reduce((sum, node) => sum + node.center.x, 0) / nodes.length / map.width;
  const y = nodes.reduce((sum, node) => sum + node.center.y, 0) / nodes.length / map.height;
  const vertical = y < 1 / 3 ? 'northern' : y > 2 / 3 ? 'southern' : '';
  const horizontal = x < 1 / 3 ? 'western' : x > 2 / 3 ? 'eastern' : '';
  return [vertical, horizontal].filter(Boolean).join(' ') || 'central';
}

function range(nodes: MapNode[], property: 'temperature' | 'moisture'): string {
  const values = nodes.map((node) => node[property]);
  return `${Math.min(...values).toFixed(1)} to ${Math.max(...values).toFixed(1)}`;
}

function physicalDescription(nodes: MapNode[], map: RegionMap): string {
  const elevations = nodes.map((node) => node.elevation).sort((a, b) => a - b);
  const altitude = classifyAltitude(elevations[Math.max(0, Math.ceil(elevations.length / 2) - 1)]);
  const rivers = riverEdges(nodes, map);
  const water = [
    nodes.some((node) => node.isCoast) ? 'coastal cells' : '',
    rivers.length > 0 ? 'river edges' : '',
  ].filter(Boolean);
  return `The mapped cells have ${altitude} median altitude, temperatures of ${range(nodes, 'temperature')} °C and moisture of ${range(nodes, 'moisture')} on the map's 0–1 scale.${water.length > 0 ? ` They include ${water.join(' and ')}.` : ''}`;
}

function riverEdges(nodes: MapNode[], map: RegionMap) {
  const ids = new Set(nodes.map((node) => node.id));
  return map.edges
    .filter(
      (edge) => edge.river > 0 && (ids.has(edge.d0) || (edge.d1 !== undefined && ids.has(edge.d1))),
    )
    .sort((a, b) => a.id - b.id);
}

/** Semantic groupings of the saved graph; no terrain changes or additional random draws. */
export function generateHabitatFacts(region: Pick<Region, 'map' | 'facts'>, _rng: RNG): void {
  const facts = region.facts!;
  const land = facts.areas.find((area) => area.id === 'area:land');
  if (land === undefined) throw new Error('Habitat generation requires the regional land fact.');
  const landIds = new Set(land.mapNodeIds);
  const nodes = region.map.nodes
    .filter((node) => landIds.has(node.id) && !node.isOcean && !node.isWater)
    .sort((a, b) => a.id - b.id);
  const biomes = [...new Set(nodes.flatMap((node) => (node.biomeId ? [node.biomeId] : [])))];
  const groups = biomes
    .map((biome) => ({ biome, nodes: nodes.filter((node) => node.biomeId === biome) }))
    .sort((a, b) => b.nodes.length - a.nodes.length || (a.biome < b.biome ? -1 : 1));
  const patches = groups.map((group) => components(group.nodes));
  // Reserve a zone for each of the four most prevalent habitats, then use remaining slots
  // for substantial disconnected patches. Minor habitats retain their complete footprints.
  const zones = patches.slice(0, 4).map((group) => group[0]);
  const extra = patches
    .flatMap((group) => group.slice(1))
    .sort((a, b) => b.length - a.length || a[0].id - b[0].id);
  zones.push(...extra.slice(0, 4 - zones.length));
  for (const patch of zones) {
    const rivers = riverEdges(patch, region.map);
    facts.areas.push({
      id: `area:habitat-zone:${patch[0].id}`,
      name: `${location(patch, region.map)} ${patch[0].biomeId} zone`,
      description: `A connected ${patch[0].biomeId} zone in the ${location(patch, region.map)} part of the map. ${physicalDescription(patch, region.map)}`,
      origin: 'generated',
      mapNodeIds: patch.map((node) => node.id),
      reason: reason('habitat-zone', [
        { kind: 'fact', factId: land.id },
        ...observations(patch),
        ...rivers.map(
          (edge): FactSource => ({
            kind: 'map-edge',
            edgeId: edge.id,
            property: 'river',
            observedValue: String(edge.river),
          }),
        ),
      ]),
    });
  }
  for (const [index, group] of groups.entries()) {
    const ids = new Set(group.nodes.map((node) => node.id));
    const areas = facts.areas.filter((area) => area.mapNodeIds.some((id) => ids.has(id)));
    const namedZones = areas.filter((area) => area.id !== land.id);
    facts.habitats.push({
      id: `habitat:biome:${encodeURIComponent(group.biome)}`,
      name: group.biome,
      description: `${index === 0 ? 'Dominant' : 'Secondary'} mapped habitat: ${group.biome}, covering ${group.nodes.length} of ${nodes.length} dry-land cells.${namedZones.length > 0 ? ` Major areas: ${namedZones.map((area) => area.name).join('; ')}.` : ` Its cells lie around the ${location(group.nodes, region.map)} part of the map; no major zone is selected for it.`} ${physicalDescription(group.nodes, region.map)}`,
      origin: 'generated',
      areaIds: areas.map((area) => area.id),
      anchor: {
        nodeIds: group.nodes.map((node) => node.id),
        edgeIds: riverEdges(group.nodes, region.map).map((edge) => edge.id),
      },
      reason: reason('spatial-biome-habitat', [
        ...areas.map((area): FactSource => ({ kind: 'fact', factId: area.id })),
        ...observations(group.nodes),
        ...riverEdges(group.nodes, region.map).map(
          (edge): FactSource => ({
            kind: 'map-edge',
            edgeId: edge.id,
            property: 'river',
            observedValue: String(edge.river),
          }),
        ),
      ]),
    });
  }
}
