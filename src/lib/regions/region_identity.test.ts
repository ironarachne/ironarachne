import { describe, expect, it } from 'vitest';
import { RNG } from '@ironarachne/rng';
import { getFantasyNameGeneratorSet } from '$lib/names';
import { generate } from './regions';
import { generateRegionIdentity, isRegionIdentityFact } from './region_identity';
import { emptyRegionFacts, regionFactsError } from './region_facts';
import { generateRegionOverview } from './region_overview';
import { toRegionSnapshot } from './region_snapshot';
import { regionFromSnapshot } from './region_rehydrate';
import { regionToDocument, regionToMarkdown, regionToText } from './region_presentation';
import { regionToUiDocument } from './region_ui_presentation';
import { createRegionEvidenceChecker } from './region_context_evidence';
import { removeRegionResourceFact, setRegionResourceFactText } from './region_resource_editing';
import { createRegionStageRng } from './region_generation_passes';
import type Region from './region';
import type { FactBase, RegionFacts } from './region_fact_types';
import { rollRegionSnapshot } from './region_roll';

const rng = new RNG('identity-fixture');
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
const reason = {
  ruleId: 'fixture:v1',
  status: 'current' as const,
  sources: [
    { kind: 'map-node' as const, nodeId: 1, property: 'isWater' as const, observedValue: 'false' },
  ],
};
const fact = (id: string, name: string): FactBase => ({
  id,
  name,
  description: '',
  origin: 'generated',
  reason: structuredClone(reason),
});
function fixture(): Region & { facts: RegionFacts } {
  const region = {
    ...base,
    description: '',
    overviewReason: undefined,
    facts: emptyRegionFacts('current'),
    settlements: base.settlements.slice(0, 2).map((settlement, i) => ({
      ...settlement,
      name: ['Ashford', 'Belltown'][i],
      mapNodeId: i + 1,
    })),
    settlementIds: ['town:1', 'town:2'],
    map: {
      ...base.map,
      nodes: [1, 2, 3].map((id) => ({
        ...base.map.nodes[0],
        id,
        isWater: false,
        isOcean: false,
        biomeId: 'temperate deciduous forest',
        neighbors: [],
        elevation: 0.8,
      })),
      edges: [{ ...base.map.edges[0], id: 10, d0: 1, d1: 2, road: 1, river: 0 }],
    },
  };
  region.facts.denseForests = [{ ...fact('forest:dense:1', 'The Greenwood'), mapNodeIds: [1, 2] }];
  region.facts.mountainRanges = [
    { ...fact('range:mountain:1', 'The Grey Peaks'), mapNodeIds: [3], spineNodeIds: [3] },
  ];
  region.facts.settlementRoles = [
    {
      ...fact('role:1', 'Forest site'),
      settlement: { kind: 'embedded', settlementId: 'town:1' },
      areaIds: [],
      anchor: { nodeIds: [1], edgeIds: [] },
    },
  ];
  region.facts.routes = [
    {
      ...fact('route:road:1', 'Road'),
      kind: 'road',
      areaIds: [],
      anchor: { nodeIds: [1, 2], edgeIds: [10] },
      endpoints: [
        { kind: 'settlement', settlement: { kind: 'embedded', settlementId: 'town:1' } },
        { kind: 'settlement', settlement: { kind: 'embedded', settlementId: 'town:2' } },
      ],
    },
  ];
  region.facts.geology = [
    {
      ...fact('geology:1', 'Geology'),
      areaIds: [],
      anchor: { nodeIds: [3], edgeIds: [] },
      setting: { hostRocks: [], processes: [] },
    },
  ];
  region.facts.resourceDeposits = [
    {
      ...fact('deposit:1', 'Copper deposit'),
      geologyId: 'geology:1',
      resourceName: 'Copper',
      category: 'metal-ore',
      concentration: 'workable',
      exposure: 'deep',
      extraction: 'mining',
      anchor: { nodeIds: [3], edgeIds: [] },
    },
  ];
  region.facts.resources = [
    {
      ...fact('resource:1', 'Copper'),
      kind: 'ore',
      availability: 'limited',
      depositIds: ['deposit:1'],
      areaIds: [],
      habitatIds: [],
      anchor: { nodeIds: [3], edgeIds: [] },
    },
  ];
  return region;
}
function enrich(region = fixture(), seed = 'identity') {
  generateRegionIdentity(region, createRegionStageRng(seed, 'regional-identity'));
  region.description = generateRegionOverview(region, new RNG('overview'));
  return region;
}

describe('grounded regional identity', () => {
  it('keeps unnamed forest labels out of introductions', () => {
    const region = rollRegionSnapshot('foxtrot');
    expect(region.name).toBe('the Watchful Wet Grasslands');
    expect(region.facts.denseForests.some((forest) => forest.name === 'Dense forest')).toBe(true);
    expect(region.description).not.toContain('Dense forest');
    expect(region.description).not.toMatch(/Stretches of.*lie alongside|in a mild climate/);
    expect(region.description).toContain('A river runs between patches of');
    expect(rollRegionSnapshot('foxtrot')).toEqual(region);
  });
  it.each(['Dense forest', ' dense forest '])(
    'omits the generated placeholder %j but respects an authored name',
    (name) => {
      const region = fixture();
      region.facts.resources = [];
      region.facts.denseForests[0].name = name;
      expect(enrich(region).facts.claims).toEqual([]);
      region.facts.denseForests[0].origin = 'authored';
      expect(enrich(region).facts.claims).toHaveLength(1);
      expect(region.description).toContain(name.trim());
    },
  );
  it('keeps full generated payloads valid without a schema migration', () => {
    const saved = toRegionSnapshot(base);
    expect(regionFactsError(saved.facts, saved.map, saved.settlements)).toBeNull();
    expect(saved.facts.version).toBe(11);
  });
  it('stores located relationships and reuses them in the introduction and every text export', () => {
    const region = enrich();
    expect(region.facts.claims).toHaveLength(2); // The road already expresses the forest settlement.
    const road = region.facts.claims.find((entry) => entry.subjectId === 'route:road:1')!;
    const resource = region.facts.claims.find((entry) => entry.subjectId === 'resource:1')!;
    expect(road.description).toMatch(/Ashford.*Belltown|Ashford.*Greenwood.*Belltown/);
    expect(resource.description).toContain('Copper');
    expect(resource.description).toContain('limited supply');
    expect(region.description).toContain(road.description);
    expect(region.description).toContain(resource.description);
    expect(region.description).not.toMatch(/mine|trade|pass|ancient|secret|bridge|conflict/i);
    expect(road.relatedIds).toEqual(['forest:dense:1', 'role:1']);
    expect(resource.relatedIds).toEqual(['deposit:1', 'range:mountain:1']);
    const snapshot = toRegionSnapshot(region);

    for (const entry of snapshot.facts.claims)
      expect(createRegionEvidenceChecker(snapshot)(entry)).toBe(true);
    const identity = regionToDocument(snapshot).sections.find(
      (section) => section.heading === 'Regional identity',
    )!;
    expect(identity.factIds).toEqual(region.facts.claims.map((entry) => entry.id));
    const ui = regionToUiDocument(snapshot).sections.find(
      (section) => section.heading === 'Regional identity',
    )!;
    expect(ui.entries.map((entry) => entry.body)).toEqual(
      region.facts.claims.map((entry) => entry.description),
    );
    expect(ui.entries.every((entry) => entry.heading && !entry.heading.includes('undefined'))).toBe(
      true,
    );
    for (const text of [regionToMarkdown(snapshot), regionToText(snapshot)])
      for (const entry of region.facts.claims) expect(text).toContain(entry.description);
    const restored = toRegionSnapshot(regionFromSnapshot(snapshot, new RNG('open')));
    expect(restored.facts).toEqual(snapshot.facts);
    expect(restored.description).toBe(snapshot.description);
    region.map.edges[0].road = 0;
    expect(createRegionEvidenceChecker(region)(road)).toBe(false);
    expect(regionToMarkdown(toRegionSnapshot(region))).not.toContain(road.description);
  });
  it('contrasts a forest settlement with a mineral range and keeps empty regions sparse', () => {
    const forest = fixture();
    forest.facts.routes = [];
    forest.facts.resources = [];
    const mountain = fixture();
    mountain.facts.routes = [];
    mountain.facts.settlementRoles = [];
    expect(enrich(forest).description).toMatch(/Ashford.*Greenwood|Greenwood.*Ashford/);
    expect(enrich(mountain).description).toMatch(/Copper.*Grey Peaks|Grey Peaks.*Copper/);
    const empty = fixture();
    empty.facts = emptyRegionFacts('current');
    expect(enrich(empty).description).toBe('');
    expect(empty.facts.claims).toEqual([]);
    const omitted = fixture();
    expect(generateRegionOverview(omitted, new RNG('overview'))).not.toContain('Greenwood');
    expect(omitted.facts.claims).toEqual([]);
    generateRegionIdentity({ ...omitted, facts: undefined }, new RNG('optional'));
  });
  it('repeats selections under reordered inputs without mutating upstream data', () => {
    const a = fixture();
    a.facts.denseForests.push({ ...fact('forest:dense:2', 'The Blackwood'), mapNodeIds: [1, 2] });
    const upstream = structuredClone({ ...a.facts });
    const b = fixture();
    b.facts = structuredClone(a.facts);
    b.map.nodes.reverse();
    b.facts.denseForests.reverse();
    enrich(a);
    enrich(b);
    expect(b.facts.claims).toEqual(a.facts.claims);
    expect({ ...a.facts, claims: [] }).toEqual(upstream);
    expect(enrich(a, 'reroll').facts.claims).toEqual(b.facts.claims);
    const choices = new Set(
      Array.from({ length: 20 }, (_, i) => {
        const region = fixture();
        region.facts.denseForests = structuredClone(upstream.denseForests);
        return enrich(region, String(i)).facts.claims[0].description;
      }),
    );
    expect(choices.size).toBeGreaterThan(2);
  });
  it.each([
    'broken road',
    'wet road',
    'external town',
    'unnamed town',
    'stale road',
    'missing forest',
  ])('omits road identity with %s', (failure) => {
    const region = fixture();
    if (failure === 'broken road') region.map.edges[0].road = 0;
    if (failure === 'wet road') region.map.nodes[1].isWater = true;
    if (failure === 'external town')
      region.facts.routes[0].endpoints[1] = {
        kind: 'settlement',
        settlement: { kind: 'artifact', targetId: 'external' },
      };
    if (failure === 'unnamed town') region.settlements[1].name = '';
    if (failure === 'stale road') region.facts.routes[0].reason!.status = 'stale';
    if (failure === 'missing forest') region.facts.denseForests[0].mapNodeIds = [999];
    expect(enrich(region).facts.claims.some((entry) => entry.subjectId === 'route:road:1')).toBe(
      false,
    );
  });
  it.each([
    'unknown',
    'not-observed',
    'trace',
    'missing deposit',
    'disjoint deposit',
    'wet mineral',
    'stale deposit',
    'unnamed range',
    'missing anchor',
  ])('omits mineral identity with %s', (failure) => {
    const region = fixture();
    const resource = region.facts.resources[0];
    const deposit = region.facts.resourceDeposits[0];
    if (failure === 'unknown' || failure === 'not-observed') resource.availability = failure;
    if (failure === 'trace') deposit.concentration = 'trace';
    if (failure === 'missing deposit') resource.depositIds = ['missing'];
    if (failure === 'disjoint deposit') deposit.anchor.nodeIds = [2];
    if (failure === 'wet mineral') region.map.nodes[2].isOcean = true;
    if (failure === 'stale deposit') deposit.reason!.status = 'stale';
    if (failure === 'unnamed range') region.facts.mountainRanges[0].name = ' ';
    if (failure === 'missing anchor') delete resource.anchor;
    expect(enrich(region).facts.claims.some((entry) => entry.subjectId === resource.id)).toBe(
      false,
    );
  });
  it('supports available minerals without implying access, and caps families and overview sentences', () => {
    const region = fixture();
    region.facts.resources[0].availability = 'available';
    region.facts.denseForests[0].mapNodeIds = [2];
    region.facts.denseForests.push({ ...fact('forest:dense:2', 'The Blackwood'), mapNodeIds: [1] });
    const result = enrich(region);
    expect(result.facts.claims.length).toBeLessThanOrEqual(3);
    expect(result.description.match(/[.!?](?:\s|$)/g)?.length).toBeLessThanOrEqual(5);
    expect(
      result.overviewReason!.sources.filter(
        (source) => source.kind === 'fact' && source.factId.startsWith('claim:identity:'),
      ),
    ).toHaveLength(2);
    expect(
      result.facts.claims.find((entry) => entry.subjectId === 'resource:1')!.description,
    ).not.toContain('limited');
  });
  it('stales transitive evidence, preserves authored claims, and removes generated dependents', () => {
    const snapshot = toRegionSnapshot(enrich());
    const claim = snapshot.facts.claims.find((entry) => entry.subjectId === 'resource:1')!;
    const edited = setRegionResourceFactText(
      snapshot,
      'resourceDeposits',
      'deposit:1',
      'description',
      'Survey note.',
    );
    expect(edited.facts.claims.find((entry) => entry.id === claim.id)!.reason!.status).toBe(
      'stale',
    );
    expect(edited.overviewReason!.status).toBe('stale');
    expect(regionToText(edited)).not.toContain(claim.description);
    const removed = removeRegionResourceFact(snapshot, 'resourceDeposits', 'deposit:1');
    expect(removed.facts.claims.some((entry) => entry.id === claim.id)).toBe(false);
    const authored = setRegionResourceFactText(
      snapshot,
      'claims',
      claim.id,
      'description',
      'The survey is disputed.',
    );
    expect(regionToMarkdown(authored)).toContain('The survey is disputed. (Needs review.)');
    expect(
      regionToUiDocument(authored)
        .sections.find((section) => section.heading === 'Regional identity')!
        .entries.find((entry) => entry.factId === claim.id)!.warning,
    ).toContain('Needs review');
    expect(removeRegionResourceFact(authored, 'resourceDeposits', 'deposit:1')).toBe(authored);
    const live = regionFromSnapshot(authored, new RNG('open'));
    generateRegionIdentity(live, new RNG('again'));
    expect(live.facts!.claims.find((entry) => entry.id === claim.id)!.description).toBe(
      'The survey is disputed.',
    );
    expect(live.facts!.claims.every(isRegionIdentityFact)).toBe(true);
  });
});
