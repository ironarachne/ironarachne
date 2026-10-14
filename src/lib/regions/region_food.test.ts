import { describe, expect, it } from 'vitest';
import {
  getBiologicalRawResources,
  snapshotRawResource,
  type ImportedFoodDescriptor,
} from '$lib/resources';
import { assessRawSourceFood, assessRegionProductFood } from './region_food';
import type { RegionFoodGraph } from './region_food_types';
import type { ResourceSourceFact } from './region_raw_source_types';
import type { ResourceFact } from './region_fact_types';
import type { ProcessingInput, RegionalProductFact } from './region_processing_types';

const anchor = { nodeIds: [1], edgeIds: [] };
function source(key = 'wheat-grain'): ResourceSourceFact {
  return {
    id: `source:${key}`,
    name: key,
    description: '',
    origin: 'generated',
    definitionId: `review:${key}`,
    resource: snapshotRawResource(getBiologicalRawResources().find((entry) => entry.id === key)!),
    source: { kind: 'wild', inhabitantId: 'inhabitant:test' },
    method: 'gathering',
    requirements: ['collection tools'],
    availability: 'limited',
    areaIds: [],
    habitatIds: [],
    anchor,
    waterSources: [],
  };
}
function summary(saved: ResourceSourceFact): ResourceFact {
  return {
    id: `resource:${saved.resource.id}`,
    name: saved.name,
    description: '',
    origin: 'generated',
    kind: 'food',
    availability: 'limited',
    sourceIds: [saved.id],
    depositIds: [],
    areaIds: [],
    habitatIds: [],
    anchor,
  };
}
const local = (
  key: string,
  foodUse: ProcessingInput['foodUse'] = 'ingredient',
): ProcessingInput => ({
  kind: 'resource',
  role: foodUse === 'support' ? 'fuel' : 'material',
  resourceId: `resource:${key}`,
  sourceId: `source:${key}`,
  foodUse,
  anchor,
  depositIds: [],
});
const ingredient = (id: string): ProcessingInput => ({
  kind: 'product',
  role: 'material',
  productId: id,
  foodUse: 'ingredient',
});
function product(
  id: string,
  inputs: ProcessingInput[],
  use: 'ingredient' | 'provision' = 'ingredient',
  key = id,
): RegionalProductFact {
  return {
    id,
    name: id,
    description: '',
    origin: 'generated',
    productKey: key,
    recipeId: `recipe:${id}`,
    technique: 'test',
    requirements: ['processing tools'],
    food: {
      kind: 'food',
      use,
      reviewRuleId: `food:${id}:v1`,
      requirements: ['appropriate handling'],
    },
    inputs,
    settlement: { kind: 'embedded', settlementId: 's' },
    areaIds: [],
    anchor,
  };
}
function graph(keys: string[], products: RegionalProductFact[]): RegionFoodGraph {
  const resourceSources = keys.map((key) => source(key));
  return { resourceSources, resources: resourceSources.map(summary), products };
}
const evaluate = (value: RegionFoodGraph, id: string) => assessRegionProductFood(value, id);

describe('saved food preparation across ingredient chains', () => {
  it('keeps wheat restricted through flour/dough and clears only at reviewed bread', () => {
    const value = graph(
      ['wheat-grain'],
      [
        product('flour', [local('wheat-grain')]),
        product('dough', [ingredient('flour')]),
        product('bread', [ingredient('dough')], 'provision', 'wheat-bread'),
        product('dish', [ingredient('bread')], 'provision'),
      ],
    );
    expect(assessRawSourceFood(value.resourceSources[0]).status).toBe('requires-preparation');
    expect(evaluate(value, 'flour').status).toBe('requires-preparation');
    expect(evaluate(value, 'dough').pending[0].allowedProductKeys).toContain('wheat-bread');
    expect(evaluate(value, 'bread').status).toBe('eligible');
    expect(evaluate(value, 'dish').status).toBe('eligible');
    expect(evaluate(value, 'dish').requirements).toEqual([
      'appropriate handling',
      'collection tools',
      'processing tools',
    ]);
    expect(evaluate(value, 'flour').pending).toHaveLength(1);
  });
  it('cannot clear wheat by using an unrelated provision or a matching ingredient key', () => {
    const value = graph(
      ['wheat-grain'],
      [
        product('smoked', [local('wheat-grain')], 'provision', 'smoked-provisions'),
        product('named-bread', [local('wheat-grain')], 'ingredient', 'wheat-bread'),
      ],
    );
    expect(evaluate(value, 'smoked').status).toBe('requires-preparation');
    expect(evaluate(value, 'named-bread').status).toBe('requires-preparation');
  });
  it('requires every independent permission and keeps unprepared sibling paths', () => {
    const value = graph(
      ['wheat-grain', 'lentil-seed'],
      [
        product('bread', [local('wheat-grain')], 'provision', 'wheat-bread'),
        product('mixed', [local('wheat-grain'), local('lentil-seed')], 'provision', 'wheat-bread'),
        product('dish', [ingredient('bread'), local('wheat-grain')], 'provision'),
        product('grain-dish', [ingredient('bread'), local('lentil-seed')], 'provision'),
      ],
    );
    expect(evaluate(value, 'mixed').pending.map((entry) => entry.leaf)).toEqual([
      { kind: 'source', sourceId: 'source:lentil-seed' },
    ]);
    expect(evaluate(value, 'dish').pending).toHaveLength(1);
    expect(evaluate(value, 'grain-dish').pending).toHaveLength(1);
  });
  it('deduplicates equivalent restrictions without changing sources or saved arrays', () => {
    const value = graph(
      ['wheat-grain'],
      [
        product('flour', [local('wheat-grain')]),
        product('blend', [ingredient('flour'), local('wheat-grain')]),
      ],
    );
    const before = structuredClone(value);
    expect(evaluate(value, 'blend').pending).toHaveLength(1);
    expect(value).toEqual(before);
    expect(evaluate(value, 'blend')).toEqual(evaluate(value, 'blend'));
  });
  it('keeps unrestricted ingredients distinct from standalone provisions', () => {
    const value = graph(['apple-fruit'], [product('ingredient', [local('apple-fruit')])]);
    expect(assessRawSourceFood(value.resourceSources[0]).status).toBe('eligible');
    expect(evaluate(value, 'ingredient').status).toBe('ingredient-only');
  });
});

describe('food input roles and evidence', () => {
  it('checks fuel evidence while exempting its food qualification', () => {
    const value = graph(
      ['cow-meat', 'cow-fat'],
      [product('food', [local('cow-meat'), local('cow-fat', 'support')], 'provision')],
    );
    expect(evaluate(value, 'food').status).toBe('eligible');
    value.resourceSources[1].availability = 'unknown';
    expect(evaluate(value, 'food').status).toBe('invalid');
  });
  it('rejects nonfood ingredients and disguising a material as support', () => {
    const value = graph(
      ['cow-meat', 'cow-fat'],
      [product('food', [local('cow-meat'), local('cow-fat')], 'provision')],
    );
    expect(evaluate(value, 'food').status).toBe('not-food');
    value.products[0].inputs[1].foodUse = 'support';
    expect(evaluate(value, 'food').status).toBe('invalid');
    value.products[0].inputs[1].foodUse = 'process-water';
    expect(evaluate(value, 'food').status).toBe('invalid');
  });
  it('requires source membership and rejects stale, missing, nonpositive sources and summaries', () => {
    const original = graph(['cow-meat'], [product('food', [local('cow-meat')], 'provision')]);
    const changes = [
      (value: RegionFoodGraph) => {
        value.resourceSources[0].availability = 'not-observed';
      },
      (value: RegionFoodGraph) => {
        value.resources[0].availability = 'unknown';
      },
      (value: RegionFoodGraph) => {
        value.resources[0].sourceIds = [];
      },
      (value: RegionFoodGraph) => {
        value.resourceSources[0].reason = { ruleId: 'test', sources: [], status: 'stale' };
      },
      (value: RegionFoodGraph) => {
        value.products[0].reason = { ruleId: 'test', sources: [], status: 'stale' };
      },
    ];
    for (const change of changes) {
      const value = structuredClone(original);
      change(value);
      expect(evaluate(value, 'food').status).toBe('invalid');
    }
    expect(evaluate({ ...original, resourceSources: [] }, 'food').status).toBe('invalid');
    expect(evaluate({ ...original, resources: [] }, 'food').status).toBe('invalid');
    expect(assessRegionProductFood(original, 'food', () => false).status).toBe('invalid');
    // Stale aggregate reasons do not invalidate an independently current selected source.
    original.resources[0].reason = { ruleId: 'test', sources: [], status: 'stale' };
    expect(evaluate(original, 'food').status).toBe('eligible');
  });
  it('qualifies process-water structurally and does not qualify consumed water implicitly', () => {
    const value = graph(
      ['cow-meat'],
      [
        product(
          'food',
          [
            local('cow-meat'),
            {
              kind: 'resource',
              role: 'water',
              resourceId: 'water',
              foodUse: 'process-water',
              anchor,
              depositIds: [],
            },
          ],
          'provision',
        ),
      ],
    );
    value.resources = [
      ...value.resources,
      { ...summary(source('cow-meat')), id: 'water', kind: 'freshwater', sourceIds: undefined },
    ];
    expect(evaluate(value, 'food').status).toBe('eligible');
    expect(evaluate(value, 'food').requirements.join(' ')).toContain('purity is not established');
    value.products[0].inputs[1].foodUse = 'ingredient';
    expect(evaluate(value, 'food').status).toBe('unknown');
    value.products[0].inputs[1].foodUse = 'process-water';
    value.resources[1].kind = 'food';
    expect(evaluate(value, 'food').status).toBe('invalid');
  });
  it('cannot turn a nonfood product into food and detects cyclic/incomplete chains', () => {
    const linen = product('linen', [local('sheep-fleece')]);
    linen.food = { kind: 'not-food' };
    const value = graph(
      ['sheep-fleece'],
      [linen, product('food', [ingredient('linen')], 'provision')],
    );
    expect(evaluate(value, 'food').status).toBe('not-food');
    value.products[0].inputs = [ingredient('food')];
    expect(evaluate(value, 'food').status).toBe('invalid');
    expect(evaluate(value, 'missing').status).toBe('invalid');
    value.products[1].inputs = [];
    expect(evaluate(value, 'food').status).toBe('invalid');
  });
});

describe('saved food metadata and authored imports', () => {
  const descriptor: ImportedFoodDescriptor = {
    kind: 'product',
    catalogKey: 'flour',
    name: 'flour',
    food: { kind: 'food', preparation: 'recipe-required', productKeys: ['wheat-bread'] },
    use: 'ingredient',
    reviewRuleId: 'flour-food:v1',
    requirements: ['reviewed imported flour'],
  };
  const imported = (foodDescriptor?: ImportedFoodDescriptor): ProcessingInput => ({
    kind: 'import',
    role: 'material',
    resourceName: 'flour',
    explanation: 'Explicit imported ingredient.',
    foodUse: 'ingredient',
    foodDescriptor,
  });
  it('keeps legacy source, policy and edge qualification unknown rather than inferring names', () => {
    const value = graph(['cow-meat'], [product('food', [local('cow-meat')], 'provision')]);
    const input = value.products[0].inputs[0];
    if (input.kind === 'resource') delete input.sourceId;
    expect(evaluate(value, 'food').status).toBe('unknown');
    value.products[0].inputs = [local('cow-meat')];
    delete value.products[0].inputs[0].foodUse;
    expect(evaluate(value, 'food').status).toBe('unknown');
    value.products[0].inputs = [local('cow-meat')];
    delete value.products[0].food;
    expect(evaluate(value, 'food').status).toBe('unknown');
    value.products[0].food = { kind: 'unknown' };
    expect(evaluate(value, 'food').status).toBe('unknown');
    value.resourceSources[0].resource.food = { kind: 'unknown' };
    expect(assessRawSourceFood(value.resourceSources[0]).status).toBe('unknown');
  });
  it('keeps imported flour restrictions, accepts reviewed prepared forms and excludes bare prose', () => {
    const value = graph(
      [],
      [
        product('flour', [imported(descriptor)]),
        product('bread', [ingredient('flour')], 'provision', 'wheat-bread'),
      ],
    );
    expect(evaluate(value, 'flour').pending[0].leaf).toEqual({
      kind: 'import',
      productId: 'flour',
      inputIndex: 0,
    });
    expect(evaluate(value, 'bread').status).toBe('eligible');
    value.products[0].inputs = [imported()];
    expect(evaluate(value, 'bread').status).toBe('unknown');
    value.products[0].inputs = [
      imported({
        ...descriptor,
        use: 'provision',
        food: { kind: 'food', preparation: 'ordinary', productKeys: [] },
      }),
    ];
    expect(evaluate(value, 'bread').status).toBe('eligible');
    value.products[0].inputs = [imported({ ...descriptor, use: 'provision' })];
    expect(evaluate(value, 'bread').status).toBe('invalid');
    value.products[0].inputs = [{ ...imported(descriptor), explanation: '' } as ProcessingInput];
    expect(evaluate(value, 'bread').status).toBe('invalid');
  });
  it('rejects malformed permissions without requiring a live recipe catalog', () => {
    const saved = source();
    saved.resource.food = { kind: 'food', preparation: 'recipe-required', productKeys: [] };
    expect(assessRawSourceFood(saved).status).toBe('invalid');
    saved.resource.food = { kind: 'food', preparation: 'ordinary', productKeys: ['bread'] };
    expect(assessRawSourceFood(saved).status).toBe('invalid');
    const value = graph(['cow-meat'], [product('food', [local('cow-meat')], 'provision')]);
    value.products[0].recipeId = 'retired historical recipe';
    expect(evaluate(value, 'food').status).toBe('eligible');
  });
});
