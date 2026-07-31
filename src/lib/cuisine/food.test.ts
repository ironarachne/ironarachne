import { expect, describe, it } from 'vitest';
import { RNG } from '@ironarachne/rng';
import { generateDish } from './food';

const COOKING_METHODS = ['roasted', 'fried', 'baked', 'broiled', 'seared', 'charbroiled'];
const SEASONING_PHRASES = ['seasoned with', 'flavored with', 'spiced with'];

function dishes(count: number, prefix: string): string[] {
  return Array.from({ length: count }, (_, index) => generateDish(new RNG(`${prefix}-${index}`)));
}

describe('generateDish', () => {
  it('is deterministic for a given seed', () => {
    expect(generateDish(new RNG('stew'))).toBe(generateDish(new RNG('stew')));
  });

  it('produces different dishes for different seeds', () => {
    expect(new Set(dishes(10, 'vary')).size).toBeGreaterThan(1);
  });

  it('opens with a cooking method', () => {
    for (const dish of dishes(20, 'method')) {
      expect(COOKING_METHODS.some((method) => dish.startsWith(`${method} `))).toBe(true);
    }
  });

  it('uses every cooking method across enough seeds', () => {
    const used = new Set(
      dishes(120, 'all-methods').map((dish) => COOKING_METHODS.find((m) => dish.startsWith(m))),
    );

    expect(used.size).toBe(COOKING_METHODS.length);
  });

  it('always names a seasoning after a seasoning phrase', () => {
    for (const dish of dishes(30, 'seasoned')) {
      const phrase = SEASONING_PHRASES.find((candidate) => dish.includes(`, ${candidate} `));

      expect(phrase).toBeDefined();
      expect(dish.split(`, ${phrase} `)[1]).toBeTruthy();
    }
  });

  it('lists between one and three distinct seasonings', () => {
    for (const dish of dishes(40, 'count')) {
      const phrase = SEASONING_PHRASES.find((candidate) => dish.includes(`, ${candidate} `));
      const seasonings = dish
        .split(`, ${phrase} `)[1]
        .split(/, | and /)
        .filter(Boolean);

      expect(seasonings.length).toBeGreaterThanOrEqual(1);
      expect(seasonings.length).toBeLessThanOrEqual(3);
      expect(new Set(seasonings).size).toBe(seasonings.length);
    }
  });

  it('sometimes adds a vegetable with a joining word, and sometimes does not', () => {
    const withVegetable = dishes(60, 'veg').filter((dish) =>
      / (and|on|with) /.test(dish.split(',')[0]),
    );

    expect(withVegetable.length).toBeGreaterThan(0);
    expect(withVegetable.length).toBeLessThan(60);
  });

  it('sometimes turns the main component into a sausage or stew', () => {
    const dishes120 = dishes(120, 'modifier');

    expect(dishes120.some((dish) => /(sausage|stew)/.test(dish.split(',')[0]))).toBe(true);
  });

  it('never leaves an undefined fragment in the dish', () => {
    for (const dish of dishes(60, 'clean')) {
      expect(dish).not.toContain('undefined');
      expect(dish).not.toContain('  ');
    }
  });

  it('draws main components from every focus category across enough seeds', () => {
    const generated = dishes(200, 'focus').join(' | ');

    // Each focus category should show up at least once in a sample this large.
    expect(
      /(squash|eggplant|pumpkin|potatoes|turnips|beets|fennel|carrots|celeriac)/.test(generated),
    ).toBe(true);
    expect(/(trout|bass|salmon|tuna|cod|red snapper|halibut|catfish|tilapia)/.test(generated)).toBe(
      true,
    );
    expect(/(chicken|quail|turkey|duck|pheasant|goose|squab|guineafowl)/.test(generated)).toBe(
      true,
    );
    expect(/(beef|pork|lamb|goat)/.test(generated)).toBe(true);
    expect(/(bison|caribou|elk|pronghorn|rabbit|squirrel|venison|wild boar)/.test(generated)).toBe(
      true,
    );
  });
});
