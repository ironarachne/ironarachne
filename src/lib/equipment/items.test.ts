import { describe, expect, it } from 'vitest';
import * as Currency from '$lib/currency';
import { DENSITY_MAP, type Item } from './equipment_types';
import { applyStatOffsets, createCombinedDescriptions, getVolume } from './items';

function makeItem(overrides: Partial<Item> = {}): Item {
  return {
    id: 'item-1',
    name: 'a rock',
    itemMajorType: 'misc',
    description: 'a rock',
    value: 100,
    rarity: 'common',
    densityCategory: 'standard',
    weight: 1,
    properties: [],
    ...overrides,
  };
}

describe('getVolume', () => {
  it('derives volume from weight and density category', () => {
    expect(getVolume(makeItem({ weight: 8, densityCategory: 'dense' }))).toBe(1);
    expect(getVolume(makeItem({ weight: 1, densityCategory: 'standard' }))).toBe(1);
  });

  it('gives an airy item far more volume than a dense one of the same weight', () => {
    const airy = getVolume(makeItem({ weight: 1, densityCategory: 'airy' }));
    const dense = getVolume(makeItem({ weight: 1, densityCategory: 'dense' }));

    expect(airy).toBeGreaterThan(dense);
  });

  it('prefers a manual volume over the calculation', () => {
    expect(getVolume(makeItem({ weight: 100, densityCategory: 'dense', manualVolume: 0.5 }))).toBe(
      0.5,
    );
  });

  it('honours a manual volume of zero', () => {
    expect(getVolume(makeItem({ weight: 100, manualVolume: 0 }))).toBe(0);
  });

  it('covers every density category', () => {
    for (const category of Object.keys(DENSITY_MAP) as (keyof typeof DENSITY_MAP)[]) {
      expect(getVolume(makeItem({ weight: 1, densityCategory: category }))).toBe(
        1 / DENSITY_MAP[category],
      );
    }
  });
});

describe('applyStatOffsets', () => {
  const combatProfile = {
    attack: 1,
    defense: 2,
    power: 3,
    resilience: 4,
    speed: 5,
    health: 6,
  };

  it('adds the offset to a matching stat', () => {
    const result = applyStatOffsets({ attack: 2 }, makeItem({ combatProfile }));

    expect(result.combatProfile!.attack).toBe(3);
  });

  it('applies several offsets at once', () => {
    const result = applyStatOffsets({ attack: 2, defense: -1 }, makeItem({ combatProfile }));

    expect(result.combatProfile!.attack).toBe(3);
    expect(result.combatProfile!.defense).toBe(1);
  });

  it('ignores a stat the combat profile does not have', () => {
    const result = applyStatOffsets({ luck: 10 }, makeItem({ combatProfile }));

    expect(result.combatProfile).toEqual(combatProfile);
  });

  it('leaves the original item untouched', () => {
    const item = makeItem({ combatProfile });

    applyStatOffsets({ attack: 5 }, item);

    expect(item.combatProfile!.attack).toBe(1);
  });

  it('passes an item with no combat profile through unchanged', () => {
    const item = makeItem();

    expect(applyStatOffsets({ attack: 5 }, item)).toEqual(item);
  });

  it('does nothing when there are no offsets', () => {
    const item = makeItem({ combatProfile });

    expect(applyStatOffsets({}, item)).toEqual(item);
  });
});

describe('createCombinedDescriptions', () => {
  it('lists a single item by name', () => {
    expect(createCombinedDescriptions([makeItem({ name: 'torch' })])).toEqual(['torch']);
  });

  it('groups identical names with a count', () => {
    const items = [
      makeItem({ id: 'a', name: 'torch' }),
      makeItem({ id: 'b', name: 'torch' }),
      makeItem({ id: 'c', name: 'rope' }),
    ];

    expect(createCombinedDescriptions(items)).toEqual(['2x torch', 'rope']);
  });

  it('returns nothing for no items', () => {
    expect(createCombinedDescriptions([])).toEqual([]);
  });

  it('appends the value of a single item when asked', () => {
    const items = [makeItem({ name: 'torch', value: 100 })];

    expect(createCombinedDescriptions(items, true)).toEqual([
      `torch (Value: ${Currency.valueToString(100, Currency.COMMON_FANTASY)})`,
    ]);
  });

  it('totals the value across a group', () => {
    const items = [
      makeItem({ id: 'a', name: 'torch', value: 100 }),
      makeItem({ id: 'b', name: 'torch', value: 100 }),
    ];

    expect(createCombinedDescriptions(items, true)).toEqual([
      `2x  torch (Total Value: ${Currency.valueToString(200, Currency.COMMON_FANTASY)})`,
    ]);
  });

  it('formats values in a supplied currency system', () => {
    const items = [makeItem({ name: 'torch', value: 100 })];
    const [common] = createCombinedDescriptions(items, true, Currency.COMMON_FANTASY);
    const [explicit] = createCombinedDescriptions(items, true, Currency.COMMON_FANTASY);

    expect(explicit).toBe(common);
  });

  it('groups by name rather than by identity', () => {
    const items = [
      makeItem({ id: 'a', name: 'torch', value: 100 }),
      makeItem({ id: 'b', name: 'torch', value: 999 }),
    ];

    const [description] = createCombinedDescriptions(items);

    expect(description).toBe('2x torch');
  });
});
