import { describe, expect, it } from 'vitest';
import type { RNG } from '@ironarachne/rng';
import type AgeCategory from './age_category';
import {
  getCategoryList,
  getCategoryFromAge,
  getCategoryFromName,
  getDescription,
  getHumanVariant,
  getMaxAge,
  getVariant,
  humanStandard,
  randomWeighted,
} from './age_categories';

describe('getCategoryList', () => {
  it('returns an array of category names', () => {
    const list = getCategoryList();
    expect(Array.isArray(list)).toBe(true);
    expect(list.length).toBeGreaterThan(0);
  });

  it('includes standard human categories', () => {
    const list = getCategoryList();
    expect(list).toContain('infant');
    expect(list).toContain('adult');
    expect(list).toContain('elderly');
  });

  it('returns 7 categories for human standard', () => {
    const list = getCategoryList();
    expect(list).toHaveLength(7);
  });
});

describe('getCategoryFromAge', () => {
  const categories = humanStandard();

  it('returns correct category for age in middle of range', () => {
    const category = getCategoryFromAge(30, categories);
    expect(category.name).toBe('adult');
  });

  it('returns correct category at exact minAge boundary', () => {
    const category = getCategoryFromAge(20, categories);
    expect(category.name).toBe('adult');
  });

  it('returns infant for age 0', () => {
    const category = getCategoryFromAge(0, categories);
    expect(category.name).toBe('infant');
  });

  it('returns elderly for age 100', () => {
    const category = getCategoryFromAge(100, categories);
    expect(category.name).toBe('elderly');
  });

  it('throws for age below all categories', () => {
    expect(() => getCategoryFromAge(-1, categories)).toThrow(
      'Failed to find age category for age -1'
    );
  });

  it('throws for age above all categories', () => {
    expect(() => getCategoryFromAge(101, categories)).toThrow(
      'Failed to find age category for age 101'
    );
  });

  it('throws for empty categories array', () => {
    expect(() => getCategoryFromAge(25, [])).toThrow(
      'Failed to find age category for age 25'
    );
  });

  it('throws for age in gap between categories', () => {
    const categoriesWithGap: AgeCategory[] = [
      { name: 'young', noun: 'young', minAge: 0, maxAge: 10, genderedNoun: ['young'], commonality: 1 },
      { name: 'old', noun: 'old', minAge: 20, maxAge: 30, genderedNoun: ['old'], commonality: 1 },
    ];
    expect(() => getCategoryFromAge(15, categoriesWithGap)).toThrow();
  });
});

describe('getCategoryFromName', () => {
  const categories = humanStandard();

  it('returns correct category for valid name', () => {
    const category = getCategoryFromName('adult', categories);
    expect(category.name).toBe('adult');
    expect(category.noun).toBe('adult');
  });

  it('returns correct category for infant', () => {
    const category = getCategoryFromName('infant', categories);
    expect(category.name).toBe('infant');
    expect(category.minAge).toBe(0);
    expect(category.maxAge).toBe(1);
  });

  it('throws for non-existent name', () => {
    expect(() => getCategoryFromName('nonexistent', categories)).toThrow(
      'Failed to find age category for name nonexistent'
    );
  });

  it('throws for empty array', () => {
    expect(() => getCategoryFromName('adult', [])).toThrow(
      'Failed to find age category for name adult'
    );
  });

  it('is case sensitive', () => {
    expect(() => getCategoryFromName('Adult', categories)).toThrow();
    expect(() => getCategoryFromName('ADULT', categories)).toThrow();
  });
});

describe('getDescription', () => {
  it('returns formatted description with name, noun, and age range', () => {
    const category: AgeCategory = {
      name: 'adult',
      noun: 'adult',
      minAge: 20,
      maxAge: 60,
      genderedNoun: ['woman', 'man', 'adult'],
      commonality: 20,
    };
    const description = getDescription(category);
    expect(description).toBe('Name: adult, Noun: adult, Age: 20 - 60');
  });

  it('handles different category values', () => {
    const category: AgeCategory = {
      name: 'toddler',
      noun: 'toddler',
      minAge: 2,
      maxAge: 3,
      genderedNoun: ['toddler'],
      commonality: 1,
    };
    const description = getDescription(category);
    expect(description).toBe('Name: toddler, Noun: toddler, Age: 2 - 3');
  });

  it('handles zero age range', () => {
    const category: AgeCategory = {
      name: 'test',
      noun: 'test',
      minAge: 5,
      maxAge: 5,
      genderedNoun: ['test'],
      commonality: 1,
    };
    const description = getDescription(category);
    expect(description).toBe('Name: test, Noun: test, Age: 5 - 5');
  });
});

describe('getHumanVariant', () => {
  it('returns modified categories with ageModifier > 1', () => {
    const categories = getHumanVariant(2);
    expect(categories.length).toBe(7);
    expect(categories[0].maxAge).toBe(2);
    expect(categories[1].maxAge).toBe(6);
  });

  it('returns modified categories with ageModifier < 1', () => {
    const categories = getHumanVariant(0.5);
    expect(categories.length).toBe(7);
    expect(categories[0].maxAge).toBe(1);
    expect(categories[1].maxAge).toBe(2);
  });

  it('returns unmodified categories with ageModifier = 1', () => {
    const categories = getHumanVariant(1);
    const original = humanStandard();
    expect(categories[0].maxAge).toBe(original[0].maxAge);
    expect(categories[5].maxAge).toBe(original[5].maxAge);
  });

  it('transforms teenager to young adult', () => {
    const categories = getHumanVariant(1.5);
    const youngAdult = categories.find(c => c.name === 'young adult');
    expect(youngAdult).toBeDefined();
    expect(youngAdult?.noun).toBe('young adult');
    expect(youngAdult?.genderedNoun).toEqual(['young woman', 'young man', 'young adult']);
  });
});

describe('getMaxAge', () => {
  it('returns maximum age from categories', () => {
    const categories = humanStandard();
    const maxAge = getMaxAge(categories);
    expect(maxAge).toBe(100);
  });

  it('returns maxAge from single category', () => {
    const categories: AgeCategory[] = [
      { name: 'test', noun: 'test', minAge: 0, maxAge: 50, genderedNoun: ['test'], commonality: 1 },
    ];
    expect(getMaxAge(categories)).toBe(50);
  });

  it('returns 0 for empty array', () => {
    expect(getMaxAge([])).toBe(0);
  });

  it('returns correct max when categories have varying maxAge', () => {
    const categories: AgeCategory[] = [
      { name: 'a', noun: 'a', minAge: 0, maxAge: 10, genderedNoun: ['a'], commonality: 1 },
      { name: 'b', noun: 'b', minAge: 11, maxAge: 100, genderedNoun: ['b'], commonality: 1 },
      { name: 'c', noun: 'c', minAge: 101, maxAge: 50, genderedNoun: ['c'], commonality: 1 },
    ];
    expect(getMaxAge(categories)).toBe(100);
  });

  it('handles duplicate maxAge values correctly', () => {
    const categories: AgeCategory[] = [
      { name: 'a', noun: 'a', minAge: 0, maxAge: 50, genderedNoun: ['a'], commonality: 1 },
      { name: 'b', noun: 'b', minAge: 51, maxAge: 50, genderedNoun: ['b'], commonality: 1 },
    ];
    expect(getMaxAge(categories)).toBe(50);
  });
});

describe('getVariant', () => {
  it('sets minAge to previous maxAge + 1 for i > 0', () => {
    const categories = humanStandard();
    const variant = getVariant(1, categories);
    
    for (let i = 1; i < variant.length; i++) {
      expect(variant[i].minAge).toBe(variant[i - 1].maxAge + 1);
    }
  });

  it('keeps original minAge for first category (i === 0)', () => {
    const categories = humanStandard();
    const originalMinAge = categories[0].minAge;
    const variant = getVariant(2, categories);
    expect(variant[0].minAge).toBe(originalMinAge);
  });

  it('applies Math.ceil to maxAge', () => {
    const categories: AgeCategory[] = [
      { name: 'test', noun: 'test', minAge: 0, maxAge: 10, genderedNoun: ['test'], commonality: 1 },
    ];
    const variant = getVariant(1.5, categories);
    expect(variant[0].maxAge).toBe(Math.ceil(10 * 1.5));
    expect(variant[0].maxAge).toBe(15);
  });

  it('transforms teenager to young adult', () => {
    const categories = humanStandard();
    const variant = getVariant(1, categories);
    const teenager = variant.find(c => c.name === 'young adult');
    expect(teenager).toBeDefined();
    expect(teenager?.noun).toBe('young adult');
    expect(teenager?.genderedNoun).toEqual(['young woman', 'young man', 'young adult']);
  });

  it('does not transform non-teenager names', () => {
    const categories = humanStandard();
    const variant = getVariant(1, categories);
    const adult = variant.find(c => c.name === 'adult');
    expect(adult).toBeDefined();
    expect(adult?.noun).toBe('adult');
    expect(adult?.genderedNoun).toEqual(['woman', 'man', 'adult']);
  });

  it('handles ageModifier < 1 correctly', () => {
    const categories = humanStandard();
    const variant = getVariant(0.5, categories);
    expect(variant[0].maxAge).toBe(Math.ceil(1 * 0.5));
    expect(variant[5].maxAge).toBe(Math.ceil(60 * 0.5));
  });

  it('handles ageModifier > 1 correctly', () => {
    const categories = humanStandard();
    const variant = getVariant(2, categories);
    expect(variant[0].maxAge).toBe(2);
    expect(variant[5].maxAge).toBe(120);
  });

  it('maintains contiguous age ranges', () => {
    const categories = humanStandard();
    const variant = getVariant(1.5, categories);
    
    for (let i = 1; i < variant.length; i++) {
      expect(variant[i].minAge).toBe(variant[i - 1].maxAge + 1);
    }
  });
});

describe('humanStandard', () => {
  it('returns 7 categories with correct names in order', () => {
    const categories = humanStandard();
    expect(categories).toHaveLength(7);
    const names = categories.map(c => c.name);
    expect(names).toEqual(['infant', 'toddler', 'young child', 'child', 'teenager', 'adult', 'elderly']);
  });

  it('has contiguous age ranges from 0 to 100', () => {
    const categories = humanStandard();
    expect(categories[0].minAge).toBe(0);
    expect(categories[categories.length - 1].maxAge).toBe(100);
    for (let i = 1; i < categories.length; i++) {
      expect(categories[i].minAge).toBe(categories[i - 1].maxAge + 1);
    }
  });

  it('has correct commonality values', () => {
    const categories = humanStandard();
    expect(categories[0].commonality).toBe(1);
    expect(categories[4].commonality).toBe(8);
    expect(categories[5].commonality).toBe(20);
    expect(categories[6].commonality).toBe(3);
  });

  it('returns a fresh array each call', () => {
    const a = humanStandard();
    const b = humanStandard();
    expect(a).not.toBe(b);
    expect(a).toEqual(b);
  });

  it('has correct noun values for all categories', () => {
    const categories = humanStandard();
    expect(categories[0].noun).toBe('baby');
    expect(categories[1].noun).toBe('toddler');
    expect(categories[2].noun).toBe('young child');
    expect(categories[3].noun).toBe('child');
    expect(categories[4].noun).toBe('teenager');
    expect(categories[5].noun).toBe('adult');
    expect(categories[6].noun).toBe('elder');
  });

  it('has correct genderedNoun values for all categories', () => {
    const categories = humanStandard();
    expect(categories[0].genderedNoun).toEqual(['baby girl', 'baby boy', 'baby']);
    expect(categories[1].genderedNoun).toEqual(['toddler', 'toddler', 'toddler']);
    expect(categories[2].genderedNoun).toEqual(['young girl', 'young boy', 'young child']);
    expect(categories[3].genderedNoun).toEqual(['girl', 'boy', 'child']);
    expect(categories[4].genderedNoun).toEqual(['teen girl', 'teen boy', 'teenager']);
    expect(categories[5].genderedNoun).toEqual(['woman', 'man', 'adult']);
    expect(categories[6].genderedNoun).toEqual(['old woman', 'old man', 'elder']);
  });
});

describe('randomWeighted', () => {
  const categories = humanStandard();

  it('filters categories by names array', () => {
    const mockRng: RNG = {
      weighted: (items) => items[0].value,
      int: () => 0,
      float: () => 0,
      bool: () => true,
      pick: (items) => items[0],
    };

    const names = ['infant', 'adult'];
    const result = randomWeighted(names, categories, mockRng);
    expect(['infant', 'adult']).toContain(result.name);
  });

  it('uses commonality for weighting', () => {
    const items: { commonality: number; value: AgeCategory }[] = [];
    
    const mockRng: RNG = {
      weighted: (passedItems) => {
        items.push(...passedItems);
        return passedItems[0].value;
      },
      int: () => 0,
      float: () => 0,
      bool: () => true,
      pick: (items) => items[0],
    };

    const names = ['infant', 'adult'];
    randomWeighted(names, categories, mockRng);
    
    expect(items.length).toBe(2);
    expect(items[0].commonality).toBe(1);
    expect(items[1].commonality).toBe(20);
  });

  it('returns category from filtered list', () => {
    const mockRng: RNG = {
      weighted: (items) => items[items.length - 1].value,
      int: () => 0,
      float: () => 0,
      bool: () => true,
      pick: (items) => items[0],
    };

    const names = ['child', 'teenager'];
    const result = randomWeighted(names, categories, mockRng);
    expect(result.name).toBe('teenager');
  });

  it('handles single name in array', () => {
    const mockRng: RNG = {
      weighted: (items) => items[0].value,
      int: () => 0,
      float: () => 0,
      bool: () => true,
      pick: (items) => items[0],
    };

    const names = ['elderly'];
    const result = randomWeighted(names, categories, mockRng);
    expect(result.name).toBe('elderly');
  });

  it('handles all category names', () => {
    const mockRng: RNG = {
      weighted: (items) => items[0].value,
      int: () => 0,
      float: () => 0,
      bool: () => true,
      pick: (items) => items[0],
    };

    const names = categories.map(c => c.name);
    const result = randomWeighted(names, categories, mockRng);
    expect(categories.map(c => c.name)).toContain(result.name);
  });
});
