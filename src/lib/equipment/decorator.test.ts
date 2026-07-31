import { describe, expect, it } from 'vitest';
import { RNG } from '@ironarachne/rng';
import { DECORATIONS } from './decorations';
import { applyDecoration, filterDecorationsByTags, getRandomDecoration } from './decorator';
import type { Decoration, Item } from './equipment_types';

function makeItem(overrides: Partial<Item> = {}): Item {
  return {
    id: 'item-1',
    name: 'sword',
    itemMajorType: 'weapon',
    description: 'a sword',
    value: 100,
    rarity: 'common',
    densityCategory: 'standard',
    weight: 10,
    properties: [],
    ...overrides,
  };
}

const plain: Decoration = { name: 'jeweled', description: 'set with gems' };

describe('applyDecoration', () => {
  it('prefixes the name and records the decoration', () => {
    const result = applyDecoration(makeItem(), plain);

    expect(result.name).toBe('jeweled sword');
    expect(result.decoration).toEqual(plain);
  });

  it('leaves the original item untouched', () => {
    const item = makeItem();

    applyDecoration(item, plain);

    expect(item.name).toBe('sword');
    expect(item.decoration).toBeUndefined();
  });

  it('scales value when a multiplier is given', () => {
    expect(applyDecoration(makeItem({ value: 100 }), { ...plain, valueMultiplier: 3 }).value).toBe(
      300,
    );
  });

  it('leaves value alone when no multiplier is given', () => {
    expect(applyDecoration(makeItem({ value: 100 }), plain).value).toBe(100);
  });

  it('floors a fractional value', () => {
    expect(
      applyDecoration(makeItem({ value: 10 }), { ...plain, valueMultiplier: 1.55 }).value,
    ).toBe(15);
  });

  it('appends the decoration tags', () => {
    const result = applyDecoration(makeItem({ properties: ['weapon'] }), {
      ...plain,
      tagsAdded: ['ornate'],
    });

    expect(result.properties).toEqual(['weapon', 'ornate']);
  });

  it('does not change the weight', () => {
    expect(applyDecoration(makeItem({ weight: 10 }), plain).weight).toBe(10);
  });
});

describe('filterDecorationsByTags', () => {
  const table: Record<string, Decoration> = {
    a: { ...plain, name: 'a', tagsAdded: ['ornate', 'gilded'] },
    b: { ...plain, name: 'b', tagsAdded: ['ornate'] },
    c: { ...plain, name: 'c' },
  };

  it('keeps decorations carrying every requested tag', () => {
    expect(filterDecorationsByTags(['ornate'], table).map((d) => d.name)).toEqual(['a', 'b']);
  });

  it('requires all tags, not just one', () => {
    expect(filterDecorationsByTags(['ornate', 'gilded'], table).map((d) => d.name)).toEqual(['a']);
  });

  it('excludes decorations with no tags at all', () => {
    expect(filterDecorationsByTags([], table).map((d) => d.name)).toEqual(['a', 'b']);
  });

  it('falls back to the real decoration table', () => {
    expect(filterDecorationsByTags([]).length).toBeLessThanOrEqual(Object.keys(DECORATIONS).length);
  });
});

describe('getRandomDecoration', () => {
  it('returns a decoration with no requirements', () => {
    expect(getRandomDecoration(makeItem(), new RNG('seed-a'), [plain])).toEqual(plain);
  });

  it('returns null when nothing is suitable', () => {
    expect(
      getRandomDecoration(makeItem(), new RNG('seed-a'), [
        { ...plain, tagsRequired: ['nonexistent'] },
      ]),
    ).toBeNull();
  });

  it('matches the weapon and armor type tags', () => {
    const forArmor = { ...plain, tagsRequired: ['armor'] };

    expect(
      getRandomDecoration(makeItem({ itemMajorType: 'armor' }), new RNG('seed-a'), [forArmor]),
    ).toEqual(forArmor);
    expect(getRandomDecoration(makeItem(), new RNG('seed-a'), [forArmor])).toBeNull();
  });

  it('matches a tag carried in the item properties', () => {
    const needsMetal = { ...plain, tagsRequired: ['metal'] };

    expect(
      getRandomDecoration(makeItem({ properties: ['metal'] }), new RNG('seed-a'), [needsMetal]),
    ).toEqual(needsMetal);
  });

  it('rejects an item carrying an excluded tag', () => {
    const excludesPlain = { ...plain, tagsExcluded: ['plain'] };

    expect(
      getRandomDecoration(makeItem({ properties: ['plain'] }), new RNG('seed-a'), [excludesPlain]),
    ).toBeNull();
  });

  it('is reproducible from a seed', () => {
    const item = makeItem();

    expect(getRandomDecoration(item, new RNG('seed-a'))).toEqual(
      getRandomDecoration(item, new RNG('seed-a')),
    );
  });
});
