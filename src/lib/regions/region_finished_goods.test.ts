import { emptyRegionHistory } from './region_realm_identity';
import { describe, expect, it } from 'vitest';
import { RNG } from '@ironarachne/rng';
import {
  getProcessingRecipes,
  getBiologicalRawResources,
  getGeologicalRawResources,
  getBiologicalSourceDefinitions,
  snapshotRawResource,
  getBuildingMaterialResources,
  productContext,
  isProductContext,
  matchesProcessingInput,
  matchesProcessingSource,
  type ProcessingRecipe,
  type Resource,
} from '$lib/resources';
import type { MapNode } from '$lib/map';
import type { Settlement } from '$lib/settlements';
import type Region from './region';
import type { RegionSnapshot } from './region_snapshot';
import type { AccessibleProcessingResource } from './region_processing_types';
import { emptyRegionFacts, regionFactsError } from './region_facts';
import { planProcessingChain, processingCatalogErrors } from './region_processing_plan';
import { generateProcessingFacts } from './region_processing';
import { resolveProcessingChain } from './region_processing_chain';
import { assessProcessingCapability } from './region_processing_capability';
import { assessRegionProductFood } from './region_food';
import { generateLivelihoodFacts } from './region_livelihoods';
import { assessSettlementSupply } from './region_supply';
import { describeRegionMaterials } from './region_material_context';
import { accessibleProcessingResources } from './region_processing_resources';
import { processingFactsError } from './region_processing_validation';
import { setRegionResourceFactText, removeRegionResourceFact } from './region_resource_editing';

const catalog = getProcessingRecipes();
const raws = [...getBiologicalRawResources(), ...getGeologicalRawResources()];
const timber = getBuildingMaterialResources().find((entry) => entry.major_type === 'wood')!;
function availableResources(): AccessibleProcessingResource[] {
  const leaf = (resource: Resource, id: string): AccessibleProcessingResource => ({
    resource,
    rawResourceId: id,
    sourceId: `source:${id}`,
    fact: {
      id: `resource:${id}`,
      name: resource.name,
      description: '',
      origin: 'authored',
      kind: 'plant-material',
      availability: 'available',
      areaIds: [],
      habitatIds: [],
      depositIds: [],
      anchor: { nodeIds: [1], edgeIds: [] },
    },
    anchor: { nodeIds: [1], edgeIds: [] },
    depositIds: [],
    sourceAvailability: 'available',
    acquisitionRequirements: ['collection equipment'],
  });
  return [
    ...raws.map((entry) => ({ ...leaf(entry.resource, entry.id), food: entry.food })),
    leaf(timber, 'timber'),
  ];
}
function fixture(
  keys = ['sheep-fleece', 'cotton-seed-fiber', 'wheat-grain', 'grape-fruit', 'cow-milk'],
) {
  const facts = emptyRegionFacts('current');
  const node: MapNode = {
    id: 1,
    neighbors: [],
    edges: [],
    corners: [],
    polygon: { vertices: [], edges: [] },
    center: { x: 1, y: 1 },
    elevation: 0.2,
    temperature: 20,
    moisture: 0.5,
    isWater: false,
    isOcean: false,
    isCoast: false,
    biomeId: 'temperate grassland',
  };
  const base = { name: 'Authored support', description: '', origin: 'authored' as const };
  const location = {
    areaIds: ['area:land'],
    habitatIds: [],
    anchor: { nodeIds: [1], edgeIds: [] },
  };
  const target = { kind: 'embedded' as const, settlementId: 'home' };
  facts.areas.push({ ...base, id: 'area:land', mapNodeIds: [1] });
  facts.settlementRoles.push({
    ...base,
    id: 'role:site:home',
    settlement: target,
    areaIds: location.areaIds,
    anchor: location.anchor,
  });
  for (const key of keys) {
    const definition = getBiologicalSourceDefinitions().find(
      (entry) => entry.rawResourceId === key && entry.mode !== 'wild',
    )!;
    const raw = raws.find((entry) => entry.id === key)!;
    facts.managedProduction.push({
      ...base,
      ...location,
      id: `managed-production:${key}`,
      producer: definition.producer,
      mode: definition.mode as 'cultivation' | 'husbandry' | 'apiary',
      productionRuleId: `reviewed:${key}`,
      settlement: target,
      supportingResourceIds: [],
      supportingInhabitantIds: [],
    });
    facts.resourceSources.push({
      ...base,
      ...location,
      id: `resource-source:${key}`,
      definitionId: definition.id,
      resource: snapshotRawResource(raw),
      source: { kind: 'managed', productionId: `managed-production:${key}` },
      method: definition.method,
      requirements: [...definition.requirements],
      availability: 'available',
      waterSources: [],
    });
    facts.resources.push({
      ...base,
      ...location,
      id: `resource:${key}`,
      kind: raw.food.kind === 'food' ? 'food' : 'animal-material',
      availability: 'available',
      depositIds: [],
      catalogSource: { kind: 'raw-resource', resourceId: key },
      sourceIds: [`resource-source:${key}`],
    });
  }
  facts.resources.push({
    ...base,
    ...location,
    id: 'resource:timber',
    kind: 'timber',
    availability: 'available',
    depositIds: [],
    catalogSource: { kind: 'building-material', resourceName: timber.name },
  });
  return {
    facts,
    map: { width: 2, height: 2, nodes: [node], edges: [], corners: [] },
    settlements: [{ name: 'Home', mapNodeId: 1 } as Settlement],
    settlementIds: ['home'],
  } satisfies Pick<Region, 'facts' | 'map' | 'settlements' | 'settlementIds'>;
}
function subcatalog(key: string): ProcessingRecipe[] {
  const keys = new Set<string>();
  const visit = (key: string) => {
    if (keys.has(key)) return;
    keys.add(key);
    for (const { selector } of catalog.find((entry) => entry.outputKey === key)!.inputs)
      if (selector.kind === 'product') visit(selector.productKey);
  };
  visit(key);
  return structuredClone(catalog.filter((entry) => keys.has(entry.outputKey)));
}
function saved(region: ReturnType<typeof fixture>): RegionSnapshot {
  return {
    ...region,
    environment: {},
    history: emptyRegionHistory(),
    settlements: [{ id: 'home', snapshot: region.settlements[0] }],
  } as unknown as RegionSnapshot;
}
function error(region: ReturnType<typeof fixture>) {
  return regionFactsError(region.facts, region.map, saved(region).settlements);
}

describe('expanded fantasy processing catalog', () => {
  it('has complete reviewed routes and rejects duplicate identities, broken graphs and malformed inputs', () => {
    expect(processingCatalogErrors(catalog)).toEqual([]);
    expect(catalog).toHaveLength(81);
    for (const recipe of catalog.slice(12)) {
      expect(recipe.reviewRefs?.length).toBeGreaterThan(0);
      expect(recipe.reviewNote?.length).toBeGreaterThan(0);
      expect(isProductContext(recipe.context, recipe.food)).toBe(true);
    }
    const a = catalog[0];
    expect(processingCatalogErrors([a, a]).join()).toMatch(
      /Duplicate recipe ID.*Duplicate output key/,
    );
    expect(
      processingCatalogErrors([
        {
          ...a,
          inputs: [{ role: 'material', selector: { kind: 'raw-resource', rawResourceIds: [] } }],
        },
      ]).join(),
    ).toContain('Invalid raw identities');
    expect(
      processingCatalogErrors([
        { ...a, inputs: [{ role: 'material', selector: { kind: 'settlement-water' } }] },
      ]).join(),
    ).toContain('Invalid settlement water role');
    expect(
      processingCatalogErrors([
        { ...a, context: { uses: ['prepared-food'], craftLabel: null } },
      ]).join(),
    ).toContain('Invalid product context');
    expect(
      processingCatalogErrors([
        {
          ...a,
          food: { kind: 'food', use: 'ingredient', reviewRuleId: 'review', requirements: [] },
        },
      ]).join(),
    ).toContain('Invalid food input');
    expect(
      matchesProcessingInput(
        { kind: 'raw-resource', rawResourceIds: ['sheep-fleece'] },
        raws[0].resource,
      ),
    ).toBe(false);
    expect(
      matchesProcessingSource(
        { kind: 'raw-resource', rawResourceIds: ['sheep-fleece'] },
        raws[0].resource,
        'sheep-fleece',
      ),
    ).toBe(true);
  });
  it.each(catalog.map((recipe) => [recipe.outputKey]))(
    'plans a complete supported %s chain and blocks each missing raw ingredient',
    (key) => {
      const resources = availableResources();
      const plan = planProcessingChain(catalog, resources, key);
      expect(plan.status, JSON.stringify(plan)).toBe('supported');
      if (plan.status !== 'supported') return;
      expect(plan.depth).toBeLessThanOrEqual(8);
      expect(plan.products.length).toBeLessThanOrEqual(24);
      const recipe = catalog.find((entry) => entry.outputKey === key)!;
      for (const { selector } of recipe.inputs) {
        if (selector.kind === 'raw' || selector.kind === 'raw-resource') {
          const missing = resources.filter(
            (entry) => !matchesProcessingSource(selector, entry.resource, entry.rawResourceId),
          );
          expect(planProcessingChain(catalog, missing, key).status).toBe('unsupported');
        }
      }
    },
  );
  it('never silently enables the deferred catalog', () => {
    for (const key of [
      'bronze-metal',
      'copper-metal',
      'salted-provisions',
      'soap',
      'glass',
      'leather',
      'parchment',
      'beer',
      'polished-garnet',
    ])
      expect(planProcessingChain(catalog, availableResources(), key).status).toBe('unsupported');
  });
  it('rejects oversize branching closures without truncating dependencies', () => {
    const root = catalog[0];
    const branches = Array.from({ length: 24 }, (_, index) => ({
      ...root,
      id: `branch:${index}`,
      outputKey: `branch:${index}`,
    }));
    const terminal = {
      ...root,
      id: 'root',
      outputKey: 'root',
      inputs: branches.map((entry) => ({
        role: 'material' as const,
        selector: { kind: 'product' as const, productKey: entry.outputKey },
      })),
    };
    expect(
      planProcessingChain([...branches, terminal], availableResources(), 'root'),
    ).toMatchObject({ status: 'unsupported', missingInputKeys: ['products:root'] });
  });
  it('keeps new metadata copies independent and historical meanings frozen', () => {
    const first = getProcessingRecipes();
    first.at(-1)!.context!.uses.length = 0;
    expect(getProcessingRecipes().at(-1)!.context!.uses).toEqual(['prepared-food']);
    expect(productContext({ productKey: 'linen' }).uses).toEqual(['cloth']);
    expect(productContext({ productKey: 'toString' }).uses).toEqual([]);
    expect(isProductContext({ uses: ['cloth', 'cloth'], craftLabel: null })).toBe(false);
    expect(isProductContext({ uses: [], craftLabel: '' })).toBe(false);
  });
});

describe('saved finished goods and settlement water', () => {
  it('requires a shared ingredient to satisfy every consuming provision', () => {
    const flour = structuredClone(catalog.find((entry) => entry.outputKey === 'wheat-flour')!);
    flour.inputs[0].selector = {
      kind: 'raw-resource',
      rawResourceIds: ['wheat-grain', 'rye-grain'],
    };
    const bread = catalog.find((entry) => entry.outputKey === 'wheat-bread')!;
    const provision = (key: string): ProcessingRecipe => ({
      ...bread,
      id: key,
      outputKey: key,
      inputs: [
        {
          role: 'material',
          foodUse: 'ingredient',
          selector: { kind: 'product', productKey: flour.outputKey },
        },
      ],
    });
    const root: ProcessingRecipe = {
      ...catalog[0],
      id: 'shared-root',
      outputKey: 'shared-root',
      inputs: ['wheat-bread', 'rye-bread'].map((key) => ({
        role: 'material',
        selector: { kind: 'product', productKey: key },
      })),
    };
    const recipes = [flour, provision('wheat-bread'), provision('rye-bread'), root];
    const resources = availableResources();
    expect(planProcessingChain(recipes, resources, root.outputKey).status).toBe('unsupported');
    const wheat = resources.find((entry) => entry.rawResourceId === 'wheat-grain')!;
    // A controlled policy fixture permits both provisions; this does not alter the live wheat rule.
    wheat.food = {
      kind: 'food',
      preparation: 'recipe-required',
      productKeys: ['wheat-bread', 'rye-bread'],
    };
    const plan = planProcessingChain(recipes, resources, root.outputKey);
    expect(plan.status).toBe('supported');
    if (plan.status === 'supported')
      expect(plan.products.filter((entry) => entry.productKey === flour.outputKey)).toHaveLength(1);
    flour.food = { kind: 'not-food' };
    delete flour.context;
    expect(planProcessingChain(recipes, resources, root.outputKey)).toMatchObject({
      status: 'unsupported',
      issues: ['Not a food ingredient: wheat-flour'],
    });
  });
  it.each(['wool-clothing', 'cotton-clothing', 'wheat-bread', 'fresh-acid-cheese'])(
    'generates %s without mapped freshwater, with complete saved qualifications',
    (key) => {
      const region = fixture();
      const recipes = subcatalog(key);
      // The tests isolate an endpoint so selection cannot hide a missing chain behind another output.
      for (const recipe of recipes)
        if (recipe.outputKey !== key) recipe.context = { uses: [], craftLabel: null };
      generateProcessingFacts(region, new RNG(key), { recipes });
      expect(error(region)).toBeNull();
      const output = region.facts.products.find((entry) => entry.productKey === key)!;
      expect(output).toBeDefined();
      const chain = resolveProcessingChain(region.facts, output.id);
      expect(chain.issues).toEqual([]);
      expect(chain.imports).toEqual([]);
      if (key !== 'fresh-acid-cheese')
        expect(chain.settlementWaterInputs).toHaveLength(key === 'cotton-clothing' ? 0 : 1);
      expect(chain.localInputs.some((input) => /water/.test(input.resourceId))).toBe(false);
      if (key === 'wheat-bread' || key === 'fresh-acid-cheese')
        expect(assessRegionProductFood(region.facts, output.id).status).toBe('eligible');
      if (key === 'wheat-bread') {
        const flour = region.facts.products.find((entry) => entry.productKey === 'wheat-flour')!;
        expect(assessRegionProductFood(region.facts, flour.id).status).toBe('requires-preparation');
        expect(assessRegionProductFood(region.facts, output.id).requirements.join()).toContain(
          'clean freshwater',
        );
      }
      expect(resolveProcessingChain(JSON.parse(JSON.stringify(region.facts)), output.id)).toEqual(
        chain,
      );
    },
  );
  it('uses cotton or wool for cloth supply and projects new crafts through existing saved context', () => {
    const region = fixture(['cotton-seed-fiber']);
    expect(
      assessSettlementSupply(region, region.facts.settlementRoles[0]).some(
        (entry) => entry.needKey === 'woven-cloth',
      ),
    ).toBe(false);
    generateProcessingFacts(region, new RNG('cloth'), { recipes: subcatalog('cotton-cloth') });
    generateLivelihoodFacts(region, new RNG('life'));
    const view = describeRegionMaterials(saved(region), { kind: 'embedded', settlementId: 'home' });
    expect(view.status).toBe('current');
    expect(view.crafts.join()).toContain('cotton');
    region.facts.resources = region.facts.resources.filter(
      (entry) => entry.id !== 'resource:cotton-seed-fiber',
    );
    expect(
      describeRegionMaterials(saved(region), { kind: 'embedded', settlementId: 'home' }).status,
    ).toBe('needs-review');
  });
  it('validates baseline roles and explanations, preserves authored dependents and records edits as stale', () => {
    const region = fixture(['wheat-grain']);
    generateProcessingFacts(region, new RNG('bread'), {
      recipes: subcatalog('wheat-bread').map((entry) => ({
        ...entry,
        context: { uses: [], craftLabel: null },
      })),
    });
    const dough = region.facts.products.find((entry) => entry.productKey === 'wheat-dough')!;
    const water = dough.inputs.find((entry) => entry.kind === 'settlement-water')!;
    const snapshot = saved(region);
    const validate = () =>
      processingFactsError(
        region.facts as unknown as Record<string, unknown>,
        region.map,
        new Set(['area:land']),
        () => true,
      );
    expect(validate()).toBeNull();
    for (const patch of [
      { role: 'fuel' },
      { explanation: '' },
      { resourceId: 'invented' },
      { foodUse: 'support' },
    ]) {
      const original = structuredClone(water);
      Object.assign(water, patch);
      expect(validate()).not.toBeNull();
      if (!('resourceId' in patch))
        expect(assessRegionProductFood(region.facts, dough.id).status).not.toBe('eligible');
      for (const key of Object.keys(water))
        delete (water as unknown as Record<string, unknown>)[key];
      Object.assign(water, original);
    }
    const bread = region.facts.products.find((entry) => entry.productKey === 'wheat-bread')!;
    bread.origin = 'authored';
    expect(removeRegionResourceFact(snapshot, 'products', dough.id)).toBe(snapshot);
    const edited = setRegionResourceFactText(
      snapshot,
      'products',
      dough.id,
      'description',
      'Edited dough',
    );
    expect(edited.facts.products.find((entry) => entry.id === bread.id)?.reason?.status).toBe(
      'stale',
    );
  });
  it('prefers qualified available alternatives and never uses a foreign-owned managed source', () => {
    const region = fixture(['wheat-grain']);
    const resources = accessibleProcessingResources(region, new Set([1]), 'home');
    const wheat = resources.find((entry) => entry.rawResourceId === 'wheat-grain')!;
    const bad = { ...wheat, sourceId: 'aaa-bad', food: { kind: 'not-food' as const } };
    const limited = { ...wheat, sourceId: 'aaa-limited', sourceAvailability: 'limited' as const };
    const plan = planProcessingChain(catalog, [bad, limited, ...resources], 'wheat-bread');
    expect(plan).toMatchObject({ status: 'supported', limited: false });
    expect(
      assessProcessingCapability(catalog, [bad, limited, ...resources], 'wheat-bread').supported,
    ).toBe(true);
    const source = region.facts.resourceSources[0];
    const known = source.definitionId;
    source.definitionId = getBiologicalSourceDefinitions().find(
      (entry) => entry.rawResourceId === 'cotton-seed-fiber',
    )!.id;
    expect(
      accessibleProcessingResources(region, new Set([1]), 'home').some(
        (entry) => entry.rawResourceId === 'wheat-grain',
      ),
    ).toBe(false);
    source.definitionId = known;
    region.facts.managedProduction[0].settlement = { kind: 'embedded', settlementId: 'other' };
    expect(
      accessibleProcessingResources(region, new Set([1]), 'home').some(
        (entry) => entry.rawResourceId === 'wheat-grain',
      ),
    ).toBe(false);
  });
  it('is deterministic under reordered source/settlement facts and respects selection caps across seeds', () => {
    const a = fixture();
    const b = fixture();
    b.facts.resources.reverse();
    b.facts.resourceSources.reverse();
    generateProcessingFacts(a, new RNG('same'));
    generateProcessingFacts(b, new RNG('same'));
    expect(a.facts.products).toEqual(b.facts.products);
    const seen = new Set<string>();
    for (let index = 0; index < 16; index++) {
      const region = fixture();
      generateProcessingFacts(region, new RNG(`finished:${index}`));
      expect(error(region)).toBeNull();
      expect(region.facts.products.length).toBeLessThanOrEqual(24);
      for (const product of region.facts.products) {
        seen.add(product.productKey);
        expect(resolveProcessingChain(region.facts, product.id).issues).toEqual([]);
      }
    }
    expect(seen.size).toBeGreaterThan(10);
  });
});
