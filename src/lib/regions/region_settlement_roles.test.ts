import { describe, expect, it } from 'vitest';
import { RNG } from '@ironarachne/rng';
import type { MapNode, MapEdge } from '$lib/map';
import type { Settlement, SettlementSnapshot } from '$lib/settlements';
import type Region from './region';
import { emptyRegionFacts, regionFactsError } from './region_facts';
import { generateHabitationFacts } from './region_settlement_roles';

function node(id: number, overrides: Partial<MapNode> = {}): MapNode {
  return {
    id,
    center: { x: id, y: id },
    polygon: { vertices: [], edges: [] },
    neighbors: [],
    edges: [],
    corners: [],
    elevation: 0.2,
    temperature: 15,
    moisture: 0.5,
    isWater: false,
    isOcean: false,
    isCoast: false,
    ...overrides,
  };
}
function edge(id: number, d0: number, d1: number | undefined, river = 0, road = 0): MapEdge {
  return { id, d0, d1, v0: 0, v1: 1, midpoint: { x: 0, y: 0 }, river, road };
}
function fixture(nodes: MapNode[], edges: MapEdge[] = [], sites = [nodes[0].id]): Region {
  const facts = emptyRegionFacts('current');
  facts.areas.push({
    id: 'area:land',
    name: 'Land',
    description: '',
    origin: 'generated',
    mapNodeIds: nodes
      .filter((node) => !node.isWater && !node.isOcean)
      .map((node) => node.id)
      .sort((a, b) => a - b),
  });
  return {
    affiliation: 'affiliated',
    map: { width: 30, height: 30, nodes, edges, corners: [] },
    facts,
    settlements: sites.map(
      (mapNodeId) =>
        ({
          name: `Town ${mapNodeId}`,
          mapNodeId,
          location: { x: mapNodeId, y: mapNodeId },
        }) as Settlement,
    ),
    settlementIds: sites.map((id) => `settlement:${id}`),
  } as unknown as Region;
}
function derive(region: Region) {
  const before = structuredClone({ map: region.map, settlements: region.settlements });
  generateHabitationFacts(region, new RNG('roles'));
  expect({ map: region.map, settlements: region.settlements }).toEqual(before);
  expect(
    regionFactsError(
      region.facts,
      region.map,
      region.settlements.map((snapshot, i) => ({
        id: region.settlementIds![i],
        snapshot: snapshot as unknown as SettlementSnapshot,
      })),
    ),
  ).toBeNull();
  return region.facts!;
}

describe('geographic settlement roles', () => {
  it('varies repeated roles with reproducible prose while preserving their geography', () => {
    const sites = [1, 2, 3];
    const build = (seed: string) => {
      const region = fixture(
        sites.map((id) => node(id, { biomeId: 'forest' })),
        [],
        sites,
      );
      generateHabitationFacts(region, new RNG(seed));
      return region.facts!;
    };
    const first = build('narrative');
    expect(build('narrative')).toEqual(first);
    const roles = first.settlementRoles.filter((role) => role.id !== 'role:capital');
    expect(new Set(roles.map((role) => role.description)).size).toBeGreaterThan(1);
    expect(roles.every((role) => /woodland|forest|woods/.test(role.description))).toBe(true);
    expect(first.settlementRoles.map((role) => role.description).join(' ')).not.toMatch(
      /generated|mapped|cells|edges|fallback|selected|implied|supported|recorded/,
    );
    const variants = new Set(
      ['a', 'b', 'c', 'd', 'e'].map((seed) => build(seed).settlementRoles[0].description),
    );
    expect(variants.size).toBeGreaterThan(1);
  });

  it.each([
    ['Agricultural center', { biomeId: 'temperate grassland' }],
    ['Forest settlement', { biomeId: 'temperate forest' }],
    ['Land settlement', { biomeId: 'desert' }],
  ] as const)('derives %s from the saved site', (name, overrides) => {
    const role = derive(fixture([node(25, overrides)])).settlementRoles[0];
    expect(role.name).toBe(name);
    expect(role.settlement).toEqual({ kind: 'embedded', settlementId: 'settlement:25' });
    expect(role.anchor.nodeIds).toEqual([25]);
  });

  it('requires adjacent ocean and a coastal land cell for a port site', () => {
    const region = fixture([
      node(5, { isCoast: true, neighbors: [99] }),
      node(99, { isWater: true, isOcean: true }),
    ]);
    const role = derive(region).settlementRoles[0];
    expect(role.name).toBe('Coastal port site');
    expect(role.reason!.sources).toContainEqual({
      kind: 'map-node',
      nodeId: 99,
      property: 'isOcean',
      observedValue: 'true',
    });
    expect(derive(fixture([node(5, { isCoast: true })])).settlementRoles[0].name).toBe(
      'Land settlement',
    );
    expect(
      derive(fixture([node(5, { isCoast: true, neighbors: [99] }), node(99, { isWater: true })]))
        .settlementRoles[0].name,
    ).toBe('Land settlement');
  });

  it('requires road and river on the same edge with dry land on both sides for a crossing', () => {
    const region = fixture([node(5), node(9)], [edge(70, 9, 5, 2, 1)]);
    const role = derive(region).settlementRoles[0];
    expect(role.name).toBe('River crossing');
    expect(role.anchor.edgeIds).toEqual([70]);
    expect(role.reason!.sources).toContainEqual({
      kind: 'map-edge',
      edgeId: 70,
      property: 'road',
      observedValue: '1',
    });
    for (const edges of [
      [edge(70, 5, 9, 2)],
      [edge(70, 5, undefined, 2, 1)],
      [edge(70, 5, 9, 2), edge(71, 5, 9, 0, 1)],
    ]) {
      expect(derive(fixture([node(5), node(9)], edges)).settlementRoles[0].name).toBe(
        'River settlement',
      );
    }
    expect(
      derive(fixture([node(5), node(9, { isWater: true })], [edge(70, 5, 9, 2, 1)]))
        .settlementRoles[0].name,
    ).toBe('River settlement');
  });

  it.each([{ elevation: 0.7 }, { temperature: -10 }, { moisture: 0.1 }, { moisture: 0.9 }])(
    'does not claim agriculture with unsuitable conditions %j',
    (overrides) => {
      expect(
        derive(fixture([node(5, { biomeId: 'grassland', ...overrides })])).settlementRoles[0].name,
      ).toBe('Land settlement');
    },
  );

  it('explains fallback land and refuses unplaced or water settlements and absent identity', () => {
    expect(
      derive(fixture([node(5, { elevation: -0.05 })])).settlementRoles[0].reason!.ruleId,
    ).toContain('fallback');
    for (const region of [
      fixture([node(5, { isWater: true })]),
      fixture([node(5, { isOcean: true })]),
      fixture([node(5)], [], [99]),
    ]) {
      expect(() => generateHabitationFacts(region, new RNG('bad'))).toThrow('land placement');
    }
    const region = fixture([node(5)]);
    region.settlementIds = [];
    expect(() => generateHabitationFacts(region, new RNG('bad'))).toThrow('stable identity');
  });

  it('records paths through intermediate cells without inventing disconnected links', () => {
    const region = fixture(
      [node(5), node(9), node(11), node(20)],
      [edge(70, 5, 9, 0, 1), edge(71, 9, 11, 0, 1), edge(72, 11, undefined, 0, 1)],
      [5, 11, 20],
    );
    const facts = derive(region);
    expect(facts.routes).toHaveLength(1);
    expect(facts.routes[0].anchor).toEqual({ nodeIds: [11, 9, 5], edgeIds: [71, 70] });
    expect(facts.claims[0].relatedIds).toContain(facts.routes[0].id);
    expect(
      facts.routes[0].endpoints.map(
        (endpoint) => endpoint.kind === 'settlement' && endpoint.settlement,
      ),
    ).toEqual([
      { kind: 'embedded', settlementId: 'settlement:11' },
      { kind: 'embedded', settlementId: 'settlement:5' },
    ]);
    const shuffled = fixture(
      [...region.map.nodes].reverse(),
      [...region.map.edges].reverse(),
      [5, 20, 11],
    );
    expect(derive(shuffled)).toEqual(facts);
    expect(facts.settlementRoles.find((role) => role.id === 'role:capital')!.settlement).toEqual({
      kind: 'embedded',
      settlementId: 'settlement:5',
    });
  });
});
