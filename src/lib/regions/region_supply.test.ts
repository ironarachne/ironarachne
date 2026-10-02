import { describe, expect, it } from 'vitest';
import { RNG } from '@ironarachne/rng';
import { getProcessingRecipes, type ProcessingRecipe } from '$lib/resources';
import type { MapNode } from '$lib/map';
import type { Settlement } from '$lib/settlements';
import type Region from './region';
import type { RegionFacts, ResourceFact } from './region_fact_types';
import type { RegionSnapshot } from './region_snapshot';
import { emptyRegionFacts, regionFactsError } from './region_facts';
import { generateSupplyFacts, assessSettlementSupply } from './region_supply';
import { describeSettlementSupply, settlementSupplyContext } from './region_supply_presentation';
import { generateProcessingFacts } from './region_processing';
import { assessProcessingCapability } from './region_processing_capability';
import { accessibleProcessingResources } from './region_processing_resources';
import { createRegionStageRng } from './region_generation_passes';
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
    availability: 'available',
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

function assessments(region = fixture()) {
  return assessSettlementSupply(region, region.facts.settlementRoles[0]);
}
function generate(region = fixture(), seed = 'supply') {
  generateSupplyFacts(region, createRegionStageRng(seed, 'supply'));
  return region;
}
function saved(region: ReturnType<typeof fixture>): RegionSnapshot {
  return {
    ...region,
    settlements: region.settlements.map((snapshot, i) => ({
      id: region.settlementIds![i],
      snapshot,
    })),
  } as unknown as RegionSnapshot;
}
function validate(region: ReturnType<typeof fixture>) {
  return regionFactsError(region.facts, region.map, saved(region).settlements);
}
function sparse() {
  const region = fixture();
  region.facts.resources = region.facts.resources.filter((entry) => entry.kind === 'freshwater');
  return region;
}

describe('saved scarcity and conditional imports', () => {
  it('does not confuse unselected products or livelihoods with unavailable local goods', () => {
    const region = fixture();
    expect(region.facts.products).toEqual([]);
    expect(region.facts.dailyLife).toEqual([]);
    expect(assessments(region)).toEqual([]);
    expect(generate(region).facts.supply).toEqual([]);
  });

  it('qualifies limited local production and offers supplementary imports', () => {
    const region = fixture();
    region.facts.resources.forEach((entry) => (entry.availability = 'limited'));
    const facts = assessments(region);
    expect(facts).toHaveLength(6);
    for (const fact of facts) {
      expect(fact.status).toBe('limited-local');
      expect(fact.missingInputKeys).toEqual([]);
      expect(fact.description).toContain('can be supplied locally');
      expect(fact.importSuggestion?.explanation).toContain('could supplement');
    }
    const generated = generate(region);
    expect(generated.facts.supply).toHaveLength(3);
    expect(validate(generated)).toBeNull();
    expect(describeSettlementSupply(region, target)).toContain('limited');
  });

  it('uses an available alternative instead of treating a limited selected leaf as scarcity', () => {
    const region = fixture();
    region.facts.resources.find((entry) => entry.kind === 'timber')!.availability = 'limited';
    region.facts.resources.push(raw('more-wood', 'timber'));
    expect(assessments(region).map((fact) => fact.needKey)).not.toContain('construction-timber');
    expect(assessments(region).map((fact) => fact.needKey)).not.toContain('wood-fuel');
  });

  it('records a few actual missing inputs and their consequences, without invented suppliers', () => {
    const region = sparse();
    const before = structuredClone(region);
    generate(region);
    expect({ ...region, facts: { ...region.facts, supply: [] } }).toEqual(before);
    expect(region.facts.supply).toHaveLength(3);
    expect(validate(region)).toBeNull();
    for (const fact of assessments(region)) {
      expect(fact.status).toBe('local-not-supported');
      expect(fact.missingInputKeys.length).toBeGreaterThan(0);
      expect(fact.description).toContain('if used');
      expect(fact.description).not.toMatch(/exports|merchant|trade partner|from the|to the/);
      expect(fact.importSuggestion?.explanation).toContain('no supplier or transport route');
    }
    expect(
      assessments(region).find((fact) => fact.needKey === 'preserved-provisions')!.description,
    ).toContain('not proof that people lack food');
    expect(
      assessments(region).find((fact) => fact.needKey === 'building-stone')!.description,
    ).toContain('building materials remain alternatives');
  });

  it('distinguishes a disconnected regional source from regional absence', () => {
    const region = fixture();
    region.facts.resources.find((entry) => entry.kind === 'timber')!.anchor!.nodeIds = [3];
    const wood = assessments(region).find((fact) => fact.needKey === 'construction-timber')!;
    expect(wood.status).toBe('local-not-supported');
    expect(wood.description).toContain('outside supported access');
    expect(wood.description).toContain('not regional absence');
  });

  it('does not infer a regional producer from inputs on disconnected land', () => {
    const region = fixture();
    region.facts.resources.find((entry) => entry.kind === 'timber')!.anchor!.nodeIds = [3];
    const tools = assessments(region).find((fact) => fact.needKey === 'iron-tools')!;
    expect(tools.status).toBe('local-not-supported');
    expect(tools.description).toContain('Required raw inputs are represented regionally');
    expect(tools.description).toContain('Regional production and transport are not established');
    expect(tools.description).not.toContain('Represented regional supply');
  });

  it('does not turn a deep deposit into usable building stone or iron', () => {
    const region = fixture();
    region.facts.resourceDeposits.forEach((deposit) => {
      deposit.exposure = 'deep';
      deposit.extraction = 'mining';
    });
    const missing = assessments(region);
    expect(missing.map((fact) => fact.needKey)).toEqual(['building-stone', 'iron-tools']);
    expect(missing[0].description).toContain('unsupported extraction');
  });

  it.each(['wood', 'water', 'flax', 'ore', 'meat'])(
    'requires complete chains after removing %s',
    (key) => {
      const region = fixture();
      region.facts.resources = region.facts.resources.filter(
        (entry) => entry.id !== `resource:${key}`,
      );
      const missing = assessments(region).map((fact) => fact.needKey);
      const expected: Record<string, string> = {
        wood: 'iron-tools',
        water: 'woven-cloth',
        flax: 'woven-cloth',
        ore: 'iron-tools',
        meat: 'preserved-provisions',
      };
      expect(missing).toContain(expected[key]);
      if (key === 'wood') expect(missing).not.toContain('preserved-provisions'); // Drying needs no fuel.
    },
  );

  it.each(['unknown', 'stale', 'legacy', 'empty', 'invalid-site', 'missing-role'])(
    'omits claims for %s evidence',
    (scenario) => {
      const region = sparse();
      if (scenario === 'unknown') region.facts.resources[0].availability = 'unknown';
      if (scenario === 'stale')
        region.facts.resources[0].reason = { ruleId: 'test', status: 'stale', sources: [] };
      if (scenario === 'legacy') region.facts.state = 'legacy';
      if (scenario === 'empty') region.facts.resources = [];
      if (scenario === 'invalid-site') region.settlements[0].mapNodeId = 4;
      if (scenario === 'missing-role') region.facts.settlementRoles = [];
      expect(generate(region).facts.supply).toEqual([]);
    },
  );

  it('does not promote authored imported products to local supply', () => {
    const region = sparse();
    region.facts.products.push({
      id: 'product:imported-tools',
      name: 'Tools',
      description: 'Locally assembled with imported iron',
      origin: 'authored',
      productKey: 'iron-tools',
      recipeId: 'unknown',
      technique: 'forging',
      requirements: [],
      inputs: [
        { kind: 'import', role: 'material', resourceName: 'iron', explanation: 'Brought in' },
      ],
      settlement: target,
      areaIds: ['area:land'],
      anchor: { nodeIds: [1], edgeIds: [] },
    });
    expect(assessments(region).find((fact) => fact.needKey === 'iron-tools')?.status).toBe(
      'local-not-supported',
    );
    expect(
      assessments(region).find((fact) => fact.needKey === 'iron-tools')!.description,
    ).toContain('depends on imported iron');
    expect(region.facts.resources).toHaveLength(1);
    expect(region.facts.products[0].inputs[0].kind).toBe('import');
  });

  it('honors complete saved local chains even with an unknown recipe identity', () => {
    const region = fixture();
    generateProcessingFacts(region, new RNG('products'));
    const product = region.facts.products[0];
    product.origin = 'authored';
    product.recipeId = 'unknown';
    expect(assessments(region)).toEqual([]);
  });

  it('repeats and respects inventory ordering while its seed changes representative choices', () => {
    const a = generate(sparse(), 'one');
    const b = sparse();
    b.facts.resources.reverse();
    b.facts.settlementRoles.reverse();
    b.map.nodes.reverse();
    expect(generate(b, 'one').facts.supply).toEqual(a.facts.supply);
    expect(generate(sparse(), 'two').facts.supply).not.toEqual(a.facts.supply);
    expect(generate(sparse(), 'one').facts.supply).toEqual(a.facts.supply);
    expect(a.facts.supply.map((fact) => fact.needKey)).toHaveLength(
      new Set(a.facts.supply.map((fact) => fact.needKey)).size,
    );
  });

  it('preserves text edits and their evidence through plain export and inspection', () => {
    const region = generate(sparse());
    const snapshot = saved(region);
    const fact = snapshot.facts.supply[0];
    const edited = setRegionResourceFactText(
      snapshot,
      'supply',
      fact.id,
      'description',
      'My material story',
    );
    expect(edited.facts.supply[0]).toMatchObject({
      origin: 'authored',
      description: 'My material story',
      resourceIds: fact.resourceIds,
    });
    expect(JSON.parse(JSON.stringify(edited)).facts.supply[0].description).toBe(
      'My material story',
    );
    expect(settlementSupplyContext(edited.facts, target)[0].description).toBe('My material story');
    expect(describeSettlementSupply({ ...region, facts: edited.facts }, target)).toContain(
      'needs review',
    );
    expect(
      settlementSupplyContext(edited.facts, { kind: 'artifact', targetId: 'elsewhere' }),
    ).toEqual([]);
    expect(setRegionResourceFactText(snapshot, 'supply', 'missing', 'name', 'x')).toBe(snapshot);
  });

  it('stales edited source evidence and catches additions absent from the old reason graph', () => {
    const region = generate(sparse());
    const edited = setRegionResourceFactText(
      saved(region),
      'resources',
      'resource:water',
      'description',
      'Changed source',
    );
    expect(edited.facts.supply.every((fact) => fact.reason!.status === 'stale')).toBe(true);
    expect(describeSettlementSupply({ ...region, facts: edited.facts }, target)).toContain(
      'needs review',
    );
    region.facts.resources.push(raw('new-timber', 'timber'));
    expect(describeSettlementSupply(region, target)).toContain('needs review');
    expect(validate(region)).toContain('incomplete or stale');
  });

  it('rechecks changed availability and map access without regenerating saved facts', () => {
    const region = fixture();
    region.facts.resources.find((entry) => entry.kind === 'timber')!.availability = 'limited';
    region.facts.supply = assessments(region);
    const before = structuredClone(region.facts.supply);
    region.facts.resources.find((entry) => entry.kind === 'timber')!.availability = 'available';
    expect(describeSettlementSupply(region, target)).toContain('needs review');
    expect(region.facts.supply).toEqual(before);
    region.map.nodes.find((entry) => entry.id === 1)!.neighbors = [];
    expect(describeSettlementSupply(region, target)).toContain('needs review');
    expect(describeSettlementSupply({ ...region, facts: undefined }, target)).toBe('');
  });

  it('removes generated direct dependents and protects authored work', () => {
    const region = generate(sparse());
    const snapshot = saved(region);
    expect(removeRegionResourceFact(snapshot, 'resources', 'resource:water').facts.supply).toEqual(
      [],
    );
    expect(
      removeRegionResourceFact(snapshot, 'settlementRoles', 'role:site:home').facts.supply,
    ).toEqual([]);
    expect(removeRegionPlace(snapshot, 'settlements', 0).facts.supply).toEqual([]);
    const edited = setRegionResourceFactText(
      snapshot,
      'supply',
      snapshot.facts.supply[0].id,
      'name',
      'My imports',
    );
    expect(canRemoveRegionSettlement(edited, 0)).toBe(false);
    expect(removeRegionPlace(edited, 'settlements', 0)).toBe(edited);
    expect(removeRegionResourceFact(edited, 'resources', 'resource:water')).toBe(edited);
    expect(removeRegionResourceFact(snapshot, 'supply', 'missing')).toBe(snapshot);
  });

  it.each([
    { needKey: '' },
    { status: 'absent' },
    { areaIds: ['area:missing'] },
    { siteRoleId: 'role:missing' },
    { resourceIds: ['resource:missing'] },
    { productIds: ['product:missing'] },
    { missingInputKeys: [3] },
    { anchor: { nodeIds: [99], edgeIds: [] } },
    { importSuggestion: { goodName: 'Cloth' } },
    { settlement: { kind: 'artifact', targetId: 'other' } },
  ])('rejects malformed saved supply %j', (change) => {
    const region = generate(sparse());
    Object.assign(region.facts.supply[0], change);
    expect(validate(region)).not.toBeNull();
  });

  it('retains unknown need keys and optional import suggestions as saved authored work', () => {
    const region = generate(sparse());
    const fact = region.facts.supply[0];
    fact.needKey = 'future-need';
    fact.origin = 'authored';
    delete fact.importSuggestion;
    expect(validate(region)).toBeNull();
    expect(settlementSupplyContext(region.facts, target)[0].needKey).toBe('future-need');
    expect(describeSettlementSupply(region, target)).toContain('needs review');
  });
});

describe('pure complete processing capability', () => {
  it('matches generated complete chains without selecting or mutating products', () => {
    const region = fixture();
    const before = structuredClone(region);
    const resources = accessibleProcessingResources(region, new Set([1, 2]));
    for (const key of [
      'construction-components',
      'linen',
      'iron-tools',
      'dried-provisions',
      'dressed-stone',
    ])
      expect(assessProcessingCapability(getProcessingRecipes(), resources, key)).toMatchObject({
        supported: true,
        limited: false,
        missingInputKeys: [],
      });
    expect(region).toEqual(before);
  });
  it('rejects unknown techniques, empty recipes, cycles and excessive chain depth', () => {
    const recipe = (key: string, parent: string): ProcessingRecipe => ({
      id: key,
      outputKey: key,
      outputName: key,
      family: 'test',
      technique: 'weaving',
      requirements: [],
      inputs: [{ role: 'material', selector: { kind: 'product', productKey: parent } }],
    });
    expect(
      assessProcessingCapability([recipe('a', 'b'), recipe('b', 'a')], [], 'a').supported,
    ).toBe(false);
    expect(
      assessProcessingCapability([{ ...recipe('a', 'b'), technique: 'advanced' }], [], 'a')
        .supported,
    ).toBe(false);
    expect(
      assessProcessingCapability([{ ...recipe('a', 'b'), inputs: [] }], [], 'a').supported,
    ).toBe(false);
    const recipes = [
      recipe('a', 'b'),
      recipe('b', 'c'),
      recipe('c', 'd'),
      recipe('d', 'e'),
      { ...recipe('e', ''), inputs: getProcessingRecipes()[0].inputs },
    ];
    const region = fixture();
    const result = assessProcessingCapability(
      recipes,
      accessibleProcessingResources(region, new Set([1, 2])),
      'a',
    );
    expect(result.supported).toBe(false);
    expect(result.missingInputKeys).toContain('depth:a');
  });
});
