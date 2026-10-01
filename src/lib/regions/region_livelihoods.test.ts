import { afterEach, describe, expect, it, vi } from 'vitest';
import { RNG } from '@ironarachne/rng';
import * as Resources from '$lib/resources';
import type { MapNode } from '$lib/map';
import type { Settlement, SettlementSnapshot } from '$lib/settlements';
import type Region from './region';
import type { RegionFacts, ResourceFact } from './region_fact_types';
import type { RegionSnapshot } from './region_snapshot';
import type { DailyLifeCategory, DailyLifeInput } from './region_livelihood_types';
import { emptyRegionFacts, regionFactsError } from './region_facts';
import { generateLivelihoodFacts, DAILY_LIFE_LIMITS } from './region_livelihoods';
import { generateProcessingFacts } from './region_processing';
import { createRegionStageRng } from './region_generation_passes';
import { resolveProcessingChain } from './region_processing_chain';
import {
  accessibleDailyLifeResources,
  dailyLifeInputCurrent,
  sameSettlement,
} from './region_livelihood_access';
import {
  settlementDailyLifeContext,
  describeSettlementDailyLife,
} from './region_livelihood_presentation';
import { removeRegionResourceFact, setRegionResourceFactText } from './region_resource_editing';
import { canRemoveRegionSettlement, removeRegionPlace } from './region_editing';

const target = { kind: 'embedded', settlementId: 'settlement:home' } as const;
function node(id: number, neighbors: number[], water = false): MapNode {
  return {
    id,
    neighbors,
    edges: [],
    corners: [],
    polygon: { vertices: [], edges: [] },
    center: { x: id, y: 0 },
    elevation: 0.2,
    temperature: 20,
    moisture: 0.5,
    isWater: water,
    isOcean: false,
    isCoast: false,
  };
}
function raw(
  id: string,
  kind: ResourceFact['kind'],
  catalogSource?: ResourceFact['catalogSource'],
  nodes = [2],
): ResourceFact {
  return {
    id: `resource:${id}`,
    kind,
    name: 'Editable source',
    description: '',
    origin: 'generated',
    availability: 'limited',
    depositIds: [],
    catalogSource,
    areaIds: ['area:land'],
    habitatIds: [],
    anchor: { nodeIds: nodes, edgeIds: [] },
  };
}
function fixture(): Pick<Region, 'facts' | 'map' | 'settlements' | 'settlementIds'> & {
  facts: RegionFacts;
} {
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
    name: 'A renamed role',
    description: '',
    origin: 'generated',
    settlement: target,
    areaIds: ['area:land'],
    anchor: { nodeIds: [1], edgeIds: [] },
    reason: {
      ruleId: 'fantasy:region:forest-settlement:v1',
      status: 'current',
      sources: [{ kind: 'fact', factId: 'area:land' }],
    },
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
  for (const [id, resourceName, category] of [
    ['stone', 'granite', 'stone'],
    ['ore', 'iron ore', 'metal-ore'],
  ] as const) {
    const resource = raw(id, id === 'ore' ? 'ore' : 'stone', {
      kind: 'geological-resource',
      resourceName,
    });
    resource.depositIds = [`deposit:${id}`];
    facts.resources.push(resource);
    facts.resourceDeposits.push({
      id: `deposit:${id}`,
      name: resourceName,
      description: '',
      origin: 'generated',
      geologyId: 'geology:one',
      resourceName,
      category,
      concentration: 'workable',
      exposure: category === 'stone' ? 'surface' : 'shallow',
      extraction: category === 'stone' ? 'quarrying' : 'mining',
      anchor: { nodeIds: [2], edgeIds: [] },
    });
  }
  facts.resources.push(
    raw('wood', 'timber', { kind: 'building-material', resourceName: 'oak timber' }),
    raw('water', 'freshwater'),
    raw('ground', 'arable-land'),
    raw('flax', 'fiber', { kind: 'plant-product', plantName: 'flax', resourceName: 'flax stems' }),
    raw('reeds', 'fiber', {
      kind: 'plant-product',
      plantName: 'reeds',
      resourceName: 'reeds stems',
    }),
    raw('meat', 'food', { kind: 'species-product', speciesName: 'goat', resourceName: 'chevon' }),
  );
  return {
    facts,
    map: {
      width: 10,
      height: 10,
      nodes: [node(1, [2, 4]), node(2, [1]), node(3, []), node(4, [1], true)],
      edges: [],
      corners: [],
    },
    settlements: [{ name: 'Home', mapNodeId: 1 } as Settlement],
    settlementIds: ['settlement:home'],
  };
}
function derive(region = fixture(), seed = 'living') {
  generateLivelihoodFacts(region, createRegionStageRng(seed, 'livelihoods'));
  return region;
}
function saved(region = derive()): RegionSnapshot {
  return {
    ...region,
    settlements: region.settlements.map((snapshot, i) => ({
      id: region.settlementIds![i],
      snapshot,
    })),
  } as unknown as RegionSnapshot;
}
function validate(region: ReturnType<typeof fixture>) {
  return regionFactsError(
    region.facts,
    region.map,
    region.settlements.map((snapshot, i) => ({
      id: region.settlementIds![i],
      snapshot: snapshot as unknown as SettlementSnapshot,
    })),
  );
}
function process(region: ReturnType<typeof fixture>, families: string[]) {
  generateProcessingFacts(region, new RNG('processing'), {
    recipes: Resources.getProcessingRecipes().filter((recipe) => families.includes(recipe.family)),
  });
  return region;
}
afterEach(() => vi.restoreAllMocks());

describe('supported settlement daily life', () => {
  it('records bounded distinct foods, materials and fuel with inspectable sources and limited supply', () => {
    const region = fixture();
    const before = structuredClone(region);
    derive(region);
    expect({ ...region, facts: { ...region.facts, dailyLife: [] } }).toEqual(before);
    expect(validate(region)).toBeNull();
    const context = settlementDailyLifeContext(region.facts, target);
    expect(context.staple.map((fact) => fact.name)).toEqual(['chevon']);
    expect(context['building-material'].map((fact) => fact.name).sort()).toEqual([
      'granite',
      'oak timber',
      'reeds stems thatch',
    ]);
    expect(context.fuel.map((fact) => fact.name)).toEqual(['oak timber fuel']);
    expect(context.craft).toEqual([]);
    expect(context.livelihood.some((fact) => fact.activityKey === 'timber-gathering')).toBe(true);
    for (const category of Object.keys(context) as DailyLifeCategory[])
      expect(context[category].length).toBeLessThanOrEqual(DAILY_LIFE_LIMITS[category]);
    for (const fact of region.facts.dailyLife) {
      expect(fact.description).toContain('supply is limited');
      expect(fact.reason!.sources).toContainEqual({ kind: 'fact', factId: 'role:site:home' });
      for (const input of fact.inputs)
        expect(dailyLifeInputCurrent(region.facts, region.map, 1, target, input)).toBe(true);
    }
    expect(describeSettlementDailyLife(region.facts, target)).toContain('incomplete food picture');
  });

  it('contrasts forest, cultivation and quarry sites without inventing grain or manufactured goods', () => {
    const forest = fixture();
    forest.facts.resources = forest.facts.resources.filter((fact) => fact.kind === 'timber');
    const quarry = fixture();
    quarry.facts.resources = quarry.facts.resources.filter((fact) => fact.kind === 'stone');
    const farm = fixture();
    farm.facts.resources = farm.facts.resources.filter((fact) =>
      ['arable-land', 'freshwater'].includes(fact.kind),
    );
    farm.facts.settlementRoles[0].reason!.ruleId = 'fantasy:region:agricultural-site:v1';
    expect(
      derive(forest)
        .facts.dailyLife.map((fact) => fact.activityKey)
        .sort(),
    ).toEqual(['timber-building', 'timber-gathering', 'wood-fuel']);
    expect(
      derive(quarry)
        .facts.dailyLife.map((fact) => fact.activityKey)
        .sort(),
    ).toEqual(['quarry-stone', 'raw-extraction']);
    expect(derive(farm).facts.dailyLife.map((fact) => fact.activityKey)).toEqual([
      'cultivation-opportunity',
    ]);
    expect(farm.facts.dailyLife[0].inputs).toHaveLength(2);
    expect(farm.facts.dailyLife[0].description).toContain('no named crop');
    expect(settlementDailyLifeContext(farm.facts, target).staple).toEqual([]);
    farm.facts.dailyLife = [];
    farm.facts.resources = farm.facts.resources.filter((fact) => fact.kind !== 'freshwater');
    expect(derive(farm).facts.dailyLife).toEqual([]);
  });

  it('requires actual shore supply for fishing, rather than a port label or distant water', () => {
    // The current species catalog has no fish carcass subtype. A controlled future catalog
    // descriptor exercises shore access without adding fictitious fish to production data.
    const original = Resources.deriveResourcesFromSpecies;
    vi.spyOn(Resources, 'deriveResourcesFromSpecies').mockImplementation((species) =>
      species.name === 'crab'
        ? [
            {
              name: 'test fish',
              description: '',
              major_type: 'organic',
              minor_type: 'fish',
              is_refineable: false,
              properties: [],
              commonality: 1,
            },
          ]
        : original(species),
    );
    const region = fixture();
    region.facts.resources = [
      raw(
        'fish',
        'fish',
        { kind: 'species-product', speciesName: 'crab', resourceName: 'test fish' },
        [4],
      ),
    ];
    region.facts.settlementRoles[0].reason!.ruleId = 'fantasy:region:coastal-port-site:v1';
    derive(region);
    expect(region.facts.dailyLife.map((fact) => fact.activityKey).sort()).toEqual([
      'fish-food',
      'fishing',
    ]);
    expect(validate(region)).toBeNull();
    region.facts.dailyLife = [];
    region.map.nodes.push(node(5, [], true));
    region.facts.resources[0].anchor!.nodeIds = [5];
    expect(derive(region).facts.dailyLife).toEqual([]);
    region.facts.resources[0].anchor!.nodeIds = [1];
    expect(derive(region).facts.dailyLife).toHaveLength(2);
  });

  it('uses complete local iron and linen chains for household crafts and charcoal fuel', () => {
    const region = process(fixture(), ['iron', 'textile']);
    derive(region);
    expect(validate(region)).toBeNull();
    const context = settlementDailyLifeContext(region.facts, target);
    expect(context.craft.map((fact) => fact.name).sort()).toEqual([
      'Basic iron toolmaking',
      'Linen weaving',
    ]);
    expect(context.fuel.some((fact) => fact.activityKey === 'charcoal-fuel')).toBe(true);
    const linen = context.craft.find((fact) => fact.name === 'Linen weaving')!;
    const input = linen.inputs[0];
    if (input.kind !== 'product') throw new Error('Expected product');
    expect(
      resolveProcessingChain(region.facts, input.productId).localInputs.map(
        (leaf) => leaf.resourceId,
      ),
    ).toContain('resource:water');
    expect(linen.description).toContain('loom');
    expect(linen.description).toContain('supply is limited');
    region.facts.resources.find((fact) => fact.kind === 'freshwater')!.availability = 'unknown';
    region.facts.dailyLife = [];
    derive(region);
    expect(settlementDailyLifeContext(region.facts, target).craft.map((fact) => fact.name)).toEqual(
      ['Basic iron toolmaking'],
    );
    region.facts.resources.find((fact) => fact.kind === 'timber')!.availability = 'unknown';
    region.facts.dailyLife = [];
    expect(
      derive(region).facts.dailyLife.some(
        (fact) => fact.category === 'craft' || fact.activityKey === 'charcoal-fuel',
      ),
    ).toBe(false);
  });

  it('keeps food preservation, woodwork, mats and stonework tied to saved outputs', () => {
    for (const family of ['food', 'timber', 'fiber', 'stone']) {
      const region = derive(process(fixture(), [family]));
      expect(validate(region)).toBeNull();
      expect(settlementDailyLifeContext(region.facts, target).craft.length).toBeGreaterThan(0);
      for (const fact of region.facts.dailyLife.filter(
        (entry) => entry.inputs[0].kind === 'product',
      ))
        expect(fact.description).toContain('saved');
    }
  });

  it.each([
    'missing',
    'unknown',
    'not-observed',
    'stale',
    'disconnected',
    'trace',
    'deep',
    'drilling',
  ])('omits %s sources rather than filling a category', (mode) => {
    const region = fixture();
    region.facts.resources = region.facts.resources.filter((fact) => fact.kind === 'stone');
    const source = region.facts.resources[0];
    const deposit = region.facts.resourceDeposits[0];
    if (mode === 'missing') region.facts.resources = [];
    if (mode === 'unknown' || mode === 'not-observed') source.availability = mode;
    if (mode === 'stale')
      source.reason = {
        ruleId: 'old',
        status: 'stale',
        sources: [{ kind: 'fact', factId: 'area:land' }],
      };
    if (mode === 'disconnected') {
      source.anchor!.nodeIds = [3];
      deposit.anchor.nodeIds = [3];
    }
    if (mode === 'trace') deposit.concentration = 'trace';
    if (mode === 'deep') deposit.exposure = 'deep';
    if (mode === 'drilling') deposit.extraction = 'drilling';
    expect(derive(region).facts.dailyLife).toEqual([]);
  });

  it('uses only accessible deposits of a mixed source', () => {
    const region = fixture();
    region.facts.resources = region.facts.resources.filter((fact) => fact.kind === 'stone');
    region.facts.resourceDeposits.push({
      ...region.facts.resourceDeposits[0],
      id: 'deposit:deep',
      exposure: 'deep',
      anchor: { nodeIds: [3], edgeIds: [] },
    });
    region.facts.resources[0].depositIds.push('deposit:deep');
    region.facts.resources[0].anchor!.nodeIds.push(3);
    for (const fact of derive(region).facts.dailyLife)
      expect(fact.inputs).toEqual([
        {
          kind: 'resource',
          resourceId: 'resource:stone',
          depositIds: ['deposit:stone'],
          anchor: { nodeIds: [2], edgeIds: [] },
        },
      ]);
  });

  it('does not infer cloth from raw reeds/flax or crafts from missing, imported or unknown products', () => {
    expect(settlementDailyLifeContext(derive().facts, target).craft).toEqual([]);
    const region = process(fixture(), ['textile']);
    const linen = region.facts.products.find((fact) => fact.productKey === 'linen')!;
    linen.inputs = [
      {
        kind: 'import',
        role: 'material',
        resourceName: 'foreign yarn',
        explanation: 'Authored supply',
      },
    ];
    linen.reason = undefined;
    expect(settlementDailyLifeContext(derive(region).facts, target).craft).toEqual([]);
    linen.inputs = [{ kind: 'product', role: 'material', productId: 'product:missing' }];
    region.facts.dailyLife = [];
    expect(settlementDailyLifeContext(derive(region).facts, target).craft).toEqual([]);
    linen.inputs = [{ kind: 'product', role: 'material', productId: linen.id }];
    region.facts.dailyLife = [];
    expect(settlementDailyLifeContext(derive(region).facts, target).craft).toEqual([]);
    linen.productKey = 'toString';
    linen.inputs = [
      {
        kind: 'resource',
        role: 'material',
        resourceId: 'resource:wood',
        anchor: { nodeIds: [2], edgeIds: [] },
        depositIds: [],
      },
    ];
    region.facts.dailyLife = [];
    expect(settlementDailyLifeContext(derive(region).facts, target).craft).toEqual([]);
  });

  it.each(['missing-id', 'missing-role', 'stale-role', 'water-site', 'unplaced', 'no-area'])(
    'requires a valid current settlement site: %s',
    (mode) => {
      const region = fixture();
      if (mode === 'missing-id') region.settlementIds = [];
      if (mode === 'missing-role') region.facts.settlementRoles = [];
      if (mode === 'stale-role') region.facts.settlementRoles[0].reason!.status = 'stale';
      if (mode === 'water-site') region.map.nodes[0].isWater = true;
      if (mode === 'unplaced') region.settlements[0].mapNodeId = undefined;
      if (mode === 'no-area') region.facts.settlementRoles[0].areaIds = [];
      expect(derive(region).facts.dailyLife).toEqual([]);
    },
  );

  it('handles absent facts and empty categories', () => {
    const region = fixture();
    expect(() =>
      generateLivelihoodFacts({ ...region, facts: undefined }, new RNG('empty')),
    ).not.toThrow();
    expect(describeSettlementDailyLife(region.facts, target)).toBe('');
    expect(
      settlementDailyLifeContext(derive(region).facts, { kind: 'artifact', targetId: 'other' })
        .staple,
    ).toEqual([]);
    expect(
      sameSettlement({ kind: 'artifact', targetId: 'one' }, { kind: 'artifact', targetId: 'one' }),
    ).toBe(true);
    expect(
      sameSettlement({ kind: 'artifact', targetId: 'one' }, { kind: 'artifact', targetId: 'two' }),
    ).toBe(false);
  });

  it('is stable under reordered inputs, names and equivalent settlement lists and varies with seed', () => {
    const a = process(fixture(), ['iron', 'textile', 'timber']);
    const b = structuredClone(a);
    b.facts.resources.reverse();
    b.facts.products.reverse();
    b.map.nodes.reverse();
    b.facts.resourceDeposits.reverse();
    b.facts.resources.forEach((fact) => {
      fact.name = 'Renamed';
    });
    b.facts.settlementRoles[0].name = 'A completely different label';
    derive(a);
    derive(b);
    expect(b.facts.dailyLife).toEqual(a.facts.dailyLife);
    const c = derive(process(fixture(), ['iron', 'textile', 'timber']), 'different');
    expect(c.facts.dailyLife).not.toEqual(a.facts.dailyLife);
    const multi = fixture();
    multi.settlements.push({ name: 'Second', mapNodeId: 2 } as Settlement);
    multi.settlementIds!.push('settlement:second');
    multi.facts.settlementRoles.push({
      ...multi.facts.settlementRoles[0],
      id: 'role:site:second',
      settlement: { kind: 'embedded', settlementId: 'settlement:second' },
      anchor: { nodeIds: [2], edgeIds: [] },
    });
    const shuffled = structuredClone(multi);
    shuffled.settlements.reverse();
    shuffled.settlementIds!.reverse();
    shuffled.facts.settlementRoles.reverse();
    expect(derive(shuffled).facts.dailyLife).toEqual(derive(multi).facts.dailyLife);
  });

  it('rejects a product for a different settlement or an inaccessible local chain leaf', () => {
    const region = process(fixture(), ['textile']);
    const linen = region.facts.products.find((fact) => fact.productKey === 'linen')!;
    linen.settlement = { kind: 'artifact', targetId: 'other' };
    expect(settlementDailyLifeContext(derive(region).facts, target).craft).toEqual([]);
    linen.settlement = target;
    region.facts.resources.find((fact) => fact.kind === 'freshwater')!.anchor!.nodeIds = [3];
    region.facts.dailyLife = [];
    expect(settlementDailyLifeContext(derive(region).facts, target).craft).toEqual([]);
    expect(
      accessibleDailyLifeResources(region, 1).every((entry) => entry.fact.kind !== 'freshwater'),
    ).toBe(true);
  });
});

describe('saved daily-life edits and dependency safety', () => {
  it('retains authored text and IDs, stales transitive explanations and protects inbound authored work', () => {
    const snapshot = saved(derive(process(fixture(), ['timber'])));
    const fact = snapshot.facts.dailyLife.find((entry) => entry.category === 'craft')!;
    const changed = setRegionResourceFactText(
      snapshot,
      'dailyLife',
      fact.id,
      'description',
      'My local carpenters',
    );
    expect(changed.facts.dailyLife.find((entry) => entry.id === fact.id)).toMatchObject({
      origin: 'authored',
      description: 'My local carpenters',
      inputs: fact.inputs,
    });
    expect(removeRegionResourceFact(changed, 'resources', 'resource:wood')).toBe(changed);
    expect(removeRegionResourceFact(changed, 'settlementRoles', 'role:site:home')).toBe(changed);
    expect(canRemoveRegionSettlement(changed, 0)).toBe(false);
    expect(removeRegionPlace(changed, 'settlements', 0)).toBe(changed);
    const sourceEdit = setRegionResourceFactText(
      snapshot,
      'resources',
      'resource:wood',
      'name',
      'Changed timber',
    );
    expect(
      sourceEdit.facts.dailyLife
        .filter((entry) => entry.activityKey.includes('timber') || entry.category === 'craft')
        .every((entry) => entry.reason!.status === 'stale'),
    ).toBe(true);
    expect(describeSettlementDailyLife(sourceEdit.facts, target)).toContain('needs review');
    expect(describeSettlementDailyLife(sourceEdit.facts, target)).not.toContain(
      'Woodworking is plausible',
    );
    expect(regionFactsError(sourceEdit.facts, sourceEdit.map, sourceEdit.settlements)).toBeNull();
  });

  it('removes generated dependents on raw/product/site/settlement removal and stales reason-only descendants', () => {
    const snapshot = saved(derive(process(fixture(), ['timber'])));
    const craft = snapshot.facts.dailyLife.find((fact) => fact.category === 'craft')!;
    snapshot.facts.claims.push({
      id: 'claim:daily',
      name: 'Daily claim',
      description: '',
      origin: 'generated',
      subjectId: 'area:land',
      relatedIds: [],
      reason: { ruleId: 'test', status: 'current', sources: [{ kind: 'fact', factId: craft.id }] },
    });
    const rawRemoved = removeRegionResourceFact(snapshot, 'resources', 'resource:wood');
    expect(
      rawRemoved.facts.dailyLife.some(
        (fact) => fact.category === 'craft' || fact.activityKey.includes('timber'),
      ),
    ).toBe(false);
    expect(rawRemoved.facts.claims[0].reason!.status).toBe('stale');
    expect(regionFactsError(rawRemoved.facts, rawRemoved.map, rawRemoved.settlements)).toBeNull();
    const productInput = craft.inputs[0];
    if (productInput.kind !== 'product') throw new Error('Expected product');
    expect(
      removeRegionResourceFact(snapshot, 'products', productInput.productId).facts.dailyLife.some(
        (fact) => fact.id === craft.id,
      ),
    ).toBe(false);
    expect(
      removeRegionResourceFact(snapshot, 'settlementRoles', 'role:site:home').facts.dailyLife,
    ).toEqual([]);
    expect(removeRegionPlace(snapshot, 'settlements', 0).facts.dailyLife).toEqual([]);
    snapshot.facts.claims[0].origin = 'authored';
    expect(removeRegionPlace(snapshot, 'settlements', 0)).toBe(snapshot);
    expect(setRegionResourceFactText(snapshot, 'dailyLife', 'missing', 'name', 'No edit')).toBe(
      snapshot,
    );
    expect(removeRegionResourceFact(snapshot, 'dailyLife', 'missing')).toBe(snapshot);
  });
});

describe('daily-life payload validation', () => {
  it.each([
    ['category', 'future', 'category'],
    ['activityKey', '', 'identity'],
    ['siteRoleId', 'role:missing', 'site role'],
    ['settlement', { kind: 'embedded', settlementId: 'missing' }, 'location'],
    ['areaIds', ['area:missing'], 'areas'],
    ['anchor', { nodeIds: [2], edgeIds: [] }, 'site'],
    ['anchor', { nodeIds: [999], edgeIds: [] }, 'location'],
    ['inputs', [], 'no inputs'],
    ['inputs', [null], 'invalid input'],
    ['inputs', [{ kind: 'import' }], 'unknown input'],
    ['inputs', [{ kind: 'product', productId: 'product:missing' }], 'unknown product'],
    [
      'inputs',
      [
        {
          kind: 'resource',
          resourceId: 'resource:missing',
          anchor: { nodeIds: [2], edgeIds: [] },
          depositIds: [],
        },
      ],
      'unknown',
    ],
    [
      'inputs',
      [
        {
          kind: 'resource',
          resourceId: 'resource:wood',
          anchor: { nodeIds: [1], edgeIds: [] },
          depositIds: [],
        },
      ],
      'outside',
    ],
    [
      'inputs',
      [
        {
          kind: 'resource',
          resourceId: 'resource:stone',
          anchor: { nodeIds: [2], edgeIds: [] },
          depositIds: [],
        },
      ],
      'deposit subset',
    ],
    [
      'inputs',
      [{ kind: 'resource', resourceId: '', anchor: null, depositIds: [] }],
      'invalid resource',
    ],
  ] as const)('rejects malformed %s without discarding work', (field, value, message) => {
    const region = derive();
    const rawFact = region.facts.dailyLife[0] as unknown as Record<string, unknown>;
    rawFact[field] = structuredClone(value);
    expect(validate(region)).toContain(message);
  });

  it('checks current supply/access but preserves structurally valid stale or authored facts and unknown activity keys', () => {
    const region = derive();
    const wood = region.facts.resources.find((fact) => fact.kind === 'timber')!;
    wood.availability = 'unknown';
    expect(validate(region)).toContain('unavailable');
    for (const fact of region.facts.dailyLife) fact.reason!.status = 'stale';
    expect(validate(region)).toBeNull();
    for (const fact of region.facts.dailyLife) {
      fact.origin = 'authored';
      fact.activityKey = 'future:activity';
    }
    expect(validate(region)).toBeNull();
    region.settlements[0].mapNodeId = 2;
    expect(validate(region)).toContain('settlement site');
  });

  it('validates product settlement ownership and geological input membership', () => {
    const region = derive(process(fixture(), ['timber']));
    const craft = region.facts.dailyLife.find((fact) => fact.category === 'craft')!;
    craft.settlement = { kind: 'artifact', targetId: 'other' };
    expect(validate(region)).toContain('different settlement');
    craft.settlement = target;
    const product = region.facts.products.find(
      (entry) => craft.inputs[0].kind === 'product' && entry.id === craft.inputs[0].productId,
    )!;
    product.settlement = { kind: 'artifact', targetId: 'other' };
    expect(validate(region)).toContain('different settlement');
    product.settlement = target;
    const geology = derive();
    const stone = geology.facts.dailyLife.find((fact) => fact.activityKey === 'quarry-stone')!;
    const input = stone.inputs[0] as Extract<DailyLifeInput, { kind: 'resource' }>;
    input.depositIds = ['deposit:ore'];
    expect(validate(geology)).toContain('deposit subset');
    input.depositIds = ['deposit:stone'];
    geology.facts.resourceDeposits[0].anchor.nodeIds = [3];
    expect(validate(geology)).toContain('unrelated deposit');
  });
});
