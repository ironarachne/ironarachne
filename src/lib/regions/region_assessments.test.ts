import { describe, expect, it, vi } from 'vitest';
import * as ResourceNarrative from './region_resource_narrative';
import { generateResourceFacts } from './region_resources';
import { RNG } from '@ironarachne/rng';
import { getFantasyNameGeneratorSet } from '$lib/names';
import { generate } from './regions';
import { toRegionSnapshot } from './region_snapshot';
import { regionFromSnapshot } from './region_rehydrate';
import { regionToMarkdown } from './region_presentation';
import { regionToUiDocument } from './region_ui_presentation';
import {
  resourceAssessments,
  resourceNarrativeOptions,
  describeResource,
  riverAssessments,
} from './region_resource_narrative';
import {
  regionSourcesError,
  regionAssessmentsError,
  regionOverviewReasonError,
} from './region_assessment_validation';
import { validateRegionSnapshot, migrateRegionSnapshot } from './region_artifact_kind';
import { setRegionText } from './region_editing';
import { setRegionResourceFactText } from './region_resource_editing';
import {
  regionInspectionFacts,
  regionFactReadable,
  regionOverviewCurrent,
} from './region_narrative_evidence';
import type { ResourceFact, FactSource } from './region_fact_types';
const rng = new RNG('evidence');
const saved = toRegionSnapshot(
  generate({
    rng,
    nameGeneratorSet: getFantasyNameGeneratorSet('human', rng),
    dominantCulture: null,
    mapWidth: 12,
    mapHeight: 10,
    affiliation: 'unaffiliated',
    generateNeighbors: false,
    minRealms: 0,
    maxRealms: 0,
  }),
);
const resource = (): ResourceFact => ({
  id: 'resource:spruce',
  name: 'spruce timber',
  description: 'Potential timber; no logging industry is implied.',
  origin: 'generated',
  kind: 'timber',
  availability: 'limited',
  depositIds: [],
  areaIds: [],
  habitatIds: [],
  reason: {
    ruleId: 'raw:v1',
    status: 'current',
    sources: [{ kind: 'fact', factId: saved.facts.habitats[0].id }],
  },
});
describe('regional evidence and prose', () => {
  it('keeps possible resources distinct from exploitation and exports their qualifications', () => {
    const fact = resource();
    fact.assessments = resourceAssessments(fact);
    expect(fact.assessments.find((entry) => entry.topic === 'resource-presence')?.status).toBe(
      'inferred',
    );
    expect(fact.assessments.find((entry) => entry.topic === 'resource-exploitation')?.status).toBe(
      'unknown',
    );
    expect(JSON.stringify(fact.assessments)).toContain('no logging industry is implied');
    fact.description = describeResource(fact, new RNG('words'));
    expect(fact.description).toMatch(/could/);
    expect(fact.description).not.toMatch(/implied|logging|industry|unverified/);
    expect(describeResource(fact, new RNG('words'))).toBe(fact.description);
  });
  it.each(['unknown', 'not-observed'] as const)(
    'omits %s resources without claiming absence',
    (availability) => {
      const fact = { ...resource(), availability };
      fact.assessments = resourceAssessments(fact);
      expect(resourceNarrativeOptions(fact)).toEqual([]);
      expect(describeResource(fact, new RNG('words'))).toBe('');
    },
  );
  it.each(['arable-land', 'freshwater', 'ore', 'fiber', 'food'] as const)(
    'words %s within its supported meaning',
    (kind) => {
      const fact = {
        ...resource(),
        kind,
        ...(kind === 'ore' ? { depositIds: ['deposit:one'] } : {}),
      };
      if (kind === 'food')
        fact.catalogSource = { kind: 'species-product', resourceName: 'meat', speciesName: 'deer' };
      if (kind === 'fiber')
        fact.catalogSource = { kind: 'plant-product', resourceName: 'flax', plantName: 'flax' };
      fact.assessments = resourceAssessments(fact);
      expect(resourceNarrativeOptions(fact).length).toBeGreaterThan(0);
      expect(describeResource(fact, new RNG('words'))).not.toMatch(
        /implied|unverified|industry|harvest|safe drinking/,
      );
      if (kind === 'freshwater') {
        fact.name = 'Lake water';
        expect(resourceNarrativeOptions(fact).join(' ')).toContain('lake');
      }
    },
  );
  it.each([false, true])(
    'records river and road evidence without establishing crossing safety: %s',
    (road) => {
      const sources: FactSource[] = [
        { kind: 'map-edge', edgeId: 1, property: 'river', observedValue: '1' },
        { kind: 'map-edge', edgeId: 1, property: 'road', observedValue: String(Number(road)) },
      ];
      const assessments = riverAssessments(sources, road);
      expect(assessments.find((entry) => entry.topic === 'road-at-river')?.status).toBe(
        road ? 'confirmed' : 'unknown',
      );
      expect(assessments.find((entry) => entry.topic === 'safe-crossing')?.status).toBe('unknown');
      expect(assessments.find((entry) => entry.topic === 'river-navigability')?.status).toBe(
        'unknown',
      );
    },
  );
  it('isolates extra resource wording draws from inventory selection', () => {
    const first = regionFromSnapshot(structuredClone(saved), new RNG('reopen'));
    first.facts!.resources = [];
    first.facts!.resourceDeposits = [];
    const second = regionFromSnapshot(toRegionSnapshot(first), new RNG('reopen'));
    generateResourceFacts(first, new RNG('inventory'));
    const original = ResourceNarrative.describeResource;
    const spy = vi
      .spyOn(ResourceNarrative, 'describeResource')
      .mockImplementation((fact, words) => {
        words.int(0, 100);
        words.int(0, 100);
        return original(fact, words);
      });
    try {
      generateResourceFacts(second, new RNG('inventory'));
    } finally {
      spy.mockRestore();
    }
    const factsWithoutWords = (facts: NonNullable<typeof first.facts>) => ({
      ...facts,
      resources: facts.resources.map(({ description: _description, ...fact }) => fact),
    });
    expect(factsWithoutWords(second.facts!)).toEqual(factsWithoutWords(first.facts!));
    expect(second.map).toEqual(first.map);
  });
  it('round-trips the complete new evidence and preserves legacy wording without inference', () => {
    expect(validateRegionSnapshot(saved).ok).toBe(true);
    const json = JSON.parse(JSON.stringify(saved));
    expect(toRegionSnapshot(regionFromSnapshot(json, new RNG('reopen')))).toEqual(saved);
    const old = structuredClone(saved);
    delete old.overviewReason;
    for (const fact of regionInspectionFacts(old)) delete fact.assessments;
    old.description = 'Old technical prose: unverified.';
    const input = { ...old, facts: { ...old.facts, version: 8 } };
    const result = migrateRegionSnapshot(input, 13);
    expect(result.ok).toBe(true);
    if (!result.ok) throw new Error(result.message);
    expect(result.value).toEqual(old);
    expect(regionToMarkdown(result.value)).toContain(old.description);
    expect(migrateRegionSnapshot(saved, 13).ok).toBe(false);
  });
  it('omits stale generated prose but preserves authored edits and inspection records', () => {
    const input = structuredClone(saved);
    const fact = input.facts.resources.find((entry) =>
      entry.assessments?.some((assessment) => assessment.status !== 'unknown'),
    )!;
    expect(regionFactReadable(input, fact)).toBe(true);
    fact.reason!.status = 'stale';
    expect(regionFactReadable(input, fact)).toBe(false);
    fact.origin = 'authored';
    fact.description = 'My authored resource.';
    expect(regionFactReadable(input, fact)).toBe(true);
    expect(regionInspectionFacts(input)).toContain(fact);
    const edited = setRegionText(input, 'description', 'My overview.');
    expect(edited.overviewReason).toBeUndefined();
    expect(regionToMarkdown(edited)).toContain('My overview.');
    expect(regionToMarkdown(edited)).not.toMatch(/needs review|Facts needing review/);
    expect(regionToUiDocument(edited).paragraphs).toContain('My overview.');
  });
  it('invalidates only selected overview dependencies without changing words', () => {
    const input = structuredClone(saved);
    input.overviewReason = {
      ruleId: 'overview:v2',
      status: 'current',
      sources: [{ kind: 'fact', factId: input.facts.resources[0].id }],
    };
    const edited = setRegionResourceFactText(
      input,
      'resources',
      input.facts.resources[0].id,
      'description',
      'Changed source.',
    );
    expect(edited.overviewReason?.status).toBe('stale');
    expect(edited.description).toBe(input.description);
    expect(regionOverviewCurrent(edited, edited.overviewReason)).toBe(false);
    expect(regionToMarkdown(edited)).not.toContain(input.description);
    const unrelated = setRegionText(input, 'name', 'New regional name');
    expect(unrelated.overviewReason).toEqual(input.overviewReason);
  });
  it('rejects cyclic, missing and altered observations as narrative support', () => {
    const input = structuredClone(saved);
    const fact = input.facts.resources[0];
    fact.assessments = [
      {
        topic: 'resource-presence',
        status: 'confirmed',
        explanation: 'A source.',
        sources: [{ kind: 'fact', factId: fact.id }],
      },
    ];
    expect(regionFactReadable(input, fact)).toBe(false);
    fact.assessments[0].sources = [{ kind: 'fact', factId: 'missing' }];
    expect(regionFactReadable(input, fact)).toBe(false);
    fact.assessments[0].sources = [
      {
        kind: 'map-node',
        nodeId: input.map.nodes[0].id,
        property: 'elevation',
        observedValue: '10000',
      },
    ];
    expect(regionFactReadable(input, fact)).toBe(false);
  });
});
describe('assessment validation boundaries', () => {
  const ids = new Set(regionInspectionFacts(saved).map((fact) => fact.id));
  const assessment = {
    topic: 'resource-presence',
    status: 'confirmed',
    explanation: 'Supported source.',
    sources: [{ kind: 'fact', factId: [...ids][0] }],
  };
  it.each([
    null,
    {},
    [{ ...assessment, topic: 'future' }],
    [{ ...assessment, status: 'false' }],
    [{ ...assessment, explanation: ' ' }],
    [assessment, assessment],
    [{ ...assessment, sources: [] }],
    [{ ...assessment, sources: [{ kind: 'fact', factId: 'missing' }] }],
  ])('rejects malformed assessments: %j', (value) => {
    expect(regionAssessmentsError(value, false, saved.map, ids)).not.toBeNull();
  });
  it('accepts unknowns without evidence and retains stale missing sources', () => {
    expect(regionAssessmentsError(undefined, false, saved.map, ids)).toBeNull();
    expect(
      regionAssessmentsError(
        [{ ...assessment, status: 'unknown', sources: [] }],
        false,
        saved.map,
        ids,
      ),
    ).toBeNull();
    expect(
      regionAssessmentsError(
        [{ ...assessment, sources: [{ kind: 'fact', factId: 'missing' }] }],
        true,
        saved.map,
        ids,
      ),
    ).toBeNull();
  });
  it.each([
    null,
    [null],
    [{ kind: 'future' }],
    [{ kind: 'fact', factId: '' }],
    [{ kind: 'map-node', nodeId: '1', property: 'elevation', observedValue: '0' }],
    [{ kind: 'map-edge', edgeId: 1, property: 'future', observedValue: '0' }],
    [{ kind: 'environment', field: 'future', observedValue: '0' }],
  ])('rejects malformed sources: %j', (value) => {
    expect(regionSourcesError(value, false, saved.map, ids)).not.toBeNull();
  });
  it('validates map/environment sources and overview reasons', () => {
    const sources = [
      {
        kind: 'map-node',
        nodeId: saved.map.nodes[0].id,
        property: 'elevation',
        observedValue: '0',
      },
      { kind: 'map-edge', edgeId: saved.map.edges[0].id, property: 'road', observedValue: '0' },
      { kind: 'environment', field: 'climate', observedValue: '{}' },
    ];
    expect(regionSourcesError(sources, false, saved.map, ids)).toBeNull();
    expect(regionOverviewReasonError(undefined, saved.map, ids)).toBeNull();
    expect(regionOverviewReasonError({}, saved.map, ids)).not.toBeNull();
    expect(
      regionOverviewReasonError({ ruleId: 'overview', status: 'current', sources }, saved.map, ids),
    ).toBeNull();
  });
});
