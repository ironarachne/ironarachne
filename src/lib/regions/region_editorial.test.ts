import { regionSemanticFactLists } from './region_fact_lists';
import { readFileSync } from 'node:fs';
import { gunzipSync } from 'node:zlib';
import { describe, expect, it, vi } from 'vitest';
import { RNG } from '@ironarachne/rng';
import { rollRegionSnapshot } from './region_roll';
import { regionFromSnapshot } from './region_rehydrate';
import { toRegionSnapshot } from './region_snapshot';
import { emptyRegionFacts } from './region_facts';
import {
  composeRegionGazetteer,
  generateRegionGazetteer,
  regionEditorialCandidates,
  editorialSentenceCount,
} from './region_editorial';
import {
  editorialSentenceChecker,
  populationObservation,
  roadObservation,
} from './region_editorial_evidence';
import { regionGazetteerError } from './region_editorial_validation';
import {
  migrateRegionSnapshot,
  validateRegionSnapshot,
  REGION_PAYLOAD_VERSION,
} from './region_artifact_kind';
import { regionToDocument, regionToMarkdown, regionToText } from './region_presentation';
import { regionToUiDocument } from './region_ui_presentation';
import { setRegionText, setRegionPlaceText } from './region_editing';
import { setRegionResourceFactText, removeRegionResourceFact } from './region_resource_editing';
import type { RegionEditorialCandidate } from './region_editorial_types';
import type { FactBase } from './region_fact_types';

const base = rollRegionSnapshot('445-fixture');
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
function fixture(count = 4) {
  const snapshot = structuredClone(base);
  delete snapshot.gazetteer;
  delete snapshot.overviewReason;
  snapshot.description = '';
  snapshot.facts = emptyRegionFacts('current');
  snapshot.settlements = Array.from({ length: count }, (_, i) => ({
    ...structuredClone(base.settlements[0]),
    id: `town:${i + 1}`,
    snapshot: {
      ...structuredClone(base.settlements[0].snapshot),
      name: `Town ${i + 1}`,
      mapNodeId: i + 1,
      population: i === 0 ? 1000 : 100,
      description: '',
    },
  }));
  snapshot.map.nodes = Array.from({ length: Math.max(count, 1) }, (_, i) => ({
    ...base.map.nodes[0],
    id: i + 1,
    isWater: false,
    isOcean: false,
    biomeId: 'temperate deciduous forest',
    neighbors: [],
  }));
  snapshot.map.edges = Array.from({ length: count - 1 }, (_, i) => ({
    ...base.map.edges[0],
    id: i + 10,
    d0: 1,
    d1: i + 2,
    road: 1,
    river: 0,
  }));
  snapshot.map.rivers = undefined;
  snapshot.facts.areas = [
    {
      ...fact('area:land', 'Land'),
      description: 'Woodland covers this country.',
      mapNodeIds: snapshot.map.nodes.map((node) => node.id),
    },
  ];
  snapshot.facts.settlementRoles = snapshot.settlements.map((entry, index) => ({
    ...fact(`role:${index}`, 'Woodland site'),
    settlement: { kind: 'embedded', settlementId: entry.id },
    areaIds: ['area:land'],
    anchor: { nodeIds: [index + 1], edgeIds: [] },
  }));
  snapshot.facts.routes = snapshot.map.edges.map((edge, index) => ({
    ...fact(`route:${index}`, 'Road'),
    kind: 'road',
    description: '',
    areaIds: ['area:land'],
    anchor: { nodeIds: [1, index + 2], edgeIds: [edge.id] },
    endpoints: [
      { kind: 'settlement', settlement: { kind: 'embedded', settlementId: 'town:1' } },
      { kind: 'settlement', settlement: { kind: 'embedded', settlementId: `town:${index + 2}` } },
    ],
  }));
  return regionFromSnapshot(snapshot, new RNG('fixture'));
}
function candidate(
  id: string,
  importance: RegionEditorialCandidate['narrative']['importance'],
  subject = id,
  topic = 'material',
): RegionEditorialCandidate {
  return {
    narrative: {
      id,
      topic,
      importance,
      sourceIds: ['area:land'],
      templates: [
        {
          id: `meaning:${id}`,
          parts: [{ id: 'sentence', options: [`${id} is present.`, `Here is ${id}.`] }],
        },
      ],
    },
    subjectKey: subject,
    assertionKeys: [id],
    destinations: [{ section: 'materials-work' }],
    priority: {
      residentConsequence: false,
      connectsSubjects: false,
      locatedDetail: true,
      peerSupportCount: 1,
    },
    sources: [{ kind: 'fact', factId: 'area:land' }],
    observations: [],
  };
}
const allSentences = (region: ReturnType<typeof fixture>) =>
  region.gazetteer!.blocks.flatMap((block) => block.sentences);

describe('coordinated regional editorial policy', () => {
  it('prioritizes supported meanings, independent of IDs, array order and wording pool size', () => {
    const ordinary = candidate('aaa-basalt', 'supporting', 'place');
    const strong = candidate('zzz-diamond', 'distinctive', 'place');
    const first = composeRegionGazetteer([ordinary, strong], new RNG('meaning'));
    const reversed = composeRegionGazetteer([strong, ordinary], new RNG('meaning'));
    expect(first).toEqual(reversed);
    expect(first.gazetteer.blocks[0].sentences.map((sentence) => sentence.candidateId)).toEqual([
      'zzz-diamond',
    ]);
    const moreWords = structuredClone(strong);
    moreWords.narrative.templates[0].parts[0].options.push('Another expression of diamond.');
    expect(
      composeRegionGazetteer([ordinary, moreWords], new RNG('meaning')).gazetteer.blocks[0]
        .sentences[0].candidateId,
    ).toBe('zzz-diamond');
  });
  it('respects entry, local, topic and paragraph budgets without padding', () => {
    const pool = Array.from({ length: 80 }, (_, i) => ({
      ...candidate(`candidate:${i}`, 'distinctive', `town:${i}`, `topic:${Math.floor(i / 16)}`),
      destinations: [
        {
          section: 'settlement' as const,
          settlement: { kind: 'embedded' as const, settlementId: `town:${i % 16}` },
        },
      ],
    }));
    const result = composeRegionGazetteer(pool, new RNG('budgets'));
    expect(result.gazetteer.blocks.flatMap((block) => block.sentences).length).toBe(24);
    for (const block of result.gazetteer.blocks)
      expect(block.sentences.length).toBeLessThanOrEqual(3);
    expect(composeRegionGazetteer([], new RNG('empty')).gazetteer.blocks).toEqual([]);
    expect(
      composeRegionGazetteer([candidate('texture', 'supporting')], new RNG('empty')).gazetteer
        .blocks,
    ).toEqual([]);
  });
  it('threads deterministic batch repetition context, and varies equal supported focus', () => {
    const pool = [candidate('first', 'distinctive'), candidate('second', 'distinctive')];
    const first = composeRegionGazetteer(pool, new RNG('batch'));
    const second = composeRegionGazetteer(pool, new RNG('batch'), first.nextContext);
    expect(second.gazetteer.blocks[0].sentences[0].candidateId).not.toBe(
      first.gazetteer.blocks[0].sentences[0].candidateId,
    );
    expect(composeRegionGazetteer(pool, new RNG('batch'), first.nextContext)).toEqual(second);
    expect(
      new Set(
        Array.from(
          { length: 16 },
          (_, i) =>
            composeRegionGazetteer(pool, new RNG(String(i))).gazetteer.blocks[0].sentences[0]
              .candidateId,
        ),
      ).size,
    ).toBe(2);
  });
  it.each([
    ['coastal', 'fantasy:region:coastal-port-site:v1', /coast|sea/],
    ['forest', 'fantasy:region:forest-settlement:v1', /woodland|forest/],
  ] as const)(
    'chooses a supported %s site relationship without inventing local work',
    (_kind, ruleId, expected) => {
      const region = fixture(1);
      region.facts!.settlementRoles[0].reason!.ruleId = ruleId;
      if (_kind === 'coastal') {
        region.map.nodes[0].isCoast = true;
        region.map.nodes[0].neighbors = [2];
        region.map.nodes.push({
          ...region.map.nodes[0],
          id: 2,
          isOcean: true,
          isWater: true,
          isCoast: false,
        });
        region.facts!.settlementRoles[0].reason!.sources.push(
          { kind: 'map-node', nodeId: 1, property: 'isCoast', observedValue: 'true' },
          { kind: 'map-node', nodeId: 2, property: 'isOcean', observedValue: 'true' },
        );
      }
      generateRegionGazetteer(region, new RNG('site'));
      expect(
        allSentences(region)
          .map((sentence) => sentence.text)
          .join(' '),
      ).toMatch(expected);
      expect(
        allSentences(region)
          .map((sentence) => sentence.text)
          .join(' '),
      ).not.toMatch(/trade|exports|harbour|logging industry/);
    },
  );
  it('keeps a named forest relationship and suppresses its generic woodland-site duplicate', () => {
    const region = fixture(1);
    region.facts!.settlementRoles[0].reason!.ruleId = 'fantasy:region:forest-settlement:v1';
    region.facts!.denseForests = [{ ...fact('forest:dense:1', 'The Greenwood'), mapNodeIds: [1] }];
    generateRegionGazetteer(region, new RNG('forest'));
    expect(
      allSentences(region)
        .map((sentence) => sentence.text)
        .join(' '),
    ).toContain('The Greenwood');
    const assertions = allSentences(region).flatMap((sentence) => sentence.assertionKeys);
    expect(assertions.filter((key) => key === 'woodland-site:town:1')).toHaveLength(1);
  });
  it('compares supported fantastical use with mundane alternatives without an eligibility draw', () => {
    const region = fixture(1);
    region.facts!.habitats = [
      {
        ...fact('habitat:forest', 'temperate deciduous forest'),
        areaIds: ['area:land'],
        anchor: { nodeIds: [1], edgeIds: [] },
      },
    ];
    region.facts!.ecologyInhabitants = [
      {
        ...fact('inhabitant:owlbear', 'owlbear'),
        category: 'fantastical',
        roles: ['predator'],
        source: { kind: 'described', label: 'owlbear' },
        habitatIds: ['habitat:forest'],
      },
    ];
    region.facts!.ecologyRelationships = [
      {
        ...fact('ecology:use', 'Owlbear material use'),
        subjectId: 'inhabitant:owlbear',
        habitatIds: ['habitat:forest'],
        relation: {
          kind: 'used-by',
          settlement: { kind: 'embedded', settlementId: 'town:1' },
          use: 'material',
        },
      },
    ];
    const pool = regionEditorialCandidates(region);
    expect(
      pool.find((entry) => entry.narrative.id === 'editorial:ecology:ecology:use')?.narrative
        .importance,
    ).toBe('distinctive');
    for (let index = 0; index < 12; index++) {
      const result = composeRegionGazetteer(pool, new RNG(String(index)));
      expect(
        result.gazetteer.blocks
          .flatMap((block) => block.sentences)
          .some((sentence) => sentence.text.includes('owlbear')),
      ).toBe(true);
    }
  });
  it('resolves a hub from valid distinct neighbours and keeps complete comparative evidence', () => {
    const region = fixture();
    generateRegionGazetteer(region, new RNG('hub'));
    expect(region.description).toContain('road hub');
    expect(region.description).toContain('largest');
    const snapshot = toRegionSnapshot(region);
    expect(regionGazetteerError(snapshot.gazetteer, snapshot)).toBeNull();
    const checker = editorialSentenceChecker(snapshot);
    expect(allSentences(region).every(checker)).toBe(true);
    const hub = allSentences(region).find((sentence) => sentence.candidateId.includes(':hub:'))!;
    expect(hub.observations[0]).toMatchObject({ neighbourIds: ['town:2', 'town:3', 'town:4'] });
    const changed = structuredClone(snapshot);
    changed.map.edges[0].road = 0;
    expect(editorialSentenceChecker(changed)(hub)).toBe(false);
    const larger = structuredClone(snapshot);
    larger.settlements[1].snapshot.population = 2000;
    const size = allSentences(region).find((sentence) =>
      sentence.candidateId.includes(':largest:'),
    )!;
    expect(editorialSentenceChecker(larger)(size)).toBe(false);
    expect(editorialSentenceChecker(larger)(hub)).toBe(true);
    const added = structuredClone(snapshot);
    added.facts.routes.push({ ...structuredClone(added.facts.routes[0]), id: 'route:added' });
    expect(editorialSentenceChecker(added)(hub)).toBe(false);
    const morePlaces = structuredClone(snapshot);
    morePlaces.settlements.push({
      ...structuredClone(snapshot.settlements[0]),
      id: 'town:new',
      snapshot: { ...snapshot.settlements[0].snapshot, population: 5000 },
    });
    expect(editorialSentenceChecker(morePlaces)(size)).toBe(false);
  });
  it('omits unique size claims on ties and does not mistake parallel roads for extra neighbours', () => {
    const region = fixture(3);
    region.settlements[0].population = region.settlements[1].population;
    region.facts!.routes.push({ ...region.facts!.routes[0], id: 'route:parallel' });
    const pool = regionEditorialCandidates(region);
    expect(pool.some((entry) => entry.narrative.id.includes(':largest:'))).toBe(false);
    expect(pool.some((entry) => entry.narrative.id.includes(':hub:'))).toBe(false);
    expect(roadObservation(toRegionSnapshot(region), 'town:1')).toMatchObject({
      neighbourIds: ['town:2', 'town:3'],
    });
    expect(populationObservation(toRegionSnapshot(region)).kind).toBe('settlement-populations');
    const unresolved = fixture(5);
    unresolved.settlements[4].name = '';
    generateRegionGazetteer(unresolved, new RNG('unresolved-comparison'));
    expect(regionGazetteerError(unresolved.gazetteer, toRegionSnapshot(unresolved))).toBeNull();
  });
  it('omits stale/cyclic evidence and does not regenerate paragraphs while reading', () => {
    const region = fixture(1);
    region.organizations = [];
    region.settlements[0].category.name = 'unknown category';
    region.settlements[0].lawAndOrder = 5;
    generateRegionGazetteer(region, new RNG('sparse'));
    expect(allSentences(region)).toHaveLength(1);
    const snapshot = toRegionSnapshot(region);
    const before = structuredClone(snapshot);
    const spy = vi.spyOn(RNG.prototype, 'int');
    const text = regionToText(snapshot);
    expect(text).toContain('Woodland covers this country.');
    expect(regionToMarkdown(snapshot)).toContain('Woodland covers this country.');
    expect(regionToUiDocument(snapshot).paragraphs).toEqual(regionToDocument(snapshot).paragraphs);
    expect(spy).not.toHaveBeenCalled();
    spy.mockRestore();
    expect(snapshot).toEqual(before);
    snapshot.facts.areas[0].reason!.status = 'stale';
    expect(regionToDocument(snapshot).paragraphs).toEqual([]);
    snapshot.facts.areas[0].reason = {
      ...reason,
      sources: [{ kind: 'fact', factId: 'area:land' }],
    };
    expect(regionToDocument(snapshot).paragraphs).toEqual([]);
  });
  it('retains authored overrides and intentional blanks without touching saved words', () => {
    const region = fixture(1);
    generateRegionGazetteer(region, new RNG('authored'));
    const snapshot = toRegionSnapshot(region);
    const authored = structuredClone(snapshot);
    authored.facts.areas[0].origin = 'authored';
    authored.facts.areas[0].description = 'My woodland.';
    expect(regionToText(authored)).toContain('My woodland.');
    expect(regionToText(authored)).not.toContain('Woodland covers');
    const blank = structuredClone(authored);
    blank.facts.areas[0].description = '';
    expect(regionToText(blank)).not.toContain('Woodland covers');
    expect(regionToDocument(setRegionText(snapshot, 'description', '')).paragraphs).toEqual([]);
    expect(
      regionToDocument(setRegionText(snapshot, 'description', 'My opening.')).paragraphs,
    ).toEqual(['My opening.']);
    const named = setRegionPlaceText(snapshot, 'settlements', 0, 'description', 'My village.');
    expect(regionToText(named)).toContain('My village.');
    expect(authored.gazetteer).toEqual(snapshot.gazetteer);
  });
  it('invalidates selected provenance through the existing source editors and removal path', () => {
    const region = fixture();
    generateRegionGazetteer(region, new RNG('edit-provenance'));
    const snapshot = toRegionSnapshot(region);
    const size = allSentences(region).find((sentence) =>
      sentence.candidateId.includes(':largest:'),
    )!;
    const authored = setRegionResourceFactText(
      snapshot,
      'settlementRoles',
      'role:0',
      'description',
      'My woodland site.',
    );
    expect(regionToText(authored)).toContain('My woodland site.');
    expect(regionToText(authored)).not.toContain(size.text);
    const removed = removeRegionResourceFact(snapshot, 'settlementRoles', 'role:0');
    expect(removed.facts.settlementRoles.some((fact) => fact.id === 'role:0')).toBe(false);
    expect(regionToText(removed)).not.toContain(size.text);
    expect(regionGazetteerError(removed.gazetteer, removed)).toBeNull();
    expect(
      removed
        .gazetteer!.blocks.flatMap((block) => block.sentences)
        .map((sentence) => sentence.text),
    ).toEqual(allSentences(region).map((sentence) => sentence.text));
  });
  it('converts a saved gazetteer through reactive proxies without cloning the proxy itself', () => {
    const snapshot = rollRegionSnapshot('445-reactive-proxy');
    const proxied = { ...snapshot, gazetteer: new Proxy(snapshot.gazetteer!, {}) };
    const region = regionFromSnapshot(proxied, new RNG('load'));
    const restored = toRegionSnapshot(region);
    expect(restored.gazetteer).toEqual(snapshot.gazetteer);
    expect(() => structuredClone(restored)).not.toThrow();
    expect(restored.gazetteer).not.toBe(proxied.gazetteer);
  });
  it('round trips version 20 and migrates version 17 without creating editorial prose', () => {
    const snapshot = rollRegionSnapshot('445-persistence');
    expect(REGION_PAYLOAD_VERSION).toBe(24);
    expect(validateRegionSnapshot(snapshot)).toMatchObject({ ok: true });
    expect(toRegionSnapshot(regionFromSnapshot(snapshot, new RNG('restore'))).gazetteer).toEqual(
      snapshot.gazetteer,
    );
    const historical = structuredClone(snapshot);
    delete historical.gazetteer;
    expect(migrateRegionSnapshot(historical, 17)).toMatchObject({ ok: true, value: historical });
    expect(historical.gazetteer).toBeUndefined();
    const malformed = structuredClone(snapshot);
    malformed.gazetteer!.blocks[0].sentences[0].selection.optionIndexes = [-1];
    expect(validateRegionSnapshot(malformed).ok).toBe(false);
    expect(regionGazetteerError({ version: 2, blocks: [] }, snapshot)).not.toBeNull();
  });

  it('foregrounds the verified historical Belvorn hub, woodland, minerals and fantastical presence', () => {
    const captured = JSON.parse(
      gunzipSync(
        readFileSync(new URL('../../../test_fixtures/region_445_belvorn.json.gz', import.meta.url)),
      ).toString(),
    );
    const migrated = migrateRegionSnapshot(captured, 14);
    if (!migrated.ok) throw new Error(migrated.message);
    const region = regionFromSnapshot(migrated.value, new RNG('restore-belvorn'));
    const before = structuredClone(region.facts);
    expect(region.name).toBe('the Woods of Belvorn');
    generateRegionGazetteer(region, new RNG('historical-445'));
    expect(region.description).toMatch(/Revilun.*road hub/);
    expect(region.description).toContain('largest');
    expect(region.description).toMatch(/woodland/);
    const sentences = allSentences(region);
    const prose = sentences.map((sentence) => sentence.text).join(' ');
    expect(prose).toMatch(/diamond/);
    expect(prose).toMatch(/copper/);
    expect(prose).toContain('owlbear');
    expect(prose.match(/bear meat/g)?.length ?? 0).toBeLessThan(7);
    expect(region.facts).toEqual(before);
    expect(sentences.every(editorialSentenceChecker(toRegionSnapshot(region)))).toBe(true);
  });
  it('keeps source data unchanged, deterministic across input ordering and bounded across a seed corpus', () => {
    for (const seed of ['alpha', 'bravo', 'charlie', 'foxtrot', '5wyedz5q272fz']) {
      const saved = rollRegionSnapshot(seed);
      const region = regionFromSnapshot(saved, new RNG('restore'));
      delete region.gazetteer;
      const before = toRegionSnapshot(region);
      generateRegionGazetteer(region, new RNG('editorial'));
      expect(region.facts).toEqual(before.facts);
      expect(region.map).toEqual(before.map);
      const pool = regionEditorialCandidates(region);
      const reversed = { ...region, facts: { ...region.facts! } };
      for (const key of regionSemanticFactLists)
        Object.assign(reversed.facts, { [key]: [...reversed.facts[key]].reverse() });
      expect(regionEditorialCandidates(reversed)).toEqual(pool);
      expect(composeRegionGazetteer(pool, new RNG(seed))).toEqual(
        composeRegionGazetteer([...pool].reverse(), new RNG(seed)),
      );
      const count = region
        .gazetteer!.blocks.flatMap((block) => block.sentences)
        .reduce((sum, sentence) => sum + editorialSentenceCount(sentence.text), 0);
      expect(count).toBeLessThanOrEqual(24);
      expect(
        region
          .gazetteer!.blocks.flatMap((block) => block.sentences)
          .every((sentence) => editorialSentenceCount(sentence.text) === 1),
      ).toBe(true);
      expect(rollRegionSnapshot(seed)).toEqual(saved);
    }
  });
});
