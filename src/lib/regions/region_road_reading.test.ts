import { readFileSync } from 'node:fs';
import { gunzipSync } from 'node:zlib';
import { describe, expect, it, vi } from 'vitest';
import { RNG } from '@ironarachne/rng';
import { migrateRegionSnapshot, validateRegionSnapshot } from './region_artifact_kind';
import { rollRegionSnapshot } from './region_roll';
import { emptyRegionFacts } from './region_facts';
import { regionFromSnapshot } from './region_rehydrate';
import { toRegionSnapshot, type RegionSnapshot } from './region_snapshot';
import { generateRegionGazetteer } from './region_editorial';
import { regionGazetteerError } from './region_editorial_validation';
import { regionToDocument, regionToMarkdown, regionToText } from './region_presentation';
import { regionToUiDocument } from './region_ui_presentation';
import { editorialSentenceChecker } from './region_editorial_evidence';
import { buildRoadReadings, roadReadingCandidates } from './region_road_reading';
import { observedRoad, readableRoad, roadNetworkObservation } from './region_road_evidence';
import { roadObservationError, roadReadingsError } from './region_road_validation';
import {
  withRegionOverviewEvidence,
  setRegionResourceFactText,
  removeRegionResourceFact,
} from './region_resource_editing';
import { setRegionPlaceText } from './region_editing';
import type { RouteFact, FactBase } from './region_fact_types';

const migrated = migrateRegionSnapshot(
  JSON.parse(
    gunzipSync(
      readFileSync(new URL('../../../test_fixtures/region_445_belvorn.json.gz', import.meta.url)),
    ).toString(),
  ),
  14,
);
if (!migrated.ok) throw new Error(migrated.message);
const historical = migrated.value;
const fact = (id: string): FactBase => ({
  id,
  name: '',
  description: '',
  origin: 'generated',
  reason: {
    ruleId: 'fixture:v1',
    status: 'current',
    sources: [{ kind: 'map-node', nodeId: 1, property: 'isWater', observedValue: 'false' }],
  },
});
function fixture() {
  const snapshot = structuredClone(historical);
  delete snapshot.gazetteer;
  delete snapshot.overviewReason;
  snapshot.description = '';
  snapshot.facts = emptyRegionFacts('current');
  snapshot.map.rivers = undefined;
  snapshot.map.nodes = Array.from({ length: 6 }, (_, i) => ({
    ...snapshot.map.nodes[0],
    id: i + 1,
    temperature: 15,
    moisture: 0.5,
    isWater: false,
    isOcean: false,
    isCoast: false,
    biomeId: 'temperate deciduous forest',
    neighbors: [],
  }));
  snapshot.settlements = snapshot.map.nodes.map((node) => ({
    ...structuredClone(historical.settlements[0]),
    id: `town:${node.id}`,
    snapshot: {
      ...structuredClone(historical.settlements[0].snapshot),
      name: `Town ${node.id}`,
      description: '',
      mapNodeId: node.id,
      population: 100,
    },
  }));
  snapshot.map.edges = [
    [1, 2],
    [2, 3],
    [1, 4],
    [5, 6],
  ].map(([a, b], i) => ({
    ...historical.map.edges[0],
    id: i + 10,
    d0: a,
    d1: b,
    road: 1,
    river: 0,
  }));
  const route = (id: string, nodes: number[], edges: number[]): RouteFact => ({
    ...fact(id),
    name: 'Settlement road',
    kind: 'road',
    areaIds: [],
    anchor: { nodeIds: nodes, edgeIds: edges },
    endpoints: [
      { kind: 'settlement', settlement: { kind: 'embedded', settlementId: `town:${nodes[0]}` } },
      {
        kind: 'settlement',
        settlement: { kind: 'embedded', settlementId: `town:${nodes.at(-1)}` },
      },
    ],
  });
  snapshot.facts.routes = [
    route('route:a', [1, 2], [10]),
    route('route:b', [1, 2, 3], [10, 11]),
    route('route:c', [1, 4], [12]),
    route('route:d', [5, 6], [13]),
  ];
  return snapshot;
}
function generate(snapshot: RegionSnapshot, seed = '448') {
  const region = regionFromSnapshot(snapshot, new RNG('restore'));
  delete region.gazetteer;
  generateRegionGazetteer(region, new RNG(seed));
  return toRegionSnapshot(region);
}
const sentences = (snapshot: RegionSnapshot) =>
  snapshot.gazetteer!.blocks.flatMap((block) => block.sentences);
const travel = (snapshot: RegionSnapshot) =>
  regionToUiDocument(snapshot).sections.find((section) => section.heading === 'Travel')!;

describe('compact saved road reading', () => {
  it('presents the verified historical seven-connection hub without repeating old filler', () => {
    const before = JSON.stringify(historical.facts);
    const result = generate(historical);
    expect(result.gazetteer?.version).toBe(5);
    expect(JSON.stringify(result.facts)).toBe(before);
    const roads = historical.facts.routes.filter((route) => route.kind === 'road');
    expect(roads).toHaveLength(7);
    expect(travel(result).entries.filter((entry) => entry.factId)).toHaveLength(7);
    const hub = sentences(result).filter((sentence) => sentence.candidateId.includes(':hub:'));
    expect(hub).toHaveLength(1);
    expect(hub[0].text).toMatch(/Revilun.*saved.*7 other settlements/);
    expect(
      travel(result).entries.every(
        (entry) => !entry.hook && !/woodland|forest|Hook:/.test(entry.body),
      ),
    ).toBe(true);
    expect(validateRegionSnapshot(result).ok).toBe(true);
    expect(generate(historical).gazetteer).toEqual(result.gazetteer);
  });

  it('keeps directories complete through budgets, shared paths and disconnected networks', () => {
    const source = fixture();
    const result = generate(source);
    const entries = travel(result).entries.filter((entry) => entry.factId);
    expect(entries.map((entry) => entry.factId)).toEqual(
      source.facts.routes.map((route) => route.id),
    );
    expect(entries[1].heading).toBe('Town 1 to Town 3');
    expect(
      entries.every((entry) => entry.anchorId && entry.inspectionFactIds?.includes(entry.factId!)),
    ).toBe(true);
    expect(regionToText(result)).toContain('saved road routes form 2 separate groups');
    expect(regionToText(result)).not.toMatch(/Hook:|trade|safe|bridge|ford|shortest|direct road/);
    expect(regionGazetteerError(result.gazetteer, result)).toBeNull();
    source.facts.routes.pop();
    expect(regionToText(generate(source))).toContain(
      '2 recorded settlements have no eligible saved road route',
    );
    source.facts.routes = [];
    expect(
      regionToDocument(generate(source)).sections.find((section) => section.heading === 'Travel'),
    ).toBeUndefined();
  });

  it('selects distinct current coast, cold and dry evidence without ordinary terrain hooks', () => {
    const source = fixture();
    source.facts.routes = source.facts.routes.slice(0, 1);
    source.settlements = source.settlements.slice(0, 2);
    source.map.nodes[0].isCoast = true;
    source.map.nodes[0].temperature = -5;
    source.map.nodes[1].temperature = 35;
    source.map.nodes[1].moisture = 0.1;
    const result = generate(source);
    const entry = travel(result).entries.find((entry) => entry.factId)!;
    expect(entry.body).toContain('coastal');
    expect(entry.body).toContain('exposure');
    expect(entry.body).toContain('water planning');
    expect(entry.hook).toBeUndefined();
    expect(regionGazetteerError(result.gazetteer, result)).toBeNull();
    const before = JSON.stringify(result);
    const spy = vi.spyOn(RNG.prototype, 'int');
    for (const text of [regionToMarkdown(result), regionToText(result)]) {
      expect(text).toContain(entry.body);
      expect(text).toContain(entry.heading);
    }
    expect(spy).not.toHaveBeenCalled();
    spy.mockRestore();
    expect(JSON.stringify(result)).toBe(before);
    const coastal = sentences(result).find((sentence) => sentence.candidateId.endsWith(':coast'))!;
    const cold = sentences(result).find((sentence) => sentence.candidateId.endsWith(':cold'))!;
    result.map.nodes[0].temperature = 5;
    const checker = editorialSentenceChecker(result);
    expect(checker(cold)).toBe(false);
    expect(checker(coastal)).toBe(true);
  });

  it('states a concern shared by all routes once and rechecks the whole route set', () => {
    const source = fixture();
    source.map.nodes.forEach((node) => {
      node.temperature = -5;
    });
    const result = generate(source);
    const cold = sentences(result).filter((sentence) => sentence.candidateId.endsWith(':cold'));
    expect(cold).toHaveLength(1);
    expect(cold[0].text).toContain('All saved road routes cross freezing country');
    expect(regionGazetteerError(result.gazetteer, result)).toBeNull();
    expect(
      travel(result)
        .entries.filter((entry) => entry.factId)
        .every((entry) => !entry.body),
    ).toBe(true);
    result.facts.routes.push({ ...structuredClone(result.facts.routes[0]), id: 'route:new' });
    expect(editorialSentenceChecker(result)(cold[0])).toBe(false);
  });

  it('saves one shared river detail and links other routes without duplicating prose', () => {
    const source = fixture();
    source.map.edges[0].river = 2;
    const result = generate(source);
    if (result.gazetteer?.version !== 5) throw new Error('Missing road plan');
    expect(
      sentences(result).filter((sentence) => sentence.assertionKeys.includes('road-river:10')),
    ).toHaveLength(1);
    expect(
      result.gazetteer.roadReadings.find((reading) => reading.routeId === 'route:b')
        ?.detailOwnerRouteId,
    ).toBe('route:a');
    const reference = travel(result).entries.find((entry) => entry.factId === 'route:b')!
      .references![0];
    expect(reference.anchorId).toBe('route-route%3Aa');
    expect(regionToMarkdown(result)).toContain(`](#${reference.anchorId})`);
    expect(regionToText(result)).toContain(reference.label);
    expect(regionGazetteerError(result.gazetteer, result)).toBeNull();
    const removed = removeRegionResourceFact(result, 'routes', 'route:a');
    expect(regionToText(removed)).not.toContain('Shared road–river detail');
    expect(regionGazetteerError(removed.gazetteer, removed)).toBeNull();
  });

  it('invalidates paths, endpoints and whole-network inventories independently', () => {
    const source = fixture();
    source.map.nodes[1].isCoast = true;
    const result = generate(source);
    const coastal = sentences(result).find((sentence) => sentence.candidateId.endsWith(':coast'))!;
    const groups = sentences(result).find((sentence) => sentence.candidateId.endsWith(':groups'))!;
    expect(editorialSentenceChecker(result)(coastal)).toBe(true);
    const observed = roadNetworkObservation(result);
    result.facts.routes[0].anchor.nodeIds.reverse();
    expect(observed.roads[0].anchor.nodeIds).toEqual([1, 2]);
    expect(editorialSentenceChecker(result)(coastal)).toBe(false);
    expect(editorialSentenceChecker(result)(groups)).toBe(false);
    const changed = withRegionOverviewEvidence(result);
    expect(regionGazetteerError(changed.gazetteer, changed)).toBeNull();
    const added = generate(source);
    added.facts.routes.push({ ...structuredClone(added.facts.routes[0]), id: 'route:parallel' });
    expect(editorialSentenceChecker(added)(groups)).toBe(false);
    expect(editorialSentenceChecker(added)(coastal)).toBe(true);
    const renamed = setRegionPlaceText(generate(source), 'settlements', 0, 'name', 'New Town');
    expect(travel(renamed).entries.some((entry) => entry.heading === 'New Town to Town 2')).toBe(
      true,
    );
  });

  it('preserves authored words and blanks exactly, including unresolved reference labels', () => {
    const result = generate(fixture());
    const authored = setRegionResourceFactText(
      setRegionResourceFactText(result, 'routes', 'route:a', 'name', 'the iPhone Road'),
      'routes',
      'route:a',
      'description',
      'My CASE. Hook: keep this choice.',
    );
    const entry = travel(authored).entries.find((entry) => entry.factId === 'route:a')!;
    expect(entry.heading).toBe('the iPhone Road');
    expect(entry.body).toBe('My CASE.');
    expect(entry.hook).toBe('keep this choice.');
    expect(travel(authored).entries.filter((entry) => entry.factId === 'route:a')).toHaveLength(1);
    const blank = setRegionResourceFactText(authored, 'routes', 'route:a', 'description', '');
    expect(travel(blank).entries.find((entry) => entry.factId === 'route:a')?.body).toBe('');
    const referenced = fixture();
    referenced.facts.routes[0].endpoints[1] = {
      kind: 'settlement',
      settlement: { kind: 'artifact', targetId: 'ref' },
    };
    const generated = generate(referenced);
    expect(travel(generated).entries.find((entry) => entry.factId === 'route:a')?.heading).toBe(
      'Town 1 to Referenced settlement',
    );
    const context = { ref: 'Referenced Town' };
    expect(regionToMarkdown(generated, context)).toContain('Town 1 to Referenced Town');
    expect(regionToText(generated, context)).toContain('Town 1 to Referenced Town');
    expect(roadNetworkObservation(generated).roads.some((road) => road.routeId === 'route:a')).toBe(
      false,
    );
  });

  it('links an eligible located suggestion once and retains it separately from route prose', () => {
    const source = fixture();
    source.map.nodes[0].temperature = -10;
    source.facts.notables = [
      {
        ...fact('notable:cold'),
        name: 'Cold travel country',
        kind: 'hazard',
        areaIds: [],
        anchor: { nodeIds: [1], edgeIds: [] },
        reason: {
          ruleId: 'fantasy:region:cold-travel:v1',
          status: 'current',
          sources: [{ kind: 'map-node', nodeId: 1, property: 'temperature', observedValue: '-10' }],
        },
      },
    ];
    const result = generate(source);
    if (result.gazetteer?.version !== 5) throw new Error('Missing plan');
    expect(
      result.gazetteer.roadReadings.filter((reading) => reading.promptNotableId === 'notable:cold'),
    ).toHaveLength(3);
    const entry = travel(result).entries.find((entry) => entry.factId === 'route:a')!;
    expect(entry.body).not.toContain('exposure');
    expect(entry.references?.[0].label).toBe('Suggested adventure: Cold travel country');
    expect(
      regionToUiDocument(result)
        .sections.flatMap((section) => section.entries)
        .filter((entry) => entry.hook),
    ).toHaveLength(1);
    expect(regionGazetteerError(result.gazetteer, result)).toBeNull();
    const removed = removeRegionResourceFact(result, 'notables', 'notable:cold');
    expect(regionToText(removed)).not.toContain('Suggested adventure: Cold travel country');
    expect(regionGazetteerError(removed.gazetteer, removed)).toBeNull();
  });

  it('keeps linked suggestions valid for persistence after a named settlement is renamed', () => {
    const source = rollRegionSnapshot('bravo');
    if (source.gazetteer?.version !== 5) throw new Error('Missing plan');
    const reading = source.gazetteer.roadReadings.find((reading) => reading.promptNotableId)!;
    expect(reading).toBeDefined();
    const notable = source.facts.notables.find((fact) => fact.id === reading.promptNotableId)!;
    const role = source.facts.settlementRoles.find((role) =>
      notable.reason?.sources.some((source) => source.kind === 'fact' && source.factId === role.id),
    )!;
    if (role.settlement.kind !== 'embedded') throw new Error('Missing embedded target');
    const id = role.settlement.settlementId;
    const renamed = setRegionPlaceText(
      source,
      'settlements',
      source.settlements.findIndex((entry) => entry.id === id),
      'name',
      'Renamed destination',
    );
    expect(regionGazetteerError(renamed.gazetteer, renamed)).toBeNull();
    expect(validateRegionSnapshot(renamed).ok).toBe(true);
    expect(regionToText(renamed)).not.toContain('Suggested adventure: Approach to Akrasal');
    expect(
      travel(renamed).entries.some((entry) => entry.heading.includes('Renamed destination')),
    ).toBe(true);
  });

  it('deduplicates overlapping climate evidence and retains independent evidence when a shared owner changes', () => {
    const source = fixture();
    source.map.nodes[0].temperature = -5;
    source.map.edges[0].river = 2;
    source.map.nodes[2].isCoast = true;
    const result = generate(source);
    expect(
      sentences(result).filter((sentence) => sentence.candidateId.endsWith(':cold')),
    ).toHaveLength(1);
    const coastal = sentences(result).find((sentence) => sentence.candidateId.endsWith(':coast'));
    result.map.edges[0].river = 0;
    const changed = withRegionOverviewEvidence(result);
    expect(regionGazetteerError(changed.gazetteer, changed)).toBeNull();
    expect(regionToText(changed)).not.toContain('Shared road–river detail');
    if (coastal) expect(editorialSentenceChecker(changed)(coastal)).toBe(true);
  });

  it('canonicalizes equivalent input and preserves earlier gazetteers without composition', () => {
    const source = fixture();
    source.map.edges[0].river = 2;
    const reversed = structuredClone(source);
    reversed.facts.routes.reverse();
    reversed.settlements.reverse();
    reversed.map.nodes.reverse();
    reversed.map.edges.reverse();
    expect(generate(reversed).gazetteer).toEqual(generate(source).gazetteer);
    for (const version of [1, 2, 3] as const) {
      const saved = structuredClone(historical);
      saved.gazetteer =
        version === 1
          ? { version, blocks: [] }
          : version === 2
            ? { version, blocks: [], landscapePlaces: [] }
            : { version, blocks: [], landscapePlaces: [], notableReadings: [] };
      const before = JSON.stringify(saved);
      const result = migrateRegionSnapshot(saved, 21);
      expect(result.ok).toBe(true);
      if (result.ok) expect(JSON.stringify(result.value)).toBe(before);
    }
  });

  it('rejects malformed paths, mixed destinations and unsupported ownership', () => {
    const source = fixture();
    source.map.edges[0].river = 2;
    const result = generate(source);
    if (result.gazetteer?.version !== 5) throw new Error('Missing plan');
    const facts = new Set(result.facts.routes.map((route) => route.id));
    expect(roadReadingsError(undefined, result, facts)).toBeTruthy();
    expect(roadReadingsError([{}], result, facts)).toBeTruthy();
    expect(
      roadObservationError({ kind: 'road-path', routeId: 'x', endpoints: [], anchor: {} }),
    ).toBeTruthy();
    expect(
      roadObservationError({ kind: 'road-network', settlementIds: ['b', 'a'], roads: [] }),
    ).toBeTruthy();
    const observed = observedRoad(result.facts.routes[0])!;
    expect(
      roadObservationError({
        kind: 'road-path',
        ...observed,
        anchor: { nodeIds: [1, 1], edgeIds: [10] },
      }),
    ).toBeTruthy();
    const copies = structuredClone(result.gazetteer);
    copies.roadReadings.push(copies.roadReadings[0]);
    expect(regionGazetteerError(copies, result)).toBeTruthy();
    const destination = structuredClone(result.gazetteer);
    const block = destination.blocks.find((block) => block.destination.routeId)!;
    block.destination.notableId = 'bad';
    expect(regionGazetteerError(destination, result)).toBeTruthy();
    const cycle = structuredClone(result.gazetteer);
    cycle.roadReadings[0].detailOwnerRouteId = 'route:b';
    expect(regionGazetteerError(cycle, result)).toBeTruthy();
    const prompt = structuredClone(result.gazetteer);
    prompt.roadReadings[0].promptNotableId = 'missing';
    expect(regionGazetteerError(prompt, result)).toBeTruthy();
    const nonroad = structuredClone(result);
    nonroad.facts.routes[0].kind = 'river';
    expect(regionGazetteerError(nonroad.gazetteer, nonroad)).toBeTruthy();
    expect(readableRoad(nonroad, nonroad.facts.routes[0])).toBe(false);
    expect(buildRoadReadings(nonroad)).toHaveLength(3);
    expect(roadReadingCandidates(fixture())).not.toEqual([]); // disconnected-network evidence only
  });
});
