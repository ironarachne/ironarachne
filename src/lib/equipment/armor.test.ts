import { describe, expect, it } from 'vitest';
import { armorTypes, createArmor, generateArmor, getValueOfArmorType } from './armor';

const seeds = ['a', 'b', 'c', 'd', 'e', 'f'];

describe('armorTypes', () => {
  it('describes every armor type with a defense value', () => {
    expect(armorTypes.length).toBeGreaterThan(0);

    for (const type of armorTypes) {
      expect(type.name.length).toBeGreaterThan(0);
      expect(type.description.length).toBeGreaterThan(0);
      expect(type.defense).toBeGreaterThan(0);
      expect(['light', 'medium', 'heavy']).toContain(type.armorCategory);
    }
  });

  it('names every armor type uniquely', () => {
    const names = armorTypes.map((type) => type.name);

    expect(new Set(names).size).toBe(names.length);
  });

  it('covers all three armor categories', () => {
    const categories = new Set(armorTypes.map((type) => type.armorCategory));

    expect(categories).toEqual(new Set(['light', 'medium', 'heavy']));
  });
});

describe('getValueOfArmorType', () => {
  it('scales value by category', () => {
    const base = { name: 'x', baseValue: 0, defense: 2, description: 'x' } as const;

    expect(getValueOfArmorType({ ...base, armorCategory: 'light' })).toBe(502);
    expect(getValueOfArmorType({ ...base, armorCategory: 'medium' })).toBe(753);
    expect(getValueOfArmorType({ ...base, armorCategory: 'heavy' })).toBe(1004);
  });

  it('rises with defense', () => {
    const base = { name: 'x', baseValue: 0, description: 'x', armorCategory: 'light' } as const;

    expect(getValueOfArmorType({ ...base, defense: 5 })).toBeGreaterThan(
      getValueOfArmorType({ ...base, defense: 1 }),
    );
  });

  it('returns a whole number for every type in the table', () => {
    for (const type of armorTypes) {
      expect(Number.isInteger(getValueOfArmorType(type))).toBe(true);
    }
  });
});

describe('createArmor', () => {
  const type = armorTypes[0];

  it('takes its shape from the armor type', () => {
    const armor = createArmor('a1', type);

    expect(armor.id).toBe('a1');
    expect(armor.name).toBe(type.name);
    expect(armor.description).toBe(type.description);
    expect(armor.itemMajorType).toBe('armor');
    expect(armor.itemMinorType).toBe(type.armorCategory);
    expect(armor.armorType).toEqual(type);
    expect(armor.rarity).toBe('common');
  });

  it('puts the type’s defense in the combat profile and nothing else', () => {
    const armor = createArmor('a1', type);

    expect(armor.combatProfile.defense).toBe(type.defense);
    expect(armor.combatProfile.attack).toBe(0);
    expect(armor.combatProfile.power).toBe(0);
  });

  it('prices the armor from its type', () => {
    expect(createArmor('a1', type).value).toBe(getValueOfArmorType(type));
  });

  it('accepts an override name', () => {
    expect(createArmor('a1', type, 'Bequeathed Mail').name).toBe('Bequeathed Mail');
  });

  it.each([
    ['light', 10],
    ['medium', 20],
    ['heavy', 40],
  ])('weighs %s armor at %i', (category, weight) => {
    const armor = createArmor('a1', {
      name: 'x',
      baseValue: 0,
      defense: 1,
      description: 'x',
      armorCategory: category as 'light' | 'medium' | 'heavy',
    });

    expect(armor.weight).toBe(weight);
  });
});

describe('generateArmor', () => {
  it('is reproducible from a seed', () => {
    expect(generateArmor('seed-a')).toEqual(generateArmor('seed-a'));
  });

  it('varies with the seed', () => {
    const names = new Set(seeds.map((seed) => generateArmor(seed).name));

    expect(names.size).toBeGreaterThan(1);
  });

  it('applies a material, which renames and reprices the armor', () => {
    for (const seed of seeds) {
      const armor = generateArmor(seed);

      expect(armor.material).toBeDefined();
      expect(armor.name).toBe(`${armor.material!.name} ${armor.armorType.name}`);
      expect(armor.value).toBe(
        Math.floor(getValueOfArmorType(armor.armorType) * armor.material!.valueMultiplier),
      );
    }
  });

  it('produces armor of a type from the table', () => {
    for (const seed of seeds) {
      expect(armorTypes).toContainEqual(generateArmor(seed).armorType);
    }
  });

  it('keeps the defense from the armor type', () => {
    for (const seed of seeds) {
      const armor = generateArmor(seed);

      expect(armor.combatProfile.defense).toBeGreaterThanOrEqual(armor.armorType.defense);
    }
  });
});
