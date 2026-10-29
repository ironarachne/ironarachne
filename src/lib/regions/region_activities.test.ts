import { describe, expect, it, vi, afterEach } from 'vitest';
import { RNG } from '@ironarachne/rng';
import type { MapNode } from '$lib/map';
import type { Settlement } from '$lib/settlements';
import { getProcessingRecipes } from '$lib/resources';
import { generateSettlementActivities, settlementFeatureSources } from './region_activities';
import { activityEvidenceCurrent } from './region_activity_support';
import { rollRegionSnapshot } from './region_roll';
import { emptyRegionFacts, regionFactsError } from './region_facts';
import { validateRegionSnapshot, migrateRegionSnapshot } from './region_artifact_kind';
import { regionFromSnapshot } from './region_rehydrate';
import { toRegionSnapshot, type RegionSnapshot } from './region_snapshot';
import { regionToMarkdown, regionToDocument } from './region_presentation';
import { regionToUiDocument } from './region_ui_presentation';
import { regionReadingSnapshot } from './region_narrative_evidence';
import { setRegionPlaceText, removeRegionPlace } from './region_editing';
import {
  removeRegionResourceFact,
  setRegionResourceFactText,
  staleRegionFactDependents,
  withRegionOverviewEvidence,
} from './region_resource_editing';
import { resolveProcessingChain } from './region_processing_chain';
import { createProcessingPlanner } from './region_processing_plan';
import { recordProcessingPlan } from './region_processing';
import { accessibleProcessingResources } from './region_processing_resources';
import * as Features from '$lib/settlements';
import * as Passes from './region_generation_passes';
import type { ResourceFact } from './region_fact_types';

const base = rollRegionSnapshot('activity-fixture-base');
const target = { kind: 'embedded', settlementId: 'settlement:home' } as const;
const node = (id: number, neighbors: number[]): MapNode => ({
  id,
  neighbors,
  edges: [],
  corners: [],
  polygon: { vertices: [], edges: [] },
  center: { x: id, y: 0 },
  elevation: 0.2,
  temperature: 15,
  moisture: 0.5,
  isWater: false,
  isOcean: false,
  isCoast: false,
});
function fixture() {
  const facts = emptyRegionFacts('current');
  facts.areas.push({
    id: 'area:land',
    name: 'Land',
    description: '',
    origin: 'authored',
    mapNodeIds: [1, 2, 3],
  });
  facts.settlementRoles.push({
    id: 'role:site:home',
    name: 'Home site',
    description: '',
    origin: 'generated',
    reason: {
      ruleId: 'test:site',
      status: 'current',
      sources: [{ kind: 'fact', factId: 'area:land' }],
    },
    settlement: target,
    areaIds: ['area:land'],
    anchor: { nodeIds: [1], edgeIds: [] },
  });
  return {
    facts,
    map: {
      width: 10,
      height: 10,
      nodes: [node(1, [2]), node(2, [1]), node(3, [])],
      edges: [],
      corners: [],
    },
    environment: structuredClone(base.environment),
    affiliation: 'unaffiliated' as const,
    settlements: [
      {
        ...structuredClone(base.settlements[0].snapshot),
        name: 'Home',
        category: { ...base.settlements[0].snapshot.category, name: 'village' },
        mapNodeId: 1,
        description: 'Unchecked farms and weavers.',
      } as Settlement,
    ],
    settlementIds: ['settlement:home'],
    settlementDescriptionReasons: {} as NonNullable<
      Parameters<typeof generateSettlementActivities>[0]['settlementDescriptionReasons']
    >,
  };
}
function raw(
  region: ReturnType<typeof fixture>,
  id: string,
  kind: ResourceFact['kind'],
  catalogSource?: ResourceFact['catalogSource'],
) {
  const resource: ResourceFact = {
    id: `resource:${id}`,
    name: id,
    description: '',
    origin: 'authored',
    kind,
    availability: 'available',
    depositIds: [],
    areaIds: ['area:land'],
    habitatIds: [],
    anchor: { nodeIds: [2], edgeIds: [] },
    ...(catalogSource ? { catalogSource } : {}),
  };
  region.facts.resources.push(resource);
  return resource;
}
function saved(region: ReturnType<typeof fixture>): RegionSnapshot {
  return {
    ...structuredClone(base),
    description: '',
    overviewReason: undefined,
    affiliation: 'unaffiliated',
    mainRealm: null,
    authority: null,
    settlements: [
      {
        id: target.settlementId,
        snapshot: region
          .settlements[0] as unknown as RegionSnapshot['settlements'][number]['snapshot'],
        ...(region.settlementDescriptionReasons[target.settlementId]
          ? { descriptionReason: region.settlementDescriptionReasons[target.settlementId] }
          : {}),
      },
    ],
    facts: region.facts,
    map: region.map,
    environment: region.environment,
  };
}
function run(region = fixture()) {
  generateSettlementActivities(region, new RNG('activities'));
  return region;
}
function imported(region: ReturnType<typeof fixture>, key = 'linen') {
  const recipe = getProcessingRecipes().find((entry) => entry.outputKey === key)!;
  const product = {
    id: 'product:import-supported',
    name: recipe.outputName,
    description: 'Saved imported work',
    origin: 'authored' as const,
    productKey: recipe.outputKey,
    recipeId: recipe.id,
    technique: recipe.technique,
    requirements: recipe.requirements,
    inputs: recipe.inputs.map((slot) => ({
      kind: 'import' as const,
      role: slot.role,
      foodUse: slot.foodUse,
      resourceName: 'Thread from outside',
      explanation: 'The household brings this input from outside the region.',
      satisfies: structuredClone(slot.selector),
    })),
    settlement: target,
    areaIds: ['area:land'],
    anchor: { nodeIds: [1], edgeIds: [] },
  };
  region.facts.products.push(product);
  return product;
}
afterEach(() => vi.restoreAllMocks());

describe('declared settlement activities', () => {
  it('keeps sparse settlements distinctive without inventing farms, crafts or imports', () => {
    const region = run();
    expect(region.facts.activities).toEqual([]);
    expect(region.facts.products).toEqual([]);
    expect(region.settlements[0].description).not.toMatch(
      /farms|weav|raccoon|grain|bread|imports/i,
    );
    expect(region.settlementDescriptionReasons[target.settlementId].sources).toEqual([
      { kind: 'fact', factId: 'role:site:home' },
    ]);
    expect(validateRegionSnapshot(saved(region))).toMatchObject({ ok: true });
  });
  it('replaces unchecked prose even when placement or site evidence is unavailable', () => {
    const region = fixture();
    region.facts.settlementRoles = [];
    run(region);
    expect(region.settlements[0].description).not.toMatch(/farms|weavers/);
    expect(region.facts.activities).toEqual([]);
    expect(validateRegionSnapshot(saved(region))).toMatchObject({ ok: true });
    expect(
      run({ ...fixture(), facts: undefined } as unknown as ReturnType<typeof fixture>),
    ).toBeDefined();
  });
  it('materializes a complete omitted linen chain and declares household weaving with provenance', () => {
    const region = fixture();
    raw(region, 'flax', 'fiber', {
      kind: 'plant-product',
      plantName: 'flax',
      resourceName: 'flax stems',
    });
    raw(region, 'water', 'freshwater');
    run(region);
    expect(region.facts.dailyLife).toEqual([]);
    const activity = region.facts.activities.find((entry) => entry.activityKey === 'craft-linen')!;
    expect(activity).toBeDefined();
    expect(activity.support.kind).toBe('local');
    expect(activity.description).toContain('flax');
    expect(activity.description).toContain('loom');
    expect(region.settlements[0].description).toContain('weave linen');
    expect(
      resolveProcessingChain(
        region.facts,
        region.facts.products.find((entry) => entry.productKey === 'linen')!.id,
      ).products.map((entry) => entry.productKey),
    ).toEqual(['prepared-flax', 'flax-yarn', 'linen']);
    expect(activityEvidenceCurrent(region.facts, region.map, activity)).toBe(true);
    expect(validateRegionSnapshot(saved(region))).toMatchObject({ ok: true });
  });
  it('keeps woodwork distinct from cloth and qualifies limited materials', () => {
    const region = fixture();
    raw(region, 'timber', 'timber').availability = 'limited';
    run(region);
    expect(region.facts.activities.map((entry) => entry.activityKey)).toEqual([
      'craft-construction-components',
    ]);
    expect(region.facts.activities[0].description).toContain('limited material availability');
    expect(region.settlements[0].description).toContain('woodwork');
    expect(region.settlements[0].description).not.toMatch(/weav|linen/);
    expect(validateRegionSnapshot(saved(region))).toMatchObject({ ok: true });
  });
  it('does not turn arable land and water into farms; actual managed cultivation can declare plots', () => {
    const region = fixture();
    raw(region, 'ground', 'arable-land');
    raw(region, 'water', 'freshwater');
    run(region);
    expect(region.facts.activities).toEqual([]);
    expect(region.settlements[0].description).not.toContain('cultivated');
    region.facts.managedProduction.push({
      id: 'managed-production:flax',
      name: 'Flax plots',
      description: 'Saved cultivation',
      origin: 'authored',
      mode: 'cultivation',
      producer: { kind: 'plant', plantId: 'flax' },
      productionRuleId: 'authored:flax',
      settlement: target,
      areaIds: ['area:land'],
      habitatIds: [],
      anchor: { nodeIds: [2], edgeIds: [] },
      supportingResourceIds: ['resource:ground', 'resource:water'],
      supportingInhabitantIds: [],
    });
    run(region);
    expect(region.facts.activities[0].activityKey).toBe('cultivation');
    expect(region.settlements[0].description).toContain('cultivated plots');
    expect(region.settlements[0].description).not.toMatch(/wheat|barley|bread/);
    expect(validateRegionSnapshot(saved(region))).toMatchObject({ ok: true });
    for (const variant of ['unrecorded', 'not-observed', 'stale', 'disconnected'] as const) {
      const incomplete = structuredClone(region);
      incomplete.facts.activities = [];
      if (variant === 'unrecorded')
        incomplete.facts.managedProduction[0].supportingResourceIds = [];
      if (variant === 'not-observed') incomplete.facts.resources[0].availability = 'not-observed';
      if (variant === 'stale')
        incomplete.facts.resources[0].reason = {
          ruleId: 'authored:ground',
          status: 'stale',
          sources: [{ kind: 'fact', factId: 'area:land' }],
        };
      if (variant === 'disconnected') incomplete.facts.resources[0].anchor!.nodeIds = [3];
      run(incomplete);
      expect(incomplete.facts.activities).toEqual([]);
      expect(incomplete.settlements[0].description).not.toContain('cultivated');
      expect(incomplete.facts.managedProduction[0].description).toBe('Saved cultivation');
    }
  });
  it('accepts explicit compatible imports without manufacturing local provision', () => {
    const region = fixture();
    const product = imported(region);
    run(region);
    const activity = region.facts.activities[0];
    expect(activity.support.kind).toBe('external');
    expect(activity.description).toContain('Thread from outside');
    expect(activity.description).toContain(product.inputs[0].explanation);
    expect(region.facts.resources).toEqual([]);
    expect(validateRegionSnapshot(saved(region))).toMatchObject({ ok: true });
    const edited = saved(region);
    edited.facts.products[0].name = 'Changed display name';
    expect(validateRegionSnapshot(edited)).toMatchObject({ ok: true });
  });
  it.each(['absent', 'wrong', 'incomplete', 'unmatched', 'stale'] as const)(
    'does not rescue weaving with %s imported support',
    (variant) => {
      const region = fixture();
      const product = imported(region);
      if (variant === 'absent') delete (product.inputs[0] as { satisfies?: unknown }).satisfies;
      if (variant === 'wrong')
        product.inputs[0].satisfies = { kind: 'product', productKey: 'sawn-timber' };
      if (variant === 'incomplete') product.inputs = [];
      if (variant === 'unmatched') product.recipeId = 'unknown:recipe';
      if (variant === 'stale')
        Object.assign(product, {
          reason: {
            ruleId: 'authored:input',
            status: 'stale',
            sources: [{ kind: 'fact', factId: 'role:site:home' }],
          },
        });
      run(region);
      expect(region.facts.activities).toEqual([]);
      expect(region.settlements[0].description).not.toContain('weave');
      expect(region.facts.products).toEqual([product]);
    },
  );
  it('distinguishes mixed external inputs from wholly local chains', () => {
    const region = fixture();
    raw(region, 'flax', 'fiber', {
      kind: 'plant-product',
      plantName: 'flax',
      resourceName: 'flax stems',
    });
    run(region);
    const prepared = region.facts.products.find((entry) => entry.productKey === 'prepared-flax')!;
    const slot = getProcessingRecipes().find((recipe) => recipe.outputKey === 'prepared-flax')!
      .inputs[0];
    prepared.origin = 'authored';
    prepared.inputs[0] = {
      kind: 'import',
      role: slot.role,
      foodUse: slot.foodUse,
      resourceName: 'Imported flax',
      explanation: 'Explicit outside fiber.',
      satisfies: slot.selector,
    };
    const activity = region.facts.activities[0];
    if (activity.support.kind === 'unknown') throw new Error('support missing');
    activity.support.kind = 'mixed';
    expect(activityEvidenceCurrent(region.facts, region.map, activity)).toBe(true);
    expect(validateRegionSnapshot(saved(region))).toMatchObject({ ok: true });
    prepared.inputs[0] = {
      ...prepared.inputs[0],
      satisfies: { kind: 'raw', majorType: 'wood', minorTypes: [], resourceNames: [] },
    };
    expect(validateRegionSnapshot(saved(region)).ok).toBe(false);
  });
  it('requires reachable, current raw sources and forbids cloth substitution', () => {
    for (const variant of ['disconnected', 'unknown', 'stale', 'reed'] as const) {
      const region = fixture();
      const resource = raw(region, 'fiber', 'fiber', {
        kind: 'plant-product',
        plantName: variant === 'reed' ? 'reeds' : 'flax',
        resourceName: variant === 'reed' ? 'reeds stems' : 'flax stems',
      });
      if (variant === 'disconnected') resource.anchor!.nodeIds = [3];
      if (variant === 'unknown') resource.availability = 'not-observed';
      if (variant === 'stale')
        resource.reason = {
          ruleId: 'authored:source',
          status: 'stale',
          sources: [{ kind: 'fact', factId: 'area:land' }],
        };
      run(region);
      expect(region.facts.activities.some((entry) => entry.activityKey === 'craft-linen')).toBe(
        false,
      );
      expect(region.settlements[0].description).not.toContain('weave linen');
      if (variant === 'reed')
        expect(
          region.facts.activities.some((entry) => entry.activityKey === 'craft-woven-mats'),
        ).toBe(true);
    }
  });
  it('keeps existing products intact and respects the saved product bound', () => {
    const region = fixture();
    const product = imported(region);
    raw(region, 'timber', 'timber');
    const before = structuredClone(product);
    run(region);
    expect(region.facts.products.find((entry) => entry.id === product.id)).toEqual(before);
    expect(region.facts.activities.length).toBeLessThanOrEqual(2);
    const resources = accessibleProcessingResources(region, new Set([1, 2]), target);
    const plan = createProcessingPlanner(
      getProcessingRecipes(),
      resources,
    )('construction-components');
    expect(plan.status).toBe('supported');
    if (plan.status !== 'supported') throw new Error('plan missing');
    const missing = fixture();
    delete (missing as { facts?: unknown }).facts;
    expect(
      recordProcessingPlan(
        missing,
        { id: 'x', name: 'x', nodeId: 1, roleId: 'role:site:home' },
        plan.products,
        { recipes: getProcessingRecipes() },
      ),
    ).toBe(false);
    const full = fixture();
    for (let i = 0; i < 24; i++)
      full.facts.products.push({ ...structuredClone(product), id: `product:other:${i}` });
    expect(
      recordProcessingPlan(
        full,
        { id: target.settlementId, name: 'Home', nodeId: 1, roleId: 'role:site:home' },
        plan.products,
        { recipes: getProcessingRecipes() },
      ),
    ).toBe(false);
  });
  it('is deterministic under inventory order changes and isolates wording draws from declarations', () => {
    const a = fixture();
    raw(a, 'timber', 'timber');
    raw(a, 'flax', 'fiber', {
      kind: 'plant-product',
      plantName: 'flax',
      resourceName: 'flax stems',
    });
    const b = structuredClone(a);
    b.facts.resources.reverse();
    run(a);
    run(b);
    expect(b.facts.activities).toEqual(a.facts.activities);
    expect(b.settlements).toEqual(a.settlements);
    const c = fixture();
    raw(c, 'timber', 'timber');
    raw(c, 'flax', 'fiber', {
      kind: 'plant-product',
      plantName: 'flax',
      resourceName: 'flax stems',
    });
    const original = Features.describeSettlementFeatures;
    vi.spyOn(Features, 'describeSettlementFeatures').mockImplementation(
      (settlement, eligible, rng) => {
        rng.randomString(40);
        return original(settlement, eligible, rng);
      },
    );
    run(c);
    expect(c.facts.activities).toEqual(a.facts.activities);
    expect(c.facts.products).toEqual(a.facts.products);
  });
});

describe('ecological flavor constraints', () => {
  it('requires current occurrence in the site habitat and treats omission as unknown', () => {
    const region = fixture();
    const role = region.facts.settlementRoles[0];
    const requirement = {
      kind: 'organism' as const,
      source: { kind: 'species' as const, speciesName: 'raccoon' },
    };
    expect(settlementFeatureSources(region, region.settlements[0], role, requirement)).toBeNull();
    region.facts.habitats.push({
      id: 'habitat:local',
      name: 'Forest',
      description: '',
      origin: 'authored',
      areaIds: ['area:land'],
      anchor: { nodeIds: [1], edgeIds: [] },
    });
    region.facts.ecologyInhabitants.push({
      id: 'inhabitant:raccoon',
      name: 'Raccoon',
      description: '',
      origin: 'authored',
      category: 'fauna',
      roles: ['scavenger'],
      source: { kind: 'species', speciesName: 'raccoon' },
      habitatIds: ['habitat:local'],
    });
    expect(settlementFeatureSources(region, region.settlements[0], role, requirement)).toEqual([
      { kind: 'fact', factId: 'inhabitant:raccoon' },
    ]);
    region.facts.habitats[0].anchor!.nodeIds = [3];
    expect(settlementFeatureSources(region, region.settlements[0], role, requirement)).toBeNull();
    region.facts.habitats[0].anchor!.nodeIds = [1];
    region.facts.ecologyInhabitants[0].reason = {
      ruleId: 'stale:occurrence',
      status: 'stale',
      sources: [{ kind: 'fact', factId: 'habitat:local' }],
    };
    expect(settlementFeatureSources(region, region.settlements[0], role, requirement)).toBeNull();
    expect(region.facts.resources).toEqual([]);
  });
});

describe('activity persistence, edits and reading', () => {
  function woodSnapshot() {
    const region = fixture();
    raw(region, 'timber', 'timber');
    return saved(run(region));
  }
  it('round trips declared activities and description provenance through codec and exports', () => {
    const snapshot = woodSnapshot();
    const json = JSON.parse(JSON.stringify(snapshot));
    expect(validateRegionSnapshot(json)).toMatchObject({ ok: true });
    expect(toRegionSnapshot(regionFromSnapshot(json, new RNG('load')))).toEqual(snapshot);
    expect(regionToMarkdown(snapshot)).toContain(snapshot.facts.activities[0].description);
    expect(JSON.stringify(regionToUiDocument(snapshot))).toContain(
      snapshot.facts.activities[0].description,
    );
    expect(JSON.stringify(regionToDocument(snapshot))).toContain(
      snapshot.settlements[0].snapshot.description,
    );
  });
  it('preserves legacy words without inferring activities or import identity', () => {
    const old = woodSnapshot();
    const description = old.settlements[0].snapshot.description;
    delete old.settlements[0].descriptionReason;
    const { activities: _activities, ...facts } = old.facts;
    const input = { ...old, facts: { ...facts, version: 11 } };
    const before = structuredClone(input);
    const migrated = migrateRegionSnapshot(input, 16);
    expect(migrated).toMatchObject({ ok: true, value: { facts: { version: 12, activities: [] } } });
    if (!migrated.ok) throw new Error(migrated.message);
    expect(migrated.value.settlements[0].snapshot.description).toBe(description);
    expect(migrated.value.settlements[0].descriptionReason).toBeUndefined();
    expect(input).toEqual(before);
    expect(migrateRegionSnapshot(input, 17).ok).toBe(false);
  });
  it('stales generated dependents on source editing while retaining the stored prose for inspection', () => {
    const snapshot = woodSnapshot();
    const old = snapshot.settlements[0].snapshot.description;
    const edited = setRegionResourceFactText(
      snapshot,
      'resources',
      'resource:timber',
      'description',
      'Authored timber note',
    );
    expect(edited.facts.activities[0].reason?.status).toBe('stale');
    expect(edited.settlements[0].descriptionReason?.status).toBe('stale');
    expect(edited.settlements[0].snapshot.description).toBe(old);
    expect(regionToMarkdown(edited)).not.toContain(old);
    expect(JSON.stringify(regionToUiDocument(edited))).not.toContain(old);
    expect(regionReadingSnapshot(edited).settlements[0].snapshot.description).toBe('');
    expect(validateRegionSnapshot(edited)).toMatchObject({ ok: true });
  });
  it('clears generated provenance on description editing, including intentional blanks', () => {
    const snapshot = woodSnapshot();
    const unchanged = setRegionPlaceText(
      snapshot,
      'settlements',
      0,
      'description',
      snapshot.settlements[0].snapshot.description,
    );
    expect(unchanged).toBe(snapshot);
    const edited = setRegionPlaceText(
      snapshot,
      'settlements',
      0,
      'description',
      'My weavers work here.',
    );
    expect(edited.settlements[0].descriptionReason).toBeUndefined();
    expect(regionToMarkdown(edited)).toContain('My weavers work here.');
    expect(edited.facts.activities).toHaveLength(1);
    const blank = setRegionPlaceText(snapshot, 'settlements', 0, 'description', '');
    expect(blank.settlements[0].snapshot.description).toBe('');
    expect(validateRegionSnapshot(JSON.parse(JSON.stringify(blank)))).toMatchObject({ ok: true });
  });
  it('removes generated activities with their inputs and protects authored dependent work', () => {
    const snapshot = woodSnapshot();
    const removed = removeRegionResourceFact(snapshot, 'resources', 'resource:timber');
    expect(removed.facts.activities).toEqual([]);
    expect(removed.settlements[0].descriptionReason?.status).toBe('stale');
    expect(validateRegionSnapshot(removed)).toMatchObject({ ok: true });
    const authored = setRegionResourceFactText(
      snapshot,
      'activities',
      snapshot.facts.activities[0].id,
      'description',
      'My local woodworkers.',
    );
    expect(removeRegionResourceFact(authored, 'resources', 'resource:timber')).toBe(authored);
    expect(removeRegionPlace(authored, 'settlements', 0)).toBe(authored);
    expect(regionToMarkdown(authored)).toContain('My local woodworkers.');
    expect(removeRegionPlace(snapshot, 'settlements', 0).facts.activities).toEqual([]);
  });
  it('retains authored unknown activities, invalidates their knowledge gaps and rejects generated unknown claims', () => {
    const snapshot = woodSnapshot();
    const activity = snapshot.facts.activities[0];
    activity.origin = 'authored';
    activity.activityKey = 'future-activity';
    activity.description = 'Authored farms.';
    activity.support = {
      kind: 'unknown',
      unresolvedRequirementKeys: ['source:future'],
      explanation: 'Inputs are unrecorded.',
    };
    expect(validateRegionSnapshot(snapshot)).toMatchObject({ ok: true });
    const facts = staleRegionFactDependents(snapshot.facts, new Set(['resource:new-source']));
    const edited = withRegionOverviewEvidence({ ...snapshot, facts });
    expect(edited.facts.activities[0].reason?.status).toBe('stale');
    expect(regionToMarkdown(edited)).toContain('Authored farms.');
    activity.origin = 'generated';
    expect(validateRegionSnapshot(snapshot).ok).toBe(false);
  });
  it.each([
    'kind',
    'empty',
    'explanation',
    'input',
    'foreign',
    'cycle',
    'mode',
    'identity',
    'location',
    'meaning',
  ] as const)('rejects invalid activity %s', (variant) => {
    const snapshot = woodSnapshot();
    const activity = snapshot.facts.activities[0];
    if (variant === 'kind') Object.assign(activity.support, { kind: 'invented' });
    if (variant === 'empty') activity.support = { kind: 'local', inputs: [], productionIds: [] };
    if (variant === 'explanation')
      activity.support = { kind: 'unknown', unresolvedRequirementKeys: [], explanation: '' };
    if (variant === 'input' && activity.support.kind !== 'unknown')
      activity.support.inputs = [{ kind: 'product', productId: 'product:missing' }];
    if (variant === 'foreign')
      snapshot.facts.products[0].settlement = { kind: 'artifact', targetId: 'foreign' };
    if (variant === 'cycle') activity.reason!.sources.push({ kind: 'fact', factId: activity.id });
    if (variant === 'mode' && activity.support.kind !== 'unknown')
      activity.support.kind = 'external';
    if (variant === 'identity') activity.id = 'activity:';
    if (variant === 'location') activity.anchor.nodeIds = [3];
    if (variant === 'meaning') activity.activityKey = 'craft-linen';
    expect(validateRegionSnapshot(snapshot).ok).toBe(false);
  });
});

describe('reported region seed regression', () => {
  it('preserves habitation and physical results when the activity stage is disabled', () => {
    const before = rollRegionSnapshot('activity-stage-isolation');
    vi.spyOn(Passes, 'generateSettlementActivities').mockImplementation(() => {});
    const after = rollRegionSnapshot('activity-stage-isolation');
    expect(after.map).toEqual(before.map);
    expect(after.environment).toEqual(before.environment);
    expect(after.realms).toEqual(before.realms);
    expect(after.organizations).toEqual(before.organizations);
    expect(after.facts.resources).toEqual(before.facts.resources);
    expect(after.facts.managedProduction).toEqual(before.facts.managedProduction);
    expect(after.facts.dailyLife).toEqual(before.facts.dailyLife);
    const withoutDescription = (value: RegionSnapshot) =>
      value.settlements.map(({ snapshot }) => {
        const { description: _description, ...rest } = snapshot;
        return rest;
      });
    expect(withoutDescription(after)).toEqual(withoutDescription(before));
    expect(after.facts.activities).toEqual([]);
  });
  it('generates coherent declared work and ecology from 5wyedz5q272fz with default options', () => {
    const snapshot = rollRegionSnapshot('5wyedz5q272fz');
    expect(snapshot).toEqual(rollRegionSnapshot('5wyedz5q272fz'));
    expect(regionFactsError(snapshot.facts, snapshot.map, snapshot.settlements)).toBeNull();
    expect(validateRegionSnapshot(snapshot)).toMatchObject({ ok: true });
    expect(snapshot.facts.activities.length).toBeGreaterThan(0);
    for (const entry of snapshot.settlements) {
      const activities = snapshot.facts.activities.filter(
        (activity) =>
          activity.settlement.kind === 'embedded' && activity.settlement.settlementId === entry.id,
      );
      expect(activities.length).toBeLessThanOrEqual(2);
      expect(entry.descriptionReason).toBeDefined();
      if (entry.snapshot.description.includes('weave linen'))
        expect(activities.some((activity) => activity.activityKey === 'craft-linen')).toBe(true);
      if (entry.snapshot.description.includes('cultivated plots'))
        expect(activities.some((activity) => activity.activityKey === 'cultivation')).toBe(true);
      for (const activity of activities)
        expect(activityEvidenceCurrent(snapshot.facts, snapshot.map, activity)).toBe(true);
    }
  });
});
