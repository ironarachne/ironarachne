import type { RNG } from '@ironarachne/rng';
import type { MapNode, MapEdge } from '$lib/map';
import type Region from './region.js';
import type { FactSource, NotableFact } from './region_fact_types.js';

function location(node: MapNode, region: Region): string {
  const x = node.center.x / region.map.width;
  const y = node.center.y / region.map.height;
  const vertical = y < 1 / 3 ? 'northern' : y > 2 / 3 ? 'southern' : '';
  const horizontal = x < 1 / 3 ? 'western' : x > 2 / 3 ? 'eastern' : '';
  return [vertical, horizontal].filter(Boolean).join(' ') || 'central';
}

function observation(
  node: MapNode,
  property: 'elevation' | 'temperature' | 'moisture',
): FactSource {
  return { kind: 'map-node', nodeId: node.id, property, observedValue: String(node[property]) };
}

function notable(
  region: Region,
  node: MapNode,
  kind: NotableFact['kind'],
  rule: string,
  name: string,
  description: string,
  sources: FactSource[],
  edges: MapEdge[] = [],
): NotableFact {
  return {
    id: `${kind}:${rule}:${node.id}${sources[0]?.kind === 'fact' ? `:${sources[0].factId}` : edges.length ? `:${edges[0].id}` : ''}`,
    kind,
    name,
    description: `In the ${location(node, region)} part of the region: ${description}`,
    origin: 'generated',
    areaIds: region
      .facts!.areas.filter((area) => area.mapNodeIds.includes(node.id))
      .map((area) => area.id),
    anchor: { nodeIds: [node.id], edgeIds: edges.map((edge) => edge.id).sort((a, b) => a - b) },
    reason: { ruleId: `fantasy:region:${rule}:v1`, status: 'current', sources },
  };
}

function naturalPlaces(region: Region, nodes: MapNode[]): NotableFact[] {
  const resources = region.facts!.resources.flatMap((resource) => {
    const node = nodes.find((node) => resource.anchor?.nodeIds.includes(node.id));
    if (!node) return [];
    const edges = region.map.edges.filter((edge) => resource.anchor?.edgeIds.includes(edge.id));
    return [
      notable(
        region,
        node,
        'landmark',
        'resource-reach',
        `${resource.name} reach`,
        `${resource.description} Hook: survey access to this resource and identify a suitable gathering place.`,
        [{ kind: 'fact', factId: resource.id }],
        edges,
      ),
    ];
  });
  const habitats = region.facts!.habitats.flatMap((habitat) => {
    const node = nodes.find((node) => habitat.anchor?.nodeIds.includes(node.id));
    if (!node) return [];
    return [
      notable(
        region,
        node,
        'landmark',
        'habitat-study',
        `${habitat.name} study site`,
        `this site lies within the recorded ${habitat.name} habitat. Hook: guide a survey of this habitat and compare it with nearby terrain.`,
        [{ kind: 'fact', factId: habitat.id }],
      ),
    ];
  });
  return [...resources, ...habitats];
}

function inhabitedPlaces(region: Region, nodes: MapNode[]): NotableFact[] {
  return region
    .facts!.settlementRoles.filter((role) => role.id.startsWith('role:site:'))
    .flatMap((role) => {
      const node = nodes.find((node) => role.anchor.nodeIds.includes(node.id));
      if (!node) return [];
      return [
        notable(
          region,
          node,
          'landmark',
          'settlement-approach',
          `${role.name} approach`,
          `${role.description} Hook: escort travelers to this inhabited site and survey its approach.`,
          [{ kind: 'fact', factId: role.id }],
          region.map.edges.filter((edge) => role.anchor.edgeIds.includes(edge.id)),
        ),
      ];
    });
}

function riverObstacles(region: Region, nodes: MapNode[]): NotableFact[] {
  return [...region.map.edges]
    .sort((a, b) => a.id - b.id)
    .filter((edge) => edge.river > 0)
    .flatMap((edge) => {
      const node = nodes.find((node) => node.id === edge.d0 || node.id === edge.d1);
      if (!node) return [];
      const road = (edge.road ?? 0) > 0;
      return [
        notable(
          region,
          node,
          'hazard',
          'river-obstacle',
          road ? 'River crossing obstacle' : 'River detour',
          `a river interrupts overland travel${road ? ' where a mapped road meets the water' : '; no road is mapped across this edge'}. Crossing safety and river navigability are unverified. Hook: scout a safe crossing before bringing supplies through.`,
          [
            {
              kind: 'map-edge',
              edgeId: edge.id,
              property: 'river',
              observedValue: String(edge.river),
            },
            {
              kind: 'map-edge',
              edgeId: edge.id,
              property: 'road',
              observedValue: String(edge.road),
            },
          ],
          [edge],
        ),
      ];
    });
}

function terrainObstacles(region: Region, nodes: MapNode[]): NotableFact[] {
  return nodes.flatMap((node) => {
    const candidates: NotableFact[] = [];
    if (node.elevation >= 0.65)
      candidates.push(
        notable(
          region,
          node,
          'hazard',
          'high-ground-obstacle',
          'High-ground traverse',
          'high ground complicates overland route planning. Hook: scout an approach through the high terrain before leading a caravan onward.',
          [observation(node, 'elevation')],
        ),
      );
    if (node.temperature <= 0)
      candidates.push(
        notable(
          region,
          node,
          'hazard',
          'cold-travel',
          'Cold travel country',
          'mapped temperatures are at or below freezing, making exposure a travel concern. Hook: arrange shelter and supplies for a journey through the cold country.',
          [observation(node, 'temperature')],
        ),
      );
    if (node.temperature >= 25 && node.moisture <= 0.2)
      candidates.push(
        notable(
          region,
          node,
          'hazard',
          'hot-dry-travel',
          'Hot dry traverse',
          'high mapped temperatures and low moisture make water planning a travel concern. Hook: survey water access before attempting this traverse.',
          [observation(node, 'temperature'), observation(node, 'moisture')],
        ),
      );
    return candidates;
  });
}

/** Select at most four supported places using only the notable-places stream. */
export function generateNotableFacts(region: Region, rng: RNG): void {
  const nodes = region.map.nodes
    .filter((node) => !node.isWater && !node.isOcean)
    .sort((a, b) => a.id - b.id);
  const groups = [
    naturalPlaces(region, nodes),
    inhabitedPlaces(region, nodes),
    riverObstacles(region, nodes),
    terrainObstacles(region, nodes),
  ];
  for (const candidates of groups) {
    candidates.sort((a, b) => (a.id < b.id ? -1 : a.id > b.id ? 1 : 0));
    if (candidates.length > 0) region.facts!.notables.push(rng.item(candidates));
  }
}
