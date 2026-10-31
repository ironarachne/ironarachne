import { describe, expect, it } from 'vitest';
import { RNG } from '@ironarachne/rng';
import type { Climate } from '$lib/environment';
import type { MapNode, MapEdge } from '$lib/map';
import type Region from './region';
import { emptyRegionFacts, regionFactsError } from './region_facts';
import { generateNotableFacts } from './region_notables';

function climate(overrides: Partial<Climate> = {}): Climate {
  return {
    name: 'temperate',
    description: '',
    cloudCover: 0.5,
    wind: [0, 0, 0],
    temperature: 10,
    temperatureMin: 10,
    temperatureMax: 10,
    precipitationAmount: 0.4,
    precipitationFrequency: 0.5,
    humidity: 0.5,
    seasons: [],
    ...overrides,
  };
}

function node(id: number, overrides: Partial<MapNode> = {}): MapNode {
  return {
    id,
    center: { x: 5, y: 5 },
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
function fixture(nodes: MapNode[], edges: MapEdge[] = []): Region {
  const facts = emptyRegionFacts('current');
  facts.areas.push({
    id: 'area:land',
    name: 'Land',
    description: '',
    origin: 'generated',
    mapNodeIds: nodes.filter((node) => !node.isWater && !node.isOcean).map((node) => node.id),
  });
  return {
    map: { width: 30, height: 30, nodes, edges, corners: [] },
    facts,
    environment: { climate: climate() },
  } as unknown as Region;
}
function derive(region: Region, seed = 'notables') {
  const before = structuredClone(region);
  generateNotableFacts(region, new RNG(seed));
  expect(region.map).toEqual(before.map);
  expect({ ...region.facts, notables: [] }).toEqual(before.facts);
  expect(regionFactsError(region.facts, region.map, [])).toBeNull();
  for (const fact of region.facts!.notables) {
    expect(fact.description).not.toContain('Hook:');
    expect(fact.description).toContain('part of the region');
    expect(fact.reason?.status).toBe('current');
    for (const source of fact.reason!.sources) {
      if (source.kind === 'map-node')
        expect(source.observedValue).toBe(
          String(region.map.nodes.find((node) => node.id === source.nodeId)![source.property]),
        );
      if (source.kind === 'map-edge')
        expect(source.observedValue).toBe(
          String(region.map.edges.find((edge) => edge.id === source.edgeId)![source.property]),
        );
    }
  }
  return region.facts!.notables;
}

const river = (road?: number): MapEdge => ({
  id: 77,
  d0: 99,
  d1: 8,
  v0: 0,
  v1: 1,
  midpoint: { x: 0, y: 0 },
  river: 2,
  road,
});

describe('grounded regional places', () => {
  it.each([
    [{ elevation: 0.65 }, 'High-ground traverse'],
    [{ temperature: 0 }, 'Cold travel country'],
    [{ temperature: 25, moisture: 0.2 }, 'Hot dry traverse'],
  ] as const)('grounds %s in measured conditions', (overrides, name) => {
    const places = derive(fixture([node(8, overrides)]));
    expect(places).toHaveLength(1);
    expect(places[0].name).toBe(name);
    expect(places[0].anchor).toEqual({ nodeIds: [8], edgeIds: [] });
  });

  it.each([
    { elevation: 0.64 },
    { temperature: 0.1 },
    { temperature: 24, moisture: 0.2 },
    { temperature: 25, moisture: 0.21 },
  ])('does not invent an obstacle below thresholds: %j', (overrides) => {
    expect(derive(fixture([node(8, overrides)]))).toEqual([]);
  });

  it.each([undefined, 0, 1])(
    'uses incident river IDs on either side and records road evidence %s',
    (road) => {
      const places = derive(fixture([node(8)], [river(road)]));
      if (!road) {
        expect(places).toEqual([]);
        return;
      }
      expect(places).toHaveLength(1);
      expect(places[0].name).toBe(road ? 'Road and river meeting' : 'River banks');
      expect(places[0].anchor).toEqual({ nodeIds: [8], edgeIds: [77] });
      expect(places[0].kind).toBe('landmark');
      expect(places[0].description).not.toMatch(/unverified|detour|impassable|unsafe|navigable/);
      expect(places[0].assessments?.find((entry) => entry.topic === 'safe-crossing')?.status).toBe(
        'unknown',
      );
    },
  );

  it('ignores dry edges, ocean-only rivers and water-only climate extremes', () => {
    expect(derive(fixture([node(8)], [{ ...river(), river: 0 }]))).toEqual([]);
    expect(
      derive(
        fixture(
          [
            node(8, { isWater: true, temperature: -20 }),
            node(99, { isOcean: true, elevation: 0.9 }),
          ],
          [river()],
        ),
      ),
    ).toEqual([]);
  });

  it('omits ordinary habitat study sites and cites limited resource reaches', () => {
    const region = fixture([node(8)]);
    region.facts!.habitats.push({
      id: 'habitat:forest',
      name: 'Forest',
      description: '',
      areaIds: ['area:land'],
      anchor: { nodeIds: [8], edgeIds: [] },
      origin: 'generated',
    });
    expect(derive(structuredClone(region))).toEqual([]);
    region.facts!.habitats[0].anchor = undefined;
    region.facts!.resources.push({
      id: 'resource:water',
      kind: 'freshwater',
      availability: 'limited' as const,
      depositIds: [],
      name: 'Water',
      description: 'A freshwater source.',
      reason: {
        ruleId: 'fixture:v1',
        status: 'current',
        sources: [{ kind: 'map-node', nodeId: 8, property: 'isWater', observedValue: 'false' }],
      },
      areaIds: ['area:land'],
      habitatIds: [],
      anchor: { nodeIds: [8], edgeIds: [] },
      origin: 'generated',
    });
    const resource = derive(region)[0];
    expect(resource.reason!.sources).toEqual([{ kind: 'fact', factId: 'resource:water' }]);
    expect(resource.description).toContain('A freshwater source.');
  });

  it('skips unlocated resources, habitats and settlement roles', () => {
    const region = fixture([node(8)]);
    region.facts!.resources.push({
      id: 'resource:water',
      kind: 'freshwater',
      availability: 'limited' as const,
      depositIds: [],
      name: 'Water',
      description: '',
      areaIds: ['area:land'],
      habitatIds: [],
      origin: 'generated',
    });
    region.facts!.habitats.push({
      id: 'habitat:forest',
      name: 'Forest',
      description: '',
      areaIds: ['area:land'],
      origin: 'generated',
    });
    region.facts!.settlementRoles.push({
      id: 'role:site:external',
      name: 'Site',
      description: '',
      settlement: { kind: 'artifact', targetId: 'other' },
      areaIds: [],
      anchor: { nodeIds: [], edgeIds: [] },
      origin: 'generated',
    });
    expect(derive(region)).toEqual([]);
  });

  it('selects a bounded, repeatable set independent of map and fact order', () => {
    const region = fixture(
      [
        node(8, { elevation: 0.8 }),
        node(9, { temperature: -5 }),
        node(10, { elevation: 0.8 }),
        node(99, { temperature: 30, moisture: 0.1 }),
      ],
      [river(1)],
    );
    region.facts!.habitats.push({
      id: 'habitat:forest',
      name: 'Forest',
      description: '',
      areaIds: ['area:land'],
      anchor: { nodeIds: [8, 9], edgeIds: [] },
      origin: 'generated',
    });
    for (const id of [8, 9])
      region.facts!.settlementRoles.push({
        id: `role:site:${id}`,
        name: 'Forest settlement',
        description: 'Forest supports woodland resources.',
        settlement: { kind: 'artifact', targetId: `town-${id}` },
        areaIds: ['area:land'],
        anchor: { nodeIds: [id], edgeIds: [] },
        origin: 'generated',
      });
    const places = derive(structuredClone(region));
    expect(places).toHaveLength(4);
    expect(places.filter((place) => place.kind === 'landmark')).toHaveLength(1);
    expect(places.some((place) => place.reason!.ruleId.includes('settlement-approach'))).toBe(
      false,
    );
    const reversed = structuredClone(region);
    reversed.map.nodes.reverse();
    reversed.map.edges.reverse();
    reversed.facts!.settlementRoles.reverse();
    expect(derive(reversed)).toEqual(places);
    expect(derive(structuredClone(region))).toEqual(places);
    const variants = new Set(
      Array.from({ length: 10 }, (_, i) =>
        JSON.stringify(derive(structuredClone(region), String(i))),
      ),
    );
    expect(variants.size).toBeGreaterThan(1);
  });
});

describe('seasonal climate hazards', () => {
  const seasons = [
    {
      name: 'winter',
      startDay: 364,
      endDay: 90,
      temperatureAdjustment: -18,
      humidityAdjustment: 0,
    },
    {
      name: 'summer',
      startDay: 182,
      endDay: 272,
      temperatureAdjustment: 12,
      humidityAdjustment: 0,
    },
  ];

  it('uses the local coldest month for a cold-travel hazard', () => {
    const region = fixture([node(8, { temperature: 8, moisture: 0.5 })]);
    region.environment = {
      climate: climate({
        temperature: 8,
        temperatureMin: -10,
        temperatureMax: 20,
        seasons,
      }),
    } as never;
    const places = derive(region);
    expect(places.map((place) => place.name)).toContain('Cold travel country');
    expect(places.find((place) => place.name === 'Cold travel country')!.description).toContain(
      'Freezing temperatures during winter make exposure a travel concern.',
    );
    expect(places.map((place) => place.name)).not.toContain('Hot dry traverse');
  });

  it('uses the local warmest month for a hot-dry hazard', () => {
    const region = fixture([node(8, { temperature: 20, moisture: 0.1 })]);
    region.environment = {
      climate: climate({
        temperature: 20,
        temperatureMin: 8,
        temperatureMax: 32,
        seasons,
      }),
    } as never;
    const places = derive(region);
    expect(places.map((place) => place.name)).toContain('Hot dry traverse');
    expect(places.map((place) => place.name)).not.toContain('Cold travel country');
  });
});
