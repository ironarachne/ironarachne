import { describe, expect, it } from 'vitest';
import { RNG } from '@ironarachne/rng';
import type { MapNode, MapEdge } from '$lib/map';
import { getFantasyNameGeneratorSet } from '$lib/names';
import { generate } from './regions';
import { emptyRegionFacts } from './region_facts';
import { generateRegionOverview } from './region_overview';
import { overviewLandscape, overviewRoad, overviewSettlement } from './region_geography_narrative';
import { biomePhrase, regionalLandNarrative } from './region_narrative';
import { createRegionEvidenceChecker } from './region_context_evidence';
import type Region from './region';
import type { FactSource, HabitatFact, RegionFacts } from './region_fact_types';

const rng = new RNG('geography-fixture');
const base = generate({
  rng,
  nameGeneratorSet: getFantasyNameGeneratorSet('human', rng),
  dominantCulture: null,
  mapWidth: 12,
  mapHeight: 10,
  affiliation: 'unaffiliated',
  generateNeighbors: false,
  minRealms: 0,
  maxRealms: 0,
});

function node(id: number, biomeId: string): MapNode {
  return {
    id,
    biomeId,
    neighbors: [],
    center: { x: id, y: id },
    elevation: 0.5,
    temperature: 15,
    moisture: 0.5,
    isOcean: false,
    isWater: false,
    isCoast: false,
    polygon: { vertices: [], edges: [] },
    edges: [],
    corners: [],
  };
}
function edge(id: number, d0: number, d1: number, road: number, river: number): MapEdge {
  return { id, d0, d1, road, river, v0: 0, v1: 1, midpoint: { x: 0, y: 0 } };
}
function fixture() {
  const nodes = [
    node(1, 'temperate deciduous forest'),
    node(2, 'temperate deciduous forest'),
    node(3, 'temperate grassland'),
    node(4, 'temperate grassland'),
  ];
  const facts = emptyRegionFacts('current');
  const region: Region & { facts: RegionFacts } = {
    ...base,
    overviewReason: undefined,
    facts,
    settlements: base.settlements.slice(0, 2).map((settlement, i) => ({
      ...settlement,
      name: i === 0 ? 'Sezail' : 'Tar Morgul',
      mapNodeId: i === 0 ? 1 : 3,
    })),
    settlementIds: ['sezail', 'tar-morgul'],
    map: {
      width: 10,
      height: 10,
      nodes,
      corners: [],
      edges: [edge(10, 1, 2, 1, 0), edge(20, 2, 3, 1, 2), edge(30, 1, 4, 0, 1)],
    },
  };
  const habitats: HabitatFact[] = ['temperate deciduous forest', 'temperate grassland'].map(
    (name, i) => {
      const footprint = nodes.slice(i * 2, i * 2 + 2);
      return {
        id: `habitat:${i}`,
        name,
        description: '',
        origin: 'generated',
        areaIds: [],
        anchor: { nodeIds: footprint.map((node) => node.id), edgeIds: [] },
        reason: {
          ruleId: 'habitat:v1',
          status: 'current',
          sources: footprint.map(
            (node): FactSource => ({
              kind: 'map-node',
              nodeId: node.id,
              property: 'biomeId',
              observedValue: node.biomeId!,
            }),
          ),
        },
      };
    },
  );
  facts.habitats = habitats;
  facts.areas = [
    {
      id: 'area:land',
      name: 'Land',
      origin: 'generated',
      description: regionalLandNarrative('hilly', 'mid', new RNG('land')),
      mapNodeIds: [1, 2, 3, 4],
      reason: { ruleId: 'land:v1', status: 'current', sources: [] },
    },
  ];
  facts.settlementRoles = [
    {
      id: 'role:sezail',
      name: 'River settlement',
      description: '',
      origin: 'generated',
      settlement: { kind: 'embedded', settlementId: 'sezail' },
      areaIds: [],
      anchor: { nodeIds: [1], edgeIds: [30] },
      reason: {
        ruleId: 'fantasy:region:river-settlement:v1',
        status: 'current',
        sources: [{ kind: 'map-edge', edgeId: 30, property: 'river', observedValue: '1' }],
      },
    },
  ];
  facts.routes = [
    {
      id: 'route:road',
      kind: 'road',
      name: 'Road',
      description: '',
      origin: 'generated',
      areaIds: [],
      anchor: { nodeIds: [1, 2, 3], edgeIds: [10, 20] },
      endpoints: [
        { kind: 'settlement', settlement: { kind: 'embedded', settlementId: 'sezail' } },
        { kind: 'settlement', settlement: { kind: 'embedded', settlementId: 'tar-morgul' } },
      ],
      reason: {
        ruleId: 'road:v1',
        status: 'current',
        sources: [10, 20].map(
          (edgeId): FactSource => ({
            kind: 'map-edge',
            edgeId,
            property: 'road',
            observedValue: '1',
          }),
        ),
      },
    },
  ];
  return region;
}
const prose = (region: ReturnType<typeof fixture>, seed = 'words') =>
  generateRegionOverview(region, new RNG(seed));

describe('grounded geography in regional introductions', () => {
  it('connects elevation, mixed vegetation, a local river boundary, and settlement travel', () => {
    const region = fixture();
    const text = prose(region);
    expect(text).toMatch(/hilly|rolling/);
    expect(text).toMatch(/upland/);
    expect(text).toMatch(/woodland that sheds its leaves with the seasons/i);
    expect(text).toContain('open grassland in a seasonal climate');
    expect(text).toContain('river running between stretches of the two');
    expect(text).toMatch(/Sezail.*freshwater.*road.*Tar Morgul/);
    expect(text).toContain('meeting a river along the way');
    expect(text.indexOf('upland')).toBeLessThan(text.toLowerCase().indexOf('woodland'));
    expect(text.toLowerCase().indexOf('woodland')).toBeLessThan(text.indexOf('Sezail'));
    expect(text).not.toMatch(
      /temperate|deciduous|bridge|navigab|trade|capital|impassable|divides the region/,
    );
    expect(region.overviewReason?.sources).toEqual(
      expect.arrayContaining([
        { kind: 'fact', factId: 'role:sezail' },
        { kind: 'fact', factId: 'route:road' },
        { kind: 'fact', factId: 'habitat:0' },
        { kind: 'fact', factId: 'habitat:1' },
        { kind: 'map-edge', edgeId: 20, property: 'river', observedValue: '2' },
      ]),
    );
    expect(
      createRegionEvidenceChecker(region)(
        region.overviewReason
          ? {
              id: 'overview',
              name: '',
              description: text,
              origin: 'generated',
              reason: region.overviewReason,
            }
          : region.facts.areas[0],
      ),
    ).toBe(true);
    region.map.edges[1].river = 0;
    expect(
      createRegionEvidenceChecker(region)({
        id: 'overview',
        name: '',
        description: text,
        origin: 'generated',
        reason: region.overviewReason,
      }),
    ).toBe(false);
  });

  it('varies words without changing geography or facts and repeats for a fixed seed', () => {
    const region = fixture();
    const before = structuredClone({ map: region.map, facts: region.facts });
    const results = Array.from({ length: 12 }, (_, seed) => prose(region, String(seed)));
    expect(new Set(results).size).toBeGreaterThan(1);
    expect(prose(region, '4')).toBe(results[4]);
    expect({ map: region.map, facts: region.facts }).toEqual(before);
    expect(results.every((text) => /Sezail.*road.*Tar Morgul/.test(text))).toBe(true);
  });

  it('does not describe a river between biomes from unrelated, boundary, or interior river edges', () => {
    for (const ends of [
      [1, 2],
      [3, 4],
      [1, undefined],
      [1, 999],
    ]) {
      const region = fixture();
      region.map.edges = [{ ...region.map.edges[1], d0: ends[0]!, d1: ends[1] }];
      const landscape = overviewLandscape(region, () => true)!;
      expect(landscape.candidate.templates[0].parts[0].options.join(' ')).not.toContain(
        'between stretches of the two',
      );
      expect(
        landscape.sources.some(
          (source) => source.kind === 'map-edge' && source.property === 'river',
        ),
      ).toBe(ends[0] === 1 && ends[1] !== 999);
    }
  });

  it('describes waterways within a single biome and along its boundary without claiming a regional barrier', () => {
    const region = fixture();
    region.facts.habitats = region.facts.habitats.slice(0, 1);
    region.facts.settlementRoles = [];
    region.facts.routes = [];
    region.map.edges = [edge(10, 1, 2, 0, 1)];
    expect(prose(region)).toContain('river running between stretches of woodland');
    region.map.edges[0].d1 = undefined;
    expect(prose(region)).toContain('river bordering part of the woodland');
    expect(prose(region)).not.toMatch(/impassable|divides|bridge|crossing|navigab/);
    region.map.edges[0].river = 0;
    expect(prose(region)).not.toContain('river');
  });

  it('omits stale, missing, wet, and contradictory habitat footprints', () => {
    const region = fixture();
    region.facts.habitats[0].reason!.status = 'stale';
    expect(prose(region)).not.toContain('sheds its leaves');
    const habitat = region.facts.habitats[1];
    for (const ids of [[], [999], [1], [3, 3]]) {
      habitat.anchor!.nodeIds = ids;
      expect(overviewLandscape(region, () => true)?.candidate.sourceIds).not.toContain(habitat.id);
    }
    habitat.anchor!.nodeIds = [3];
    region.map.nodes[2].isWater = true;
    expect(overviewLandscape(region, () => true)?.candidate.sourceIds).not.toContain(habitat.id);
    region.facts.habitats = [];
    expect(prose(region)).not.toContain('grassland');
  });

  it('describes a road when a site role is absent or stale without guessing a settlement role', () => {
    const region = fixture();
    region.facts.settlementRoles[0].reason!.status = 'stale';
    expect(prose(region)).toMatch(/Sezail.*Tar Morgul/);
    expect(prose(region)).not.toContain('freshwater');
    region.facts.settlementRoles = [];
    expect(prose(region)).toContain('meeting a river along the way');
    region.map.edges[1].river = 0;
    region.map.edges[2].river = 0;
    expect(prose(region)).not.toContain('river');
  });

  it('keeps a supported settlement beside its river when the road is missing', () => {
    const region = fixture();
    region.facts.routes = [];
    expect(prose(region)).toMatch(/Sezail.*freshwater/);
    expect(prose(region)).not.toContain('Tar Morgul');
    region.map.edges[2].river = 0;
    expect(prose(region)).not.toContain('Sezail');
  });

  it.each([
    'missing edge',
    'broken road',
    'wrong endpoint',
    'missing node',
    'wet node',
    'repeated node',
    'disconnected edge',
    'external endpoint',
    'boundary endpoint',
    'same endpoint',
    'unnamed endpoint',
  ])('omits a road with %s instead of inventing its route', (failure) => {
    const region = fixture();
    const route = region.facts.routes[0];
    if (failure === 'missing edge') route.anchor.edgeIds = [10, 999];
    if (failure === 'broken road') region.map.edges[1].road = 0;
    if (failure === 'wrong endpoint') region.settlements[1].mapNodeId = 4;
    if (failure === 'missing node')
      region.map.nodes = region.map.nodes.filter((node) => node.id !== 2);
    if (failure === 'wet node') region.map.nodes[1].isOcean = true;
    if (failure === 'repeated node') route.anchor.nodeIds = [1, 1, 3];
    if (failure === 'disconnected edge') region.map.edges[1].d0 = 4;
    if (failure === 'external endpoint')
      route.endpoints[1] = {
        kind: 'settlement',
        settlement: { kind: 'artifact', targetId: 'outside' },
      };
    if (failure === 'boundary endpoint') route.endpoints[1] = { kind: 'boundary', edgeId: 20 };
    if (failure === 'same endpoint') route.endpoints[1] = route.endpoints[0];
    if (failure === 'unnamed endpoint') region.settlements[1].name = ' ';
    expect(overviewRoad(region, route)).toBeUndefined();
    expect(prose(region)).not.toContain('Tar Morgul');
  });

  it('resolves a reversed road path and refuses a role anchored at another site', () => {
    const region = fixture();
    const route = region.facts.routes[0];
    route.anchor.nodeIds.reverse();
    route.anchor.edgeIds.reverse();
    route.endpoints.reverse();
    expect(overviewRoad(region, route)).toBeDefined();
    const role = region.facts.settlementRoles[0];
    role.anchor.nodeIds = [3];
    expect(overviewSettlement(region, role)).toBeUndefined();
    expect(prose(region)).not.toContain('freshwater');
  });

  it.each([
    ['temperate deciduous forest', 'woodland that sheds its leaves with the seasons'],
    ['boreal forest', 'conifer woodland in a cold climate'],
    ['montane forest', 'mountain woodland'],
    ['tropical savanna', 'warm grassland with scattered trees'],
    ['alpine tundra', 'treeless alpine country'],
    ['subtropical desert', 'hot desert country'],
    ['unknown habitat', 'unknown habitat'],
    ['constructor', 'constructor'],
  ])('interprets %s without replacing its ecological meaning', (biome, phrase) => {
    expect(biomePhrase(biome)).toBe(phrase);
  });
});
