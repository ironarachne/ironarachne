import { expect, describe, it } from 'vitest';
import { RNG } from '@ironarachne/rng';
import { generateDrink } from './drink';
import * as DrinkTypes from './drinktypes';

describe('generateDrink drink type', () => {
  it('draws the drink type from the table', () => {
    const drink = generateDrink(new RNG('new'));

    expect(DrinkTypes.all().map((type) => type.name)).toContain(drink.drinkType.name);
  });
});

describe('generateDrink', () => {
  it('is deterministic for a given seed', () => {
    expect(generateDrink(new RNG('ale'))).toEqual(generateDrink(new RNG('ale')));
  });

  it('produces different drinks for different seeds', () => {
    const descriptions = new Set(
      Array.from({ length: 10 }, (_, index) => generateDrink(new RNG(`vary-${index}`)).description),
    );

    expect(descriptions.size).toBeGreaterThan(1);
  });

  it('names the drink after its type', () => {
    const drink = generateDrink(new RNG('named'));

    expect(drink.name).toBe(drink.drinkType.name);
  });

  it('picks an appearance its drink type actually offers', () => {
    for (let index = 0; index < 20; index++) {
      const drink = generateDrink(new RNG(`appearance-${index}`));

      expect(drink.drinkType.appearances).toContain(drink.appearance);
    }
  });

  it('keeps strength inside the drink type range', () => {
    for (let index = 0; index < 20; index++) {
      const drink = generateDrink(new RNG(`strength-${index}`));

      expect(drink.strength).toBeGreaterThanOrEqual(drink.drinkType.strengthMin);
      expect(drink.strength).toBeLessThanOrEqual(drink.drinkType.strengthMax);
    }
  });

  it('keeps quality between 0 and 6', () => {
    for (let index = 0; index < 20; index++) {
      const drink = generateDrink(new RNG(`quality-${index}`));

      expect(drink.quality).toBeGreaterThanOrEqual(0);
      expect(drink.quality).toBeLessThanOrEqual(6);
    }
  });

  it('prices the drink from its type, quality and strength', () => {
    for (let index = 0; index < 20; index++) {
      const drink = generateDrink(new RNG(`cost-${index}`));
      const base = drink.quality + Math.floor(drink.strength / 2);

      expect(drink.cost).toBeGreaterThanOrEqual(drink.drinkType.costMin + base);
      expect(drink.cost).toBeLessThanOrEqual(drink.drinkType.costMax + base);
    }
  });

  it('ends the description with the drink type name', () => {
    for (let index = 0; index < 20; index++) {
      const drink = generateDrink(new RNG(`describe-${index}`));

      expect(drink.description.endsWith(drink.drinkType.name)).toBe(true);
    }
  });

  it('never leaves an undefined fragment in the description', () => {
    for (let index = 0; index < 40; index++) {
      expect(generateDrink(new RNG(`clean-${index}`)).description).not.toContain('undefined');
    }
  });

  it('sometimes describes strength and quality, and sometimes does not', () => {
    const descriptions = Array.from({ length: 60 }, (_, index) =>
      generateDrink(new RNG(`adjectives-${index}`)),
    );
    const strengthWords = ['very weak', 'weak', 'moderately strong', 'potent', 'very strong'];
    const qualityWords = ['nasty', 'awful', 'acceptable', 'decent', 'good', 'excellent'];

    expect(
      descriptions.some((drink) => strengthWords.some((word) => drink.description.includes(word))),
    ).toBe(true);
    expect(
      descriptions.some((drink) => qualityWords.some((word) => drink.description.includes(word))),
    ).toBe(true);
    expect(descriptions.some((drink) => drink.description === ` ${drink.drinkType.name}`)).toBe(
      true,
    );
  });

  it('uses every drink type across enough seeds', () => {
    const used = new Set(
      Array.from({ length: 200 }, (_, index) => generateDrink(new RNG(`type-${index}`)).name),
    );

    expect(used.size).toBe(DrinkTypes.all().length);
  });
});

describe('DrinkTypes.all', () => {
  it('lists drink types with unique names', () => {
    const names = DrinkTypes.all().map((type) => type.name);

    expect(new Set(names).size).toBe(names.length);
  });

  it('gives every type a valid strength and cost range and at least one appearance', () => {
    for (const type of DrinkTypes.all()) {
      expect(type.strengthMin).toBeLessThanOrEqual(type.strengthMax);
      expect(type.costMin).toBeLessThanOrEqual(type.costMax);
      expect(type.appearances.length).toBeGreaterThan(0);
    }
  });

  it('returns a fresh list each call so callers cannot mutate the source', () => {
    const first = DrinkTypes.all();
    first[0].name = 'mutated';

    expect(DrinkTypes.all()[0].name).toBe('ale');
  });
});
