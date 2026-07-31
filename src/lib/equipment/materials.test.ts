import { describe, expect, it } from 'vitest';
import { RNG } from '@ironarachne/rng';
import {
  MATERIALS,
  getAllMaterials,
  getMaterial,
  getMaterialsByMajorType,
  getMaterialsByMinorType,
  getMaterialsByRarity,
  getMaterialsByTag,
  getRandomMaterial,
} from './materials';

const all = getAllMaterials();

describe('MATERIALS', () => {
  it('describes every material with usable multipliers', () => {
    expect(all.length).toBeGreaterThan(0);

    for (const material of all) {
      expect(material.name.length).toBeGreaterThan(0);
      expect(material.majorType.length).toBeGreaterThan(0);
      expect(material.weightMultiplier).toBeGreaterThan(0);
      expect(material.valueMultiplier).toBeGreaterThan(0);
    }
  });

  it('names every material uniquely', () => {
    const names = all.map((material) => material.name);

    expect(new Set(names).size).toBe(names.length);
  });

  // Keys are snake_case lookup handles; names are the display form, so a multi-word material
  // such as `boiled_leather` is named "boiled leather".
  it('keys each entry by the snake_case form of its name', () => {
    for (const [key, material] of Object.entries(MATERIALS)) {
      expect(key).toBe(material.name.replace(/ /g, '_'));
    }
  });
});

describe('getAllMaterials', () => {
  it('returns one entry per key in the table', () => {
    expect(all).toHaveLength(Object.keys(MATERIALS).length);
  });
});

describe('getMaterial', () => {
  it('finds a material by key', () => {
    expect(getMaterial('iron')).toEqual(MATERIALS['iron']);
  });

  it('returns undefined for an unknown key', () => {
    expect(getMaterial('unobtainium')).toBeUndefined();
  });
});

describe('getMaterialsByMajorType', () => {
  it('returns only materials of that major type', () => {
    const metals = getMaterialsByMajorType('metal');

    expect(metals.length).toBeGreaterThan(0);
    for (const material of metals) {
      expect(material.majorType).toBe('metal');
    }
  });

  it('returns nothing for an unknown major type', () => {
    expect(getMaterialsByMajorType('plasma')).toEqual([]);
  });
});

describe('getMaterialsByMinorType', () => {
  it('returns only materials of that minor type', () => {
    const minorType = all.find((material) => material.minorType)!.minorType!;
    const result = getMaterialsByMinorType(minorType);

    expect(result.length).toBeGreaterThan(0);
    for (const material of result) {
      expect(material.minorType).toBe(minorType);
    }
  });

  it('returns nothing for an unknown minor type', () => {
    expect(getMaterialsByMinorType('nonexistent')).toEqual([]);
  });
});

describe('getMaterialsByRarity', () => {
  it('returns only materials of that rarity', () => {
    const common = getMaterialsByRarity('common');

    expect(common.length).toBeGreaterThan(0);
    for (const material of common) {
      expect(material.rarity).toBe('common');
    }
  });

  it('partitions the table across its rarities without loss', () => {
    const rarities = new Set(all.map((material) => material.rarity));
    const counted = [...rarities].reduce(
      (sum, rarity) => sum + getMaterialsByRarity(rarity).length,
      0,
    );

    expect(counted).toBe(all.length);
  });

  it('returns nothing for an unknown rarity', () => {
    expect(getMaterialsByRarity('mythic')).toEqual([]);
  });
});

describe('getMaterialsByTag', () => {
  it('returns only materials carrying that tag', () => {
    const result = getMaterialsByTag('fragile');

    expect(result.length).toBeGreaterThan(0);
    for (const material of result) {
      expect(material.tagsAdded).toContain('fragile');
    }
  });

  it('returns nothing for a tag no material carries', () => {
    expect(getMaterialsByTag('nonexistent')).toEqual([]);
  });
});

describe('getRandomMaterial', () => {
  it('returns a material from the table', () => {
    expect(all).toContainEqual(getRandomMaterial(new RNG('seed-a')));
  });

  it('is reproducible from a seed', () => {
    expect(getRandomMaterial(new RNG('seed-a'))).toEqual(getRandomMaterial(new RNG('seed-a')));
  });

  it('varies with the seed', () => {
    const names = new Set(
      ['a', 'b', 'c', 'd', 'e', 'f'].map((seed) => getRandomMaterial(new RNG(seed)).name),
    );

    expect(names.size).toBeGreaterThan(1);
  });
});
