import { isUsableRegionResource } from './region_resources';
import type { NarrativeContext } from '$lib/narrative';
import { settlementRoleNarrative } from './region_narrative';
import type { RNG } from '@ironarachne/rng';
import { Suitability, type MapNode, type MapEdge, type RegionMap } from '$lib/map';
import type Region from './region.js';
import type { FactSource, FactReason, SettlementRoleFact } from './region_fact_types.js';

const reason = (rule: string, sources: FactSource[]): FactReason => ({
  ruleId: `fantasy:region:${rule}:v1`,
  status: 'current',
  sources,
});
const observation = (
  node: MapNode,
  property:
    | 'isOcean'
    | 'isWater'
    | 'isCoast'
    | 'elevation'
    | 'temperature'
    | 'moisture'
    | 'biomeId',
): FactSource => ({
  kind: 'map-node',
  nodeId: node.id,
  property,
  observedValue: String(node[property]),
});
const edgeObservation = (edge: MapEdge, property: 'river' | 'road'): FactSource => ({
  kind: 'map-edge',
  edgeId: edge.id,
  property,
  observedValue: String(edge[property]),
});

/** Narrative variants describe only the role established by the site's saved evidence. */
const roleNarratives: Record<string, string[]> = {
  'river-crossing': [
    'The road meets the river here, making this settlement a natural stopping place for those crossing between its banks.',
    'Travel through the surrounding country converges here, where a road carries the journey across the river.',
    'This settlement stands where road and river meet, tying the country on either bank together.',
  ],
  'coastal-port-site': [
    'The sea opens the settlement toward a wider world, offering opportunities for trade along the coast.',
    'Open water lies beside this settlement, putting the coastal routes within reach of its inhabitants.',
    'Life here has an outward-looking prospect: the neighboring sea offers a way along the coast and beyond.',
  ],
  'agricultural-site': [
    'Gentle grasslands surround the settlement, offering room for fields and the promise of a farming livelihood.',
    'Farming is a natural prospect here, where low grassland and a temperate climate offer welcoming ground for cultivation.',
    'The country around this settlement lends itself to fields, with warmth and water to support cultivation.',
  ],
  'river-settlement': [
    'The river is a close neighbor, bringing freshwater within reach of the settlement and shaping its place in the landscape.',
    'This settlement keeps to the river, with freshwater nearby and the banks forming a familiar edge to its surroundings.',
    'Freshwater lies close at hand here, where the settlement sits beside the river.',
  ],
  'forest-settlement': [
    'Woodland frames the settlement, putting the resources of the forest close at hand.',
    'The forest is part of this settlement’s everyday surroundings, offering woodland resources within easy reach.',
    'This is a settlement with the woods on its doorstep, closely tied to the surrounding forest.',
  ],
  'land-placement-fallback': [
    'The settlement holds an unlikely foothold on difficult ground, away from the region’s gentler country.',
    'Life has taken root here despite the difficult terrain that surrounds the settlement.',
    'This settlement occupies demanding ground, a home beyond the region’s easier places to settle.',
  ],
  'land-placement': [
    'This settlement is a foothold in the surrounding country, a home from which its inhabitants look outward across the region.',
    'Here the wider landscape gives way to a settled place, grounding local life in the surrounding country.',
    'The settlement forms a small center of life amid the surrounding land.',
  ],
  'regional-capital': [
    'Power in the region has a home here, and decisions made in this settlement reach far beyond its own streets.',
    'This settlement is the region’s political heart, where local concerns become matters of wider rule.',
    'The surrounding country looks to this settlement as its seat of authority, giving its affairs weight beyond its borders.',
  ],
};

/** Roles describe existing sites; they never relocate settlements or alter their snapshots. */
function siteRole(node: MapNode, map: RegionMap) {
  const edges = map.edges
    .filter((edge) => edge.d0 === node.id || edge.d1 === node.id)
    .sort((a, b) => a.id - b.id);
  const crossing = edges.find(
    (edge) =>
      edge.river > 0 &&
      (edge.road ?? 0) > 0 &&
      [edge.d0, edge.d1].every((id) =>
        map.nodes.some((other) => other.id === id && !other.isOcean && !other.isWater),
      ),
  );
  if (crossing)
    return {
      rule: 'river-crossing',
      name: 'River crossing',
      description: roleNarratives['river-crossing'][0],
      nodes: [node],
      edges: [crossing],
      sources: [
        edgeObservation(crossing, 'river'),
        edgeObservation(crossing, 'road'),
        ...map.nodes
          .filter((other) => other.id === crossing.d0 || other.id === crossing.d1)
          .sort((a, b) => a.id - b.id)
          .flatMap((other) => [observation(other, 'isWater'), observation(other, 'isOcean')]),
      ],
    };
  const ocean = map.nodes
    .filter((other) => node.neighbors.includes(other.id) && other.isOcean)
    .sort((a, b) => a.id - b.id)[0];
  if (node.isCoast && ocean)
    return {
      rule: 'coastal-port-site',
      name: 'Coastal port site',
      description: roleNarratives['coastal-port-site'][0],
      nodes: [node],
      edges: [],
      sources: [observation(node, 'isCoast'), observation(ocean, 'isOcean')],
    };
  // Flatness here is a coarse elevation proxy, as in the existing placement rules, not a soil survey.
  if (
    node.elevation >= 0 &&
    node.elevation <= 0.4 &&
    node.temperature >= 5 &&
    node.temperature <= 30 &&
    node.moisture >= 0.3 &&
    node.moisture <= 0.8 &&
    /grassland|savanna|plains|prairie/i.test(node.biomeId ?? '')
  )
    return {
      rule: 'agricultural-site',
      name: 'Agricultural center',
      description: roleNarratives['agricultural-site'][0],
      nodes: [node],
      edges: [],
      sources: [
        observation(node, 'elevation'),
        observation(node, 'temperature'),
        observation(node, 'moisture'),
        observation(node, 'biomeId'),
      ],
    };
  const river = edges.find((edge) => edge.river > 0);
  if (river)
    return {
      rule: 'river-settlement',
      name: 'River settlement',
      description: roleNarratives['river-settlement'][0],
      nodes: [node],
      edges: [river],
      sources: [edgeObservation(river, 'river')],
    };
  if (/forest|woodland/i.test(node.biomeId ?? ''))
    return {
      rule: 'forest-settlement',
      name: 'Forest settlement',
      description: roleNarratives['forest-settlement'][0],
      nodes: [node],
      edges: [],
      sources: [observation(node, 'biomeId')],
    };
  const fallback = Suitability.standardRules.flatTerrain()(node, map) === 0;
  return {
    rule: fallback ? 'land-placement-fallback' : 'land-placement',
    name: 'Land settlement',
    description: fallback
      ? roleNarratives['land-placement-fallback'][0]
      : roleNarratives['land-placement'][0],
    nodes: [node],
    edges: [],
    sources: [observation(node, 'elevation'), observation(node, 'temperature')],
  };
}

/** Deterministic traversal of the saved road network, never a new road-generation pass. */
function roadPaths(map: RegionMap, start: number) {
  const previous = new Map<number, { node: number; edge: MapEdge }>();
  const visited = new Set([start]);
  const queue = [start];
  const edges = map.edges
    .filter((edge) => (edge.road ?? 0) > 0 && edge.d1 !== undefined)
    .sort((a, b) => a.id - b.id);
  for (let index = 0; index < queue.length; index++) {
    const current = queue[index];
    for (const edge of edges) {
      const next = edge.d0 === current ? edge.d1 : edge.d1 === current ? edge.d0 : undefined;
      if (next === undefined || visited.has(next)) continue;
      visited.add(next);
      previous.set(next, { node: current, edge });
      queue.push(next);
    }
  }
  return previous;
}

function addRoadRelationships(region: Region, roles: SettlementRoleFact[]): void {
  // Each connected component has a stable root, independent of the settlement list order.
  const connected = new Set<string>();
  for (const root of roles) {
    if (connected.has(root.id)) continue;
    const start = root.anchor.nodeIds[0];
    const paths = roadPaths(region.map, start);
    connected.add(root.id);
    for (const target of roles) {
      const end = target.anchor.nodeIds[0];
      if (connected.has(target.id) || !paths.has(end)) continue;
      const nodeIds = [end];
      const edges: MapEdge[] = [];
      let current = end;
      while (current !== start) {
        const step = paths.get(current)!;
        edges.unshift(step.edge);
        current = step.node;
        nodeIds.unshift(current);
      }
      connected.add(target.id);
      const id = `route:road:${root.id}:${target.id}`;
      const areas = region.facts!.areas.filter((area) =>
        area.mapNodeIds.some((node) => nodeIds.includes(node)),
      );
      region.facts!.routes.push({
        id,
        name: 'Settlement road',
        kind: 'road',
        origin: 'generated',
        description:
          'A road runs between these settlements, binding their places in the surrounding country together.',
        areaIds: areas.map((area) => area.id),
        anchor: { nodeIds, edgeIds: edges.map((edge) => edge.id) },
        endpoints: [
          { kind: 'settlement', settlement: root.settlement },
          { kind: 'settlement', settlement: target.settlement },
        ],
        reason: reason(
          'settlement-road',
          edges.map((edge) => edgeObservation(edge, 'road')),
        ),
      });
      region.facts!.claims.push({
        id: `claim:${id}`,
        name: 'Road connection',
        origin: 'generated',
        description: 'A road ties these settlements together across the surrounding country.',
        subjectId: root.id,
        relatedIds: [target.id, id],
        reason: reason(
          'road-linked-sites',
          [root.id, target.id, id].map((factId) => ({ kind: 'fact', factId })),
        ),
      });
    }
  }
}

export function generateHabitationFacts(region: Region, rng: RNG): void {
  const roles: SettlementRoleFact[] = [];
  const narratives = new Map<string, string[]>();
  for (const [index, settlement] of region.settlements.entries()) {
    const node = region.map.nodes.find((node) => node.id === settlement.mapNodeId);
    if (!node || node.isOcean || node.isWater)
      throw new Error('Settlement has no valid land placement.');
    const id = region.settlementIds?.[index];
    if (id === undefined) throw new Error('Settlement has no stable identity.');
    const site = siteRole(node, region.map);
    const habitats = region.facts!.habitats.filter((habitat) =>
      habitat.anchor?.nodeIds.includes(node.id),
    );
    const resources = region.facts!.resources.filter(
      (resource) =>
        isUsableRegionResource(resource) &&
        resource.reason?.status !== 'stale' &&
        resource.anchor?.nodeIds.includes(node.id),
    );
    const role: SettlementRoleFact = {
      id: `role:site:${id}`,
      name: site.name,
      description: site.description,
      origin: 'generated',
      settlement: { kind: 'embedded', settlementId: id },
      areaIds: region
        .facts!.areas.filter((area) => area.mapNodeIds.includes(node.id))
        .map((area) => area.id),
      anchor: {
        nodeIds: site.nodes.map((node) => node.id),
        edgeIds: site.edges.map((edge) => edge.id),
      },
      reason: reason(site.rule, [
        observation(node, 'isWater'),
        observation(node, 'isOcean'),
        ...site.sources,
        ...[...habitats, ...resources].map((fact) => ({ kind: 'fact' as const, factId: fact.id })),
      ]),
    };
    narratives.set(role.id, roleNarratives[site.rule]);
    roles.push(role);
  }
  roles.sort((a, b) => (a.id < b.id ? -1 : a.id > b.id ? 1 : 0));
  // Select prose after sorting so reordering saved settlements does not change their words.
  let context: NarrativeContext = { recentSelections: [] };
  for (const role of roles) {
    const result = settlementRoleNarrative(role, narratives.get(role.id)!, context, rng);
    role.description = result.text;
    context = result.nextContext;
  }
  region.facts!.settlementRoles.push(...roles);
  addRoadRelationships(region, roles);
  const capitalId = region.settlementIds?.[0];
  const capital = roles.find(
    (role) => role.settlement.kind === 'embedded' && role.settlement.settlementId === capitalId,
  );
  if (capital) {
    const capitalRole: SettlementRoleFact = {
      ...structuredClone(capital),
      id: 'role:capital',
      name: 'Regional capital',
      description: '',
      reason: reason('regional-capital', [{ kind: 'fact', factId: capital.id }]),
    };
    capitalRole.description = settlementRoleNarrative(
      capitalRole,
      roleNarratives['regional-capital'],
      context,
      rng,
    ).text;
    region.facts!.settlementRoles.push(capitalRole);
  }
}
