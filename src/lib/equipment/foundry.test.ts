import { describe, expect, it } from 'vitest';
import { RNG } from '@ironarachne/rng';
import type { Armor, Item, Material } from './equipment_types';
import { applyMaterial, filterMaterialsByTags, getRandomMaterialForItem } from './foundry';
import { MATERIALS } from './materials';

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

const plainMaterial: Material = {
  name: 'tin',
  majorType: 'metal',
  densityCategory: 'dense',
  weightMultiplier: 2,
  valueMultiplier: 3,
  rarity: 'common',
};

describe('applyMaterial', () => {
  it('prefixes the name with the material', () => {
    expect(applyMaterial(makeItem(), plainMaterial).name).toBe('tin sword');
  });

  it('scales weight and value and adopts the density category', () => {
    const result = applyMaterial(makeItem({ weight: 10, value: 100 }), plainMaterial);

    expect(result.weight).toBe(20);
    expect(result.value).toBe(300);
    expect(result.densityCategory).toBe('dense');
    expect(result.material).toEqual(plainMaterial);
  });

  it('floors a fractional value', () => {
    const result = applyMaterial(makeItem({ value: 10 }), {
      ...plainMaterial,
      valueMultiplier: 1.5,
    });

    expect(result.value).toBe(15);
    expect(Number.isInteger(result.value)).toBe(true);
  });

  it('leaves the original item untouched', () => {
    const item = makeItem();

    applyMaterial(item, plainMaterial);

    expect(item.name).toBe('sword');
    expect(item.material).toBeUndefined();
  });

  it('appends the material tags to the item properties', () => {
    const result = applyMaterial(makeItem({ properties: ['sharp'] }), {
      ...plainMaterial,
      tagsAdded: ['metal', 'shiny'],
    });

    expect(result.properties).toEqual(['sharp', 'metal', 'shiny']);
  });

  it('leaves properties alone when the material adds no tags', () => {
    const result = applyMaterial(makeItem({ properties: ['sharp'] }), plainMaterial);

    expect(result.properties).toEqual(['sharp']);
  });

  it('applies stat offsets to a combat profile', () => {
    const item = makeItem({
      combatProfile: { attack: 1, defense: 0, power: 0, resilience: 0, speed: 0, health: 0 },
    });

    const result = applyMaterial(item, { ...plainMaterial, statOffsets: { attack: 3 } });

    expect(result.combatProfile!.attack).toBe(4);
  });
});

describe('filterMaterialsByTags', () => {
  const tagged: Material[] = [
    { ...plainMaterial, name: 'a', tagsAdded: ['metal', 'magical'] },
    { ...plainMaterial, name: 'b', tagsAdded: ['metal'] },
    { ...plainMaterial, name: 'c' },
  ];

  it('keeps materials carrying every requested tag', () => {
    expect(filterMaterialsByTags(['metal'], tagged).map((m) => m.name)).toEqual(['a', 'b']);
  });

  it('requires all tags, not just one', () => {
    expect(filterMaterialsByTags(['metal', 'magical'], tagged).map((m) => m.name)).toEqual(['a']);
  });

  it('excludes materials with no tags at all', () => {
    expect(filterMaterialsByTags([], tagged).map((m) => m.name)).toEqual(['a', 'b']);
  });

  it('returns nothing when no material matches', () => {
    expect(filterMaterialsByTags(['nonexistent'], tagged)).toEqual([]);
  });

  it('falls back to the full material table', () => {
    const result = filterMaterialsByTags(['fragile']);

    expect(result.length).toBeGreaterThan(0);
    for (const material of result) {
      expect(material.tagsAdded).toContain('fragile');
    }
  });

  it('matches nothing in the real table for a tag no material carries', () => {
    expect(filterMaterialsByTags(['metal'])).toEqual([]);
  });
});

describe('getRandomMaterialForItem', () => {
  it('restricts itself to the item’s allowed material types', () => {
    const item = makeItem({ allowedMaterialTypes: ['wood'] });

    for (const seed of ['a', 'b', 'c', 'd']) {
      const material = getRandomMaterialForItem(item, new RNG(seed));

      expect(material.majorType).toBe('wood');
    }
  });

  it('gives a weapon metal or wood when nothing is specified', () => {
    for (const seed of ['a', 'b', 'c', 'd']) {
      const material = getRandomMaterialForItem(makeItem(), new RNG(seed));

      expect(['metal', 'wood']).toContain(material.majorType);
    }
  });

  it.each([
    ['light', ['leather', 'cloth']],
    ['medium', ['metal', 'leather', 'hide']],
    ['heavy', ['metal']],
  ])('gives %s armor an appropriate material', (minorType, expected) => {
    const armor = makeItem({ itemMajorType: 'armor', itemMinorType: minorType }) as Armor;

    for (const seed of ['a', 'b', 'c', 'd']) {
      const material = getRandomMaterialForItem(armor, new RNG(seed));

      expect(expected).toContain(material.majorType);
    }
  });

  it('is reproducible from a seed', () => {
    const item = makeItem();

    expect(getRandomMaterialForItem(item, new RNG('seed-a'))).toEqual(
      getRandomMaterialForItem(item, new RNG('seed-a')),
    );
  });

  it('falls back to iron when nothing is suitable', () => {
    const item = makeItem({ itemMajorType: 'furniture' });

    expect(getRandomMaterialForItem(item, new RNG('seed-a'))).toEqual(MATERIALS['iron']);
  });

  it('chooses from a supplied material list', () => {
    const only = [{ ...plainMaterial, name: 'only-one' }];

    const material = getRandomMaterialForItem(
      makeItem({ allowedMaterialTypes: ['metal'] }),
      new RNG('seed-a'),
      only,
    );

    expect(material.name).toBe('only-one');
  });
});
