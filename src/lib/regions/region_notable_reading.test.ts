import { describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';
import { gunzipSync } from 'node:zlib';
import { RNG } from '@ironarachne/rng';
import { migrateRegionSnapshot, validateRegionSnapshot } from './region_artifact_kind';
import { emptyRegionFacts } from './region_facts';
import { notableHeading, notableReading, notableLocation } from './region_notable_identity';
import { notableEditorialCandidates } from './region_notable_candidates';
import { regionGazetteerError } from './region_editorial_validation';
import { generateRegionGazetteer } from './region_editorial';
import { regionFromSnapshot } from './region_rehydrate';
import { toRegionSnapshot } from './region_snapshot';
import { regionToMarkdown, regionToText } from './region_presentation';
import { regionToUiDocument } from './region_ui_presentation';
import { setRegionPlaceText } from './region_editing';
import { setRegionResourceFactText, withRegionOverviewEvidence } from './region_resource_editing';
import type { NotableFact } from './region_fact_types';
import type { RegionSnapshot } from './region_snapshot';

const captured = JSON.parse(
  gunzipSync(
    readFileSync(new URL('../../../test_fixtures/region_445_belvorn.json.gz', import.meta.url)),
  ).toString(),
);
const migrated = migrateRegionSnapshot(captured, 14);
if (!migrated.ok) throw new Error(migrated.message);
const historical = migrated.value;
const approachId = 'landmark:settlement-approach:17:role:site:settlement:8';

function fixture() {
  const snapshot = structuredClone(historical);
  delete snapshot.gazetteer;
  delete snapshot.overviewReason;
  snapshot.description = '';
  snapshot.facts = emptyRegionFacts('current');
  snapshot.settlements = [
    {
      ...snapshot.settlements[0],
      id: 'settlement:1',
      snapshot: { ...snapshot.settlements[0].snapshot, name: 'Cilaamir', description: '' },
    },
  ];
  snapshot.map = {
    ...snapshot.map,
    width: 300,
    height: 300,
    nodes: [
      {
        ...snapshot.map.nodes[0],
        id: 1,
        center: { x: 30, y: 150 },
        neighbors: [],
        edges: [1],
        isWater: false,
        isOcean: false,
        elevation: 0.2,
        temperature: 10,
        moisture: 0.5,
      },
    ],
    edges: [{ ...snapshot.map.edges[0], id: 1, d0: 1, d1: 1, river: 2, road: 1 }],
    rivers: undefined,
  };
  snapshot.facts.settlementRoles = [
    {
      id: 'role:site:settlement:1',
      name: 'River settlement',
      description: 'A settlement by the river.',
      origin: 'generated',
      settlement: { kind: 'embedded', settlementId: 'settlement:1' },
      areaIds: [],
      anchor: { nodeIds: [1], edgeIds: [1] },
      reason: {
        ruleId: 'fantasy:region:river-settlement:v1',
        status: 'current',
        sources: [{ kind: 'map-edge', edgeId: 1, property: 'river', observedValue: '2' }],
      },
    },
  ];
  snapshot.facts.notables = [
    {
      id: 'approach:1',
      kind: 'landmark',
      name: 'River settlement approach',
      description: 'Saved approach. Hook: Preserve this old hook.',
      origin: 'generated',
      areaIds: [],
      anchor: { nodeIds: [1], edgeIds: [1] },
      reason: {
        ruleId: 'fantasy:region:settlement-approach:v1',
        status: 'current',
        sources: [{ kind: 'fact', factId: 'role:site:settlement:1' }],
      },
    },
  ];
  return snapshot;
}
function generate(snapshot: RegionSnapshot, seed = '447') {
  const region = regionFromSnapshot(snapshot, new RNG('restore'));
  delete region.gazetteer;
  generateRegionGazetteer(region, new RNG(seed));
  return toRegionSnapshot(region);
}
function hazard(snapshot: RegionSnapshot, rule: string, name: string): NotableFact {
  return {
    id: `hazard:${rule}`,
    kind: 'hazard',
    name,
    description: 'Saved description.',
    origin: 'generated',
    areaIds: [],
    anchor: { nodeIds: [1], edgeIds: [] },
    reason: {
      ruleId: `fantasy:region:${rule}:v1`,
      status: 'current',
      sources: [
        {
          kind: 'map-node',
          nodeId: 1,
          property: rule === 'high-ground-obstacle' ? 'elevation' : 'temperature',
          observedValue: String(
            rule === 'high-ground-obstacle'
              ? snapshot.map.nodes[0].elevation
              : snapshot.map.nodes[0].temperature,
          ),
        },
      ],
    },
  };
}

describe('notable identities and saved suggestions (#447)', () => {
  it('resolves the historical Cilaamir chain and preserves source wording in legacy reading and exports', () => {
    const snapshot = structuredClone(historical);
    const fact = snapshot.facts.notables.find((entry) => entry.id === approachId)!;
    const before = structuredClone(snapshot);
    expect(notableHeading(snapshot, fact)).toBe('Approach to Cilaamir');
    expect(notableLocation(snapshot, fact)).toBe('western region');
    expect(regionToMarkdown(snapshot)).toContain('Approach to Cilaamir');
    expect(regionToText(snapshot)).toContain('Approach to Cilaamir');
    expect(
      regionToUiDocument(snapshot)
        .sections.flatMap((section) => section.entries)
        .find((entry) => entry.factId === fact.id)?.heading,
    ).toBe('Approach to Cilaamir');
    expect(regionToMarkdown(snapshot)).toContain(fact.description.split(' Hook:')[0]);
    expect(snapshot).toEqual(before);
    const forestAlias = snapshot.facts.notables.find(
      (entry) => entry.reason?.ruleId === 'fantasy:region:dense-forest-landmark:v1',
    )!;
    const source = forestAlias.reason!.sources.find((entry) => entry.kind === 'fact')!;
    if (source.kind !== 'fact') throw new Error('Missing forest source');
    const entries = regionToUiDocument(snapshot).sections.flatMap((section) => section.entries);
    expect(
      entries.filter((entry) => entry.factId === source.factId || entry.factId === forestAlias.id),
    ).toHaveLength(1);
  });

  it('refuses stale, ambiguous, misplaced and unknown approach bindings and resolves explicit artifact context', () => {
    const snapshot = fixture();
    const fact = snapshot.facts.notables[0];
    snapshot.facts.settlementRoles[0].settlement = { kind: 'artifact', targetId: 'toString' };
    expect(notableHeading(snapshot, fact)).toBe('Settlement approach');
    snapshot.facts.settlementRoles[0].settlement = { kind: 'artifact', targetId: 'linked' };
    expect(notableHeading(snapshot, fact)).toBe('Settlement approach');
    expect(notableHeading(snapshot, fact, { linked: 'New Name' })).toBe('Approach to New Name');
    expect(regionToMarkdown(snapshot, { linked: 'New Name' })).toContain('Approach to New Name');
    fact.reason!.status = 'stale';
    expect(notableHeading(snapshot, fact, { linked: 'New Name' })).toBe('Settlement approach');
    fact.reason!.status = 'current';
    fact.reason!.sources.push({ kind: 'fact', factId: 'role:site:settlement:1' });
    expect(notableHeading(snapshot, fact)).toBe('Settlement approach');
    fact.reason!.sources.pop();
    fact.anchor!.nodeIds = [99];
    expect(notableHeading(snapshot, fact)).toBe('Settlement approach');
    fact.reason!.ruleId = 'fantasy:region:settlement-approach:v2';
    expect(notableHeading(snapshot, fact)).toBe(fact.name);
    fact.reason!.ruleId = 'unknown';
    expect(notableHeading(snapshot, fact)).toBe(fact.name);
  });

  it('saves a concrete passage choice separately and shares it and its location across UI/Markdown/PDF text', () => {
    const source = fixture();
    const before = structuredClone(source);
    const snapshot = generate(source);
    if (snapshot.gazetteer?.version !== 3) throw new Error('Missing v3 plan');
    const reading = snapshot.gazetteer.notableReadings.find(
      (entry) => entry.notableId === 'approach:1',
    )!;
    expect(reading.prompt?.familyId).toBe('passage');
    expect(reading.prompt?.sentence.text).toMatch(/Cilaamir/);
    expect(reading.prompt?.sentence.text).toMatch(/turn back/);
    expect(reading.prompt?.sentence.reason.ruleId).toBe(
      'fantasy:region:adventure-prompt:passage:v1',
    );
    expect(snapshot.facts).toEqual(before.facts);
    expect(regionGazetteerError(snapshot.gazetteer, snapshot)).toBeNull();
    const entry = regionToUiDocument(snapshot)
      .sections.flatMap((section) => section.entries)
      .find((entry) => entry.factId === 'approach:1')!;
    expect(entry).toMatchObject({
      heading: 'Approach to Cilaamir',
      location: 'western region',
      hookHeading: 'Suggested adventure',
      hook: reading.prompt!.sentence.text,
    });
    expect(regionToMarkdown(snapshot)).toContain(entry.hook);
    expect(regionToText(snapshot)).toContain(entry.hook);
    expect(regionToMarkdown(snapshot)).toContain('Location: western region');
    const sections = regionToUiDocument(snapshot).sections.map((section) => section.heading);
    expect(sections.indexOf('Notable places')).toBeLessThan(sections.indexOf('Settlements'));
    expect(toRegionSnapshot(regionFromSnapshot(snapshot, new RNG('reopen')))).toEqual(snapshot);
    expect(source).toEqual(before);
  });

  it('retains the current identity after rename, suppresses old named prose and never replaces a stale hook', () => {
    const snapshot = generate(fixture());
    const renamed = setRegionPlaceText(snapshot, 'settlements', 0, 'name', 'New Cilaamir');
    const entries = regionToUiDocument(renamed).sections.flatMap((section) => section.entries);
    expect(entries.some((entry) => entry.heading === 'Approach to New Cilaamir')).toBe(true);
    expect(entries.find((entry) => entry.factId === 'approach:1')?.hook).toBeUndefined();
    expect(regionToMarkdown(renamed)).not.toContain('Approach to Cilaamir');
    expect(snapshot.facts.notables[0].description).toBe(renamed.facts.notables[0].description);
    const removed = structuredClone(snapshot);
    removed.settlements = [];
    expect(regionToMarkdown(removed)).not.toContain('Approach to Cilaamir');
    const moved = structuredClone(snapshot);
    moved.facts.notables[0].anchor!.nodeIds = [];
    expect(regionToMarkdown(withRegionOverviewEvidence(moved))).not.toContain(
      'Suggested adventure',
    );
  });

  it('preserves authored hooks and blank overrides without generated substitutes', () => {
    const snapshot = generate(fixture());
    const edited = setRegionResourceFactText(
      snapshot,
      'notables',
      'approach:1',
      'description',
      'My words. Hook: My adventure.',
    );
    const text = regionToMarkdown(edited);
    expect(text).toContain('My words.');
    expect(text).toContain('My adventure.');
    expect(text).toContain('#### Authored adventure');
    expect(text).not.toContain('assess passage');
    const blank = setRegionResourceFactText(snapshot, 'notables', 'approach:1', 'description', '');
    expect(regionToMarkdown(blank)).not.toContain('Suggested adventure');
  });

  it('requires a consequential relationship and omits ordinary forest, riverbank and monster-presence hooks', () => {
    const snapshot = fixture();
    snapshot.map.edges[0].road = 0;
    expect(notableEditorialCandidates(snapshot).prompts).toEqual([]);
    snapshot.facts.notables[0].reason!.ruleId = 'fantasy:region:habitat-study:v1';
    expect(notableEditorialCandidates(snapshot).descriptions).toEqual([]);
  });

  it('varies concrete decision families across mineral, cold, high-ground and gathering fixtures', () => {
    const cold = fixture();
    cold.map.nodes[0].temperature = -10;
    cold.facts.notables = [hazard(cold, 'cold-travel', 'Cold travel country')];
    expect(notableEditorialCandidates(cold).prompts[0].familyId).toBe('exposure');
    const high = fixture();
    high.map.nodes[0].elevation = 0.8;
    high.facts.notables = [hazard(high, 'high-ground-obstacle', 'High-ground traverse')];
    expect(notableEditorialCandidates(high).prompts[0].familyId).toBe('terrain-passage');
    const mineral = fixture();
    const source: import('./region_raw_source_types').ResourceSourceFact = {
      id: 'source:1',
      name: 'Copper outcrop',
      description: 'A collection opportunity.',
      origin: 'generated',
      definitionId: 'copper',
      resource: {
        id: 'copper',
        name: 'copper',
        majorType: 'mineral',
        minorType: 'ore',
        uses: ['industrial'],
        food: { kind: 'not-food' },
      },
      source: { kind: 'deposit', depositId: 'deposit:1' },
      method: 'mining',
      requirements: ['digging tools'],
      availability: 'limited',
      areaIds: [],
      habitatIds: [],
      anchor: { nodeIds: [1], edgeIds: [] },
      waterSources: [],
      reason: { ruleId: 'fixture:v1', status: 'current', sources: [] },
    };
    source.id = 'source:1';
    source.name = 'Copper outcrop';
    source.requirements = ['digging tools'];
    source.anchor = { nodeIds: [1], edgeIds: [] };
    source.reason = { ruleId: 'fixture-source:v1', status: 'current', sources: [] };
    mineral.facts.resourceSources = [source];
    mineral.facts.notables[0].reason = {
      ruleId: 'fantasy:region:resource-reach:v1',
      status: 'current',
      sources: [{ kind: 'fact', factId: source.id }],
    };
    expect(notableEditorialCandidates(mineral).prompts[0].familyId).toBe('collection-requirement');
    const gathering = fixture();
    const inhabitant = structuredClone(historical.facts.ecologyInhabitants[0]);
    inhabitant.id = 'inhabitant:1';
    inhabitant.name = 'crocodile';
    inhabitant.reason = { ruleId: 'fixture:v1', status: 'current', sources: [] };
    const use: import('./region_ecology_types').EcologyRelationshipFact = {
      id: 'use:1',
      name: 'Reed gathering',
      description: 'Gathering reeds.',
      origin: 'generated',
      subjectId: 'reed:1',
      habitatIds: [],
      relation: {
        kind: 'used-by',
        settlement: { kind: 'embedded', settlementId: 'settlement:1' },
        use: 'material',
      },
      reason: { ruleId: 'fixture:v1', status: 'current', sources: [] },
    };
    use.id = 'use:1';
    use.reason = { ruleId: 'fixture:v1', status: 'current', sources: [] };
    gathering.facts.ecologyInhabitants = [inhabitant];
    gathering.facts.ecologyRelationships = [use];
    gathering.facts.notables[0].reason = {
      ruleId: 'fantasy:region:ecology-bank-gathering:v1',
      status: 'current',
      sources: [
        { kind: 'fact', factId: use.id },
        { kind: 'fact', factId: inhabitant.id },
      ],
    };
    expect(notableEditorialCandidates(gathering).prompts[0].familyId).toBe('harvest-risk');
    const suggestions = [cold, high, mineral, gathering]
      .map((entry) => generate(entry).gazetteer)
      .flatMap((gazetteer) =>
        gazetteer?.version === 3
          ? gazetteer.notableReadings.flatMap((reading) =>
              reading.prompt ? [reading.prompt.sentence.text] : [],
            )
          : [],
      );
    expect(suggestions).toHaveLength(4);
    expect(new Set(suggestions).size).toBe(4);
  });

  it('selects deterministically across input permutations with at most two distinct prompt families', () => {
    const source = fixture();
    source.map.nodes[0].elevation = 0.8;
    source.facts.notables.push(hazard(source, 'high-ground-obstacle', 'High-ground traverse'));
    const first = generate(source);
    const reversed = structuredClone(source);
    reversed.facts.notables.reverse();
    reversed.map.nodes.reverse();
    reversed.map.edges.reverse();
    expect(generate(reversed).gazetteer).toEqual(first.gazetteer);
    source.map.edges.push({ ...source.map.edges[0], id: 2, river: 3 });
    source.facts.notables[0].anchor!.edgeIds.push(2);
    const reordered = structuredClone(source);
    reordered.map.edges.reverse();
    expect(generate(source).gazetteer).toEqual(generate(reordered).gazetteer);
    if (first.gazetteer?.version !== 3) throw new Error('Missing plan');
    const prompts = first.gazetteer.notableReadings.flatMap((reading) =>
      reading.prompt ? [reading.prompt] : [],
    );
    expect(prompts).toHaveLength(2);
    expect(new Set(prompts.map((prompt) => prompt.familyId)).size).toBe(2);
    const variants = new Set(
      Array.from({ length: 8 }, (_, i) => JSON.stringify(generate(source, String(i)).gazetteer)),
    );
    expect(variants.size).toBeGreaterThan(1);
  });

  it('rejects malformed identities, invented suggestions and duplicate records; preserves version-19 payloads', () => {
    const snapshot = generate(fixture());
    if (snapshot.gazetteer?.version !== 3) throw new Error('Missing plan');
    const original = snapshot.gazetteer;
    const invented = structuredClone(original);
    invented.notableReadings[0].prompt!.sentence.text =
      'A patron hired you to cross the ancient bridge.';
    expect(regionGazetteerError(invented, snapshot)).toBe('unsupported notable prompt content');
    const duplicate = structuredClone(original);
    duplicate.notableReadings.push(duplicate.notableReadings[0]);
    expect(regionGazetteerError(duplicate, snapshot)).not.toBeNull();
    const bad = structuredClone(original);
    bad.notableReadings[0].subject = {
      kind: 'settlement',
      target: { kind: 'embedded', settlementId: 'missing' },
    };
    expect(regionGazetteerError(bad, snapshot)).toBe('unsupported notable subject binding');
    const old = structuredClone(historical);
    old.gazetteer = { version: 2, blocks: [], landscapePlaces: [] };
    expect(migrateRegionSnapshot(old, 19)).toMatchObject({ ok: true, value: old });
    expect(validateRegionSnapshot(generate(historical))).toMatchObject({ ok: true });
    expect(notableReading(fixture(), fixture().facts.notables[0]).notableId).toBe('approach:1');
  });
});
