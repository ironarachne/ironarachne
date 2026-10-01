import { describe, expect, it } from 'vitest';
import { RNG } from '@ironarachne/rng';
import { getProcessingRecipes, type ProcessingRecipe } from '$lib/resources';
import type { MapNode } from '$lib/map';
import type { Settlement } from '$lib/settlements';
import type Region from './region';
import type { RegionSnapshot } from './region_snapshot';
import type { ResourceFact } from './region_fact_types';
import { emptyRegionFacts, regionFactsError } from './region_facts';
import { generateProcessingFacts } from './region_processing';
import { resolveProcessingChain } from './region_processing_chain';
import { removeRegionResourceFact, setRegionResourceFactText } from './region_resource_editing';
import { removeRegionPlace } from './region_editing';

function node(id: number, neighbors: number[]): MapNode {
  return {
    id,
    neighbors,
    edges: [],
    corners: [],
    polygon: { vertices: [], edges: [] },
    center: { x: id, y: 0 },
    elevation: 0.2,
    temperature: 20,
    moisture: 0.4,
    isWater: false,
    isOcean: false,
    isCoast: false,
    biomeId: 'temperate grassland',
  };
}
function fixture(): Pick<Region, 'facts' | 'map' | 'settlements' | 'settlementIds'> {
  const facts = emptyRegionFacts('current');
  facts.areas.push({
    id: 'area:land',
    name: 'Land',
    description: '',
    origin: 'generated',
    mapNodeIds: [1, 2, 3],
  });
  facts.settlementRoles.push({
    id: 'role:site:home',
    name: 'Site',
    description: '',
    origin: 'generated',
    settlement: { kind: 'embedded', settlementId: 'settlement:home' },
    areaIds: ['area:land'],
    anchor: { nodeIds: [1], edgeIds: [] },
  });
  facts.geology.push({
    id: 'geology:one',
    name: 'Province',
    description: '',
    origin: 'generated',
    areaIds: ['area:land'],
    anchor: { nodeIds: [2, 3], edgeIds: [] },
    setting: { hostRocks: ['basalt', 'granite'], processes: ['volcanic', 'intrusive'] },
  });
  facts.resourceDeposits.push(
    {
      id: 'deposit:iron',
      name: 'Ore',
      description: '',
      origin: 'generated',
      geologyId: 'geology:one',
      resourceName: 'iron ore',
      category: 'metal-ore',
      concentration: 'workable',
      exposure: 'shallow',
      extraction: 'mining',
      anchor: { nodeIds: [2], edgeIds: [] },
    },
    {
      id: 'deposit:stone',
      name: 'Stone',
      description: '',
      origin: 'generated',
      geologyId: 'geology:one',
      resourceName: 'granite',
      category: 'stone',
      concentration: 'workable',
      exposure: 'surface',
      extraction: 'quarrying',
      anchor: { nodeIds: [2], edgeIds: [] },
    },
  );
  const raw = (
    id: string,
    kind: ResourceFact['kind'],
    catalogSource?: ResourceFact['catalogSource'],
    depositIds: string[] = [],
  ): ResourceFact => ({
    id: `resource:${id}`,
    kind,
    name: 'Editable display name',
    description: '',
    origin: 'generated',
    availability: 'limited',
    depositIds,
    catalogSource,
    areaIds: ['area:land'],
    habitatIds: [],
    anchor: { nodeIds: [2], edgeIds: [] },
  });
  facts.resources.push(
    raw('wood', 'timber', { kind: 'building-material', resourceName: 'oak timber' }),
    raw('flax', 'fiber', { kind: 'plant-product', plantName: 'flax', resourceName: 'flax stems' }),
    raw('water', 'freshwater'),
    raw('ore', 'ore', { kind: 'geological-resource', resourceName: 'iron ore' }, ['deposit:iron']),
    raw('meat', 'food', { kind: 'species-product', speciesName: 'goat', resourceName: 'chevon' }),
    raw('stone', 'stone', { kind: 'geological-resource', resourceName: 'granite' }, [
      'deposit:stone',
    ]),
  );
  return {
    facts,
    map: {
      width: 10,
      height: 10,
      nodes: [node(1, [2]), node(2, [1]), node(3, [])],
      edges: [],
      corners: [],
    },
    settlements: [{ name: 'Home', mapNodeId: 1 } as Settlement],
    settlementIds: ['settlement:home'],
  };
}
const recipes = (...families: string[]) => ({
  recipes: getProcessingRecipes().filter((recipe) => families.includes(recipe.family)),
});
function processed(...families: string[]) {
  const region = fixture();
  generateProcessingFacts(region, new RNG('process'), recipes(...families));
  return region;
}

describe('saved local processing chains', () => {
  it('saves complete iron and linen chains, including fuel, handles, water and evidence', () => {
    const region = processed('iron', 'textile');
    expect(region.facts!.products.map((entry) => entry.productKey).sort()).toEqual(
      ['bloomery-iron', 'charcoal', 'flax-yarn', 'iron-tools', 'linen', 'prepared-flax'].sort(),
    );
    expect(regionFactsError(region.facts, region.map, [] as never)).not.toBeNull(); // Embedded target must resolve in the saved wrapper list.
    expect(
      regionFactsError(region.facts, region.map, [
        { id: 'settlement:home', snapshot: region.settlements[0] as never },
      ]),
    ).toBeNull();
    const tools = region.facts!.products.find((entry) => entry.productKey === 'iron-tools')!;
    const chain = resolveProcessingChain(region.facts!, tools.id);
    expect(chain.issues).toEqual([]);
    expect(chain.products.map((entry) => entry.productKey)).toEqual([
      'charcoal',
      'bloomery-iron',
      'iron-tools',
    ]);
    expect(new Set(chain.localInputs.map((entry) => entry.resourceId))).toEqual(
      new Set(['resource:wood', 'resource:ore']),
    );
    expect(chain.imports).toEqual([]);
    expect(
      chain.localInputs.find((entry) => entry.resourceId === 'resource:ore')!.depositIds,
    ).toEqual(['deposit:iron']);
  });
  it.each(['resource:wood', 'resource:ore'])('omits iron tools when %s is missing', (id) => {
    const region = fixture();
    region.facts!.resources = region.facts!.resources.filter((entry) => entry.id !== id);
    generateProcessingFacts(region, new RNG('missing'), recipes('iron'));
    expect(region.facts!.products).toEqual([]);
  });
  it('does not substitute reed fiber for cloth, or assume a missing retting water supply', () => {
    const reeds = fixture();
    reeds.facts!.resources.find((entry) => entry.id === 'resource:flax')!.catalogSource = {
      kind: 'plant-product',
      plantName: 'reeds',
      resourceName: 'reeds stems',
    };
    generateProcessingFacts(reeds, new RNG('reeds'), recipes('textile', 'fiber'));
    expect(reeds.facts!.products.map((entry) => entry.productKey)).toEqual(['woven-mats']);
    const dry = fixture();
    dry.facts!.resources = dry.facts!.resources.filter((entry) => entry.kind !== 'freshwater');
    generateProcessingFacts(dry, new RNG('dry'), recipes('textile'));
    expect(dry.facts!.products).toEqual([]);
  });
  it.each([
    'absent',
    'unknown',
    'stale',
    'disconnected',
    'outside-source',
    'deep',
    'trace',
    'drilling',
  ])('omits %s inputs instead of importing or inventing a product', (mode) => {
    const region = fixture();
    const ore = region.facts!.resources.find((entry) => entry.kind === 'ore')!;
    const deposit = region.facts!.resourceDeposits[0];
    if (mode === 'absent') ore.availability = 'not-observed';
    if (mode === 'unknown') ore.availability = 'unknown';
    if (mode === 'stale') {
      region.facts!.geology[0].reason = {
        ruleId: 'test',
        status: 'stale',
        sources: [{ kind: 'fact', factId: 'area:land' }],
      };
      deposit.reason = {
        ruleId: 'test',
        status: 'current',
        sources: [{ kind: 'fact', factId: 'geology:one' }],
      };
    }
    if (mode === 'outside-source') ore.anchor!.nodeIds = [3];
    if (mode === 'disconnected') {
      ore.anchor!.nodeIds = [3];
      deposit.anchor.nodeIds = [3];
    }
    if (mode === 'deep') deposit.exposure = 'deep';
    if (mode === 'trace') deposit.concentration = 'trace';
    if (mode === 'drilling') deposit.extraction = 'drilling';
    generateProcessingFacts(region, new RNG(mode), recipes('iron'));
    expect(region.facts!.products).toEqual([]);
  });
  it('records timber, preserved food and stone families and never exceeds the closed-chain cap', () => {
    const region = processed('timber', 'food', 'stone');
    expect(new Set(region.facts!.products.map((entry) => entry.productKey))).toContain(
      'construction-components',
    );
    expect(region.facts!.products.length).toBeGreaterThanOrEqual(4);
    for (let i = 0; i < 15; i++) {
      const all = fixture();
      generateProcessingFacts(all, new RNG(`all:${i}`));
      expect(all.facts!.products.length).toBeLessThanOrEqual(12);
      for (const product of all.facts!.products)
        expect(resolveProcessingChain(all.facts!, product.id).issues).toEqual([]);
    }
  });
  it('is repeatable under reordered catalogs and graph inputs and ignores display names', () => {
    const a = fixture();
    const b = fixture();
    b.map.nodes.reverse();
    b.facts!.resources.reverse();
    b.facts!.resources.forEach((entry) => {
      entry.name = 'Another display name';
    });
    generateProcessingFacts(a, new RNG('same'));
    generateProcessingFacts(b, new RNG('same'), { recipes: getProcessingRecipes().reverse() });
    expect(b.facts!.products).toEqual(a.facts!.products);
    const c = fixture();
    generateProcessingFacts(c, new RNG('different'));
    expect(c.facts!.products).not.toEqual(a.facts!.products);
  });
  it('requires a current placed embedded settlement and site role', () => {
    for (const mode of ['unplaced', 'water', 'missing-id', 'missing-role', 'stale-role']) {
      const region = fixture();
      if (mode === 'unplaced') region.settlements[0].mapNodeId = 99;
      if (mode === 'water') region.map.nodes[0].isWater = true;
      if (mode === 'missing-id') region.settlementIds = [];
      if (mode === 'missing-role') region.facts!.settlementRoles = [];
      if (mode === 'stale-role')
        region.facts!.settlementRoles[0].reason = {
          ruleId: 'old',
          status: 'stale',
          sources: [{ kind: 'fact', factId: 'area:land' }],
        };
      generateProcessingFacts(region, new RNG('site'));
      expect(region.facts!.products).toEqual([]);
    }
    const empty = fixture();
    empty.facts = undefined;
    expect(() => generateProcessingFacts(empty, new RNG('empty'))).not.toThrow();
  });
  it('rejects cyclic, unsupported and incomplete recipe candidates', () => {
    const template = getProcessingRecipes()[0];
    const custom: ProcessingRecipe[] = [
      {
        ...template,
        outputKey: 'cycle-a',
        inputs: [{ role: 'material', selector: { kind: 'product', productKey: 'cycle-b' } }],
      },
      {
        ...template,
        id: 'b',
        outputKey: 'cycle-b',
        inputs: [{ role: 'material', selector: { kind: 'product', productKey: 'cycle-a' } }],
      },
      {
        ...template,
        id: 'cycle-terminal',
        outputKey: 'cycle-terminal',
        inputs: [{ role: 'material', selector: { kind: 'product', productKey: 'cycle-a' } }],
      },
      { ...template, id: 'c', outputKey: 'empty', inputs: [] },
      { ...template, id: 'd', outputKey: 'unknown', technique: 'petrochemicals' },
      {
        ...template,
        id: 'e',
        outputKey: 'missing',
        inputs: [{ role: 'material', selector: { kind: 'product', productKey: 'missing-parent' } }],
      },
    ];
    const region = fixture();
    generateProcessingFacts(region, new RNG('cycles'), { recipes: custom });
    expect(region.facts!.products).toEqual([]);
  });
  it('reports missing/stale/cyclic saved links and keeps authored imported inputs explicit', () => {
    const region = processed('timber');
    const final = region.facts!.products.find(
      (entry) => entry.productKey === 'construction-components',
    )!;
    region.facts!.resources[0].availability = 'unknown';
    expect(resolveProcessingChain(region.facts!, final.id).issues.length).toBeGreaterThan(0);
    final.inputs = [
      {
        kind: 'import',
        role: 'material',
        resourceName: 'foreign lumber',
        explanation: 'Authored supply from abroad',
      },
    ];
    final.reason = undefined;
    final.origin = 'authored';
    const imported = resolveProcessingChain(region.facts!, final.id);
    expect(imported.imports[0].resourceName).toBe('foreign lumber');
    expect(imported.localInputs).toEqual([]);
    final.inputs = [{ kind: 'product', role: 'material', productId: final.id }];
    expect(
      resolveProcessingChain(region.facts!, final.id).issues.some((issue) =>
        issue.includes('Cyclic'),
      ),
    ).toBe(true);
    final.inputs = [{ kind: 'product', role: 'material', productId: 'product:missing' }];
    expect(
      resolveProcessingChain(region.facts!, final.id).issues.some((issue) =>
        issue.includes('Missing'),
      ),
    ).toBe(true);
  });
  it('preserves authored chains and stales downstream facts when resource or product text changes', () => {
    const region = processed('timber');
    const saved = {
      ...region,
      settlements: [{ id: 'settlement:home', snapshot: region.settlements[0] }],
    } as unknown as RegionSnapshot;
    const final = saved.facts.products.find(
      (entry) => entry.productKey === 'construction-components',
    )!;
    const edited = setRegionResourceFactText(
      saved,
      'resources',
      'resource:wood',
      'name',
      'Authored source',
    );
    expect(edited.facts.products.every((entry) => entry.reason!.status === 'stale')).toBe(true);
    const renamed = setRegionResourceFactText(
      saved,
      'products',
      final.id,
      'description',
      'Authored chain',
    );
    expect(renamed.facts.products.find((entry) => entry.id === final.id)!.origin).toBe('authored');
    expect(removeRegionResourceFact(renamed, 'resources', 'resource:wood')).toBe(renamed);
    expect(removeRegionResourceFact(saved, 'resources', 'resource:wood').facts.products).toEqual(
      [],
    );
    expect(removeRegionPlace(saved, 'settlements', 0).facts.products).toEqual([]);
    final.origin = 'authored';
    expect(removeRegionPlace(saved, 'settlements', 0)).toBe(saved);
  });
  it('validates saved links, anchors, current supply and explicit imports without a live recipe catalog', () => {
    const region = processed('timber');
    const validate = () =>
      regionFactsError(region.facts, region.map, [
        { id: 'settlement:home', snapshot: region.settlements[0] as never },
      ]);
    const product = region.facts!.products.find(
      (entry) => entry.productKey === 'construction-components',
    )!;
    const original = structuredClone(product);
    product.recipeId = 'future:unknown-recipe';
    product.productKey = 'future:unknown-product';
    expect(validate()).toBeNull();
    product.inputs = [
      {
        kind: 'import',
        role: 'material',
        resourceName: 'foreign lumber',
        explanation: 'A saved imported supply',
      },
    ];
    expect(validate()).toBeNull();
    if (product.inputs[0].kind === 'import') product.inputs[0].explanation = '';
    expect(validate()).toContain('explanation');
    product.inputs = [{ kind: 'product', role: 'material', productId: product.id }];
    expect(validate()).toContain('cyclic');
    product.inputs = [{ kind: 'product', role: 'material', productId: 'product:missing' }];
    expect(validate()).toContain('unknown product');
    Object.assign(product, original);
    region.facts!.products[0].reason!.status = 'stale';
    expect(validate()).toContain('stale intermediate');
    product.reason!.status = 'stale';
    expect(validate()).toBeNull();
    region.facts!.products.forEach((entry) => {
      entry.reason!.status = 'current';
    });
    region.facts!.resources[0].availability = 'unknown';
    expect(validate()).toContain('unavailable');
    region.facts!.resources[0].availability = 'limited';
    region.facts!.products[0].inputs = [
      {
        kind: 'resource',
        role: 'material',
        resourceId: 'resource:wood',
        depositIds: [],
        anchor: { nodeIds: [1], edgeIds: [] },
      },
    ];
    expect(validate()).toContain('outside its source');
    product.inputs = [];
    expect(validate()).not.toBeNull();
  });
  it('enforces the depth cap even when intermediate outputs are shared and cached', () => {
    const template = getProcessingRecipes()[0];
    const custom: ProcessingRecipe[] = Array.from({ length: 5 }, (_, index) => ({
      ...template,
      id: `step:${index}`,
      outputKey: `step:${index}`,
      inputs:
        index === 0
          ? template.inputs
          : [{ role: 'material', selector: { kind: 'product', productKey: `step:${index - 1}` } }],
    }));
    custom.push({
      ...template,
      id: 'first-terminal',
      outputKey: 'first-terminal',
      family: 'first',
      inputs: [{ role: 'material', selector: { kind: 'product', productKey: 'step:1' } }],
    });
    const region = fixture();
    generateProcessingFacts(region, new RNG('depth'), { recipes: custom });
    expect(region.facts!.products.map((entry) => entry.productKey)).toEqual([
      'step:0',
      'step:1',
      'first-terminal',
    ]);
  });
});
