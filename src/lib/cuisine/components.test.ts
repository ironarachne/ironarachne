import { expect, describe, it } from 'vitest';
import * as Components from './components';
import { generate } from './generator';
import { getDefaultConfig } from './generatorconfig';

const CATEGORY_GROUPS = [
  ['spices', Components.spices, 'spice'],
  ['herbs', Components.herbs, 'herb'],
  ['vegetables', Components.vegetables, 'vegetable'],
  ['meats', Components.meats, 'meat'],
  ['seafood', Components.seafood, 'seafood'],
  ['fruits', Components.fruits, 'fruit'],
] as const;

describe('Components.all', () => {
  it('is the concatenation of every category group', () => {
    const expected = CATEGORY_GROUPS.reduce<number>(
      (total, [, group]) => total + group().length,
      0,
    );

    expect(Components.all()).toHaveLength(expected);
  });

  it('lists components with unique name-and-category pairs', () => {
    // A few names appear in two categories — coriander and fennel are both spice and herb —
    // so the identity of a component is its name together with its category.
    const keys = Components.all().map((component) => `${component.category}:${component.name}`);

    expect(new Set(keys).size).toBe(keys.length);
  });

  it('gives every component a name, a flavor and a colour', () => {
    for (const component of Components.all()) {
      expect(component.name).toBeTruthy();
      expect(component.flavors.length).toBeGreaterThan(0);
      expect(component.colors.length).toBeGreaterThan(0);
    }
  });

  it('returns a fresh list each call so callers cannot mutate the source', () => {
    const first = Components.all();
    const originalName = first[0].name;
    first[0].name = 'mutated';

    expect(Components.all()[0].name).toBe(originalName);
  });
});

describe.each(CATEGORY_GROUPS)('Components.%s', (_name, group, category) => {
  it('is non-empty', () => {
    expect(group().length).toBeGreaterThan(0);
  });

  it('tags every component with its own category', () => {
    for (const component of group()) {
      expect(component.category).toBe(category);
    }
  });

  it('is included in all()', () => {
    const allNames = Components.all().map((component) => component.name);

    for (const component of group()) {
      expect(allNames).toContain(component.name);
    }
  });
});

describe('getDefaultConfig', () => {
  it('starts with every option list empty', () => {
    const config = getDefaultConfig();

    expect(config.possibleSeasonings).toEqual([]);
    expect(config.possibleComplements).toEqual([]);
    expect(config.possibleMainComponents).toEqual([]);
    expect(config.possibleCookingMethods).toEqual([]);
    expect(config.possibleDrinks).toEqual([]);
  });

  it('gives each config its own lists', () => {
    getDefaultConfig().possibleDrinks.push('ale');

    expect(getDefaultConfig().possibleDrinks).toEqual([]);
  });
});

describe('generate', () => {
  // The generator body is still a TODO; it returns a blank cuisine for now.
  it('returns a cuisine with every list empty', () => {
    const cuisine = generate(getDefaultConfig());

    expect(cuisine.commonDishes).toEqual([]);
    expect(cuisine.commonSeasonings).toEqual([]);
    expect(cuisine.commonVegetables).toEqual([]);
    expect(cuisine.commonMainComponents).toEqual([]);
    expect(cuisine.commonCookingMethods).toEqual([]);
    expect(cuisine.commonDrinks).toEqual([]);
  });

  it('gives each cuisine its own lists', () => {
    generate(getDefaultConfig()).commonDishes.push('stew');

    expect(generate(getDefaultConfig()).commonDishes).toEqual([]);
  });
});
