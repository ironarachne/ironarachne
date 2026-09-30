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
      description: 'A saved road crosses a river edge here between two dry-land cells.',
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
      description:
        'This dry coastal site adjoins ocean water and offers access for coastal trade; no sheltered harbor is implied.',
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
      description:
        'Low-lying grassland with moderate warmth and moisture supports farming around this settlement.',
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
      description:
        'A river borders this settlement and provides local freshwater access; no crossing or navigability is implied.',
      nodes: [node],
      edges: [river],
      sources: [edgeObservation(river, 'river')],
    };
  if (/forest|woodland/i.test(node.biomeId ?? ''))
    return {
      rule: 'forest-settlement',
      name: 'Forest settlement',
      description:
        'The mapped forest habitat supports access to woodland resources around this settlement.',
      nodes: [node],
      edges: [],
      sources: [observation(node, 'biomeId')],
    };
  const fallback = Suitability.standardRules.flatTerrain()(node, map) === 0;
  return {
    rule: fallback ? 'land-placement-fallback' : 'land-placement',
    name: 'Land settlement',
    description: fallback
      ? 'No preferred site remained; the placement fallback selected dry land despite its unsuitable elevation.'
      : 'Selected from dry-land sites ranked by freshwater access, elevation and temperature; no more specific site role is supported.',
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
        description: 'The saved road network connects these settlements.',
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
        description: 'These settlement sites are linked by the recorded road route.',
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

export function generateHabitationFacts(region: Region, _rng: RNG): void {
  const roles: SettlementRoleFact[] = [];
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
    const resources = region.facts!.resources.filter((resource) =>
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
    roles.push(role);
  }
  roles.sort((a, b) => (a.id < b.id ? -1 : a.id > b.id ? 1 : 0));
  region.facts!.settlementRoles.push(...roles);
  addRoadRelationships(region, roles);
  const capitalId = region.settlementIds?.[0];
  const capital = roles.find(
    (role) => role.settlement.kind === 'embedded' && role.settlement.settlementId === capitalId,
  );
  if (capital)
    region.facts!.settlementRoles.push({
      ...structuredClone(capital),
      id: 'role:capital',
      name: 'Regional capital',
      description: 'The regional seat of authority, designated when this region was generated.',
      reason: reason('regional-capital', [{ kind: 'fact', factId: capital.id }]),
    });
}
