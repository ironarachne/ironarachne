import type { RNG } from '@ironarachne/rng';
import type AgeCategory from './age_category';

export function getCategoryList(): string[] {
  const categories = humanStandard();

  const results = [];

  for (let i = 0; i < categories.length; i++) {
    results.push(categories[i].name);
  }

  return results;
}

export function getCategoryFromAge(age: number, categories: AgeCategory[]): AgeCategory {
  for (let i = 0; i < categories.length; i++) {
    if (categories[i].minAge <= age && categories[i].maxAge >= age) {
      return categories[i];
    }
  }

  throw new Error(`Failed to find age category for age ${age}`);
}

export function getCategoryFromName(name: string, ageGroups: AgeCategory[]): AgeCategory {
  for (let i = 0; i < ageGroups.length; i++) {
    if (ageGroups[i].name == name) {
      return ageGroups[i];
    }
  }

  throw new Error(`Failed to find age category for name ${name}`);
}

export function getDescription(ageCategory: AgeCategory): string {
  return `Name: ${ageCategory.name}, Noun: ${ageCategory.noun}, Age: ${ageCategory.minAge} - ${ageCategory.maxAge}`;
}

export function getHumanVariant(ageModifier: number): AgeCategory[] {
  const categories = humanStandard();

  return getVariant(ageModifier, categories);
}

export function getMaxAge(categories: AgeCategory[]): number {
  let maxAge = 0;

  for (let i = 0; i < categories.length; i++) {
    if (maxAge < categories[i].maxAge) {
      maxAge = categories[i].maxAge;
    }
  }

  return maxAge;
}

/**
 * The same age ladder scaled to a different lifespan.
 *
 * Two things here are not obvious and both were found by taking the species height and weight
 * calculator through the readiness spec (#75):
 *
 * - **It returns new categories rather than rewriting the ones it is given.** It used to assign
 *   straight into the array, which is fine for `getHumanVariant` — that hands it a fresh
 *   `humanStandard()` every time — and is not fine for `averageAgeCategories` in
 *   `species/common.ts`, which hands it a species' own `ageCategories` and so permanently aged
 *   that species for the rest of the session. `averageSizes`, immediately below it, deep-clones
 *   for exactly this reason.
 * - **A category never ends before it begins.** `minAge` chains from the previous category's
 *   scaled `maxAge`, so a small enough modifier drove `maxAge` below the `minAge` that had just
 *   been derived, and the ladder came back reading "2 to 1 years". No shipped species scales
 *   small enough to hit it; the calculator, where a user types the lifespan, does.
 */
export function getVariant(ageModifier: number, categories: AgeCategory[]): AgeCategory[] {
  const result: AgeCategory[] = [];

  for (let i = 0; i < categories.length; i++) {
    const category = { ...categories[i], genderedNoun: [...categories[i].genderedNoun] };

    if (i > 0) {
      category.minAge = result[i - 1].maxAge + 1;
    }
    category.maxAge = Math.max(Math.ceil(category.maxAge * ageModifier), category.minAge);

    // Since "teenager" would be inappropriate if the ages aren't in the teenaged years, we'll change it to "young adult".
    if (category.name == 'teenager') {
      category.name = 'young adult';
      category.noun = 'young adult';
      category.genderedNoun = ['young woman', 'young man', 'young adult'];
    }

    result.push(category);
  }

  return result;
}

export function humanStandard(): AgeCategory[] {
  return [
    {
      name: 'infant',
      noun: 'baby',
      minAge: 0,
      maxAge: 1,
      genderedNoun: ['baby girl', 'baby boy', 'baby'],
      commonality: 1,
    },
    {
      name: 'toddler',
      noun: 'toddler',
      minAge: 2,
      maxAge: 3,
      genderedNoun: ['toddler', 'toddler', 'toddler'],
      commonality: 1,
    },
    {
      name: 'young child',
      noun: 'young child',
      minAge: 4,
      maxAge: 6,
      genderedNoun: ['young girl', 'young boy', 'young child'],
      commonality: 2,
    },
    {
      name: 'child',
      noun: 'child',
      minAge: 7,
      maxAge: 12,
      genderedNoun: ['girl', 'boy', 'child'],
      commonality: 2,
    },
    {
      name: 'teenager',
      noun: 'teenager',
      minAge: 13,
      maxAge: 19,
      genderedNoun: ['teen girl', 'teen boy', 'teenager'],
      commonality: 8,
    },
    {
      name: 'adult',
      noun: 'adult',
      minAge: 20,
      maxAge: 60,
      genderedNoun: ['woman', 'man', 'adult'],
      commonality: 20,
    },
    {
      name: 'elderly',
      noun: 'elder',
      minAge: 61,
      maxAge: 100,
      genderedNoun: ['old woman', 'old man', 'elder'],
      commonality: 3,
    },
  ];
}

export function randomWeighted(names: string[], options: AgeCategory[], rng: RNG): AgeCategory {
  const possibleAgeCategories: AgeCategory[] = [];

  for (let i = 0; i < options.length; i++) {
    if (names.includes(options[i].name)) {
      possibleAgeCategories.push(options[i]);
    }
  }

  const ageCategory: AgeCategory = rng.weighted(
    possibleAgeCategories.map((c) => {
      return { commonality: c.commonality, value: c };
    }),
  );

  return ageCategory;
}

export * from './beast_life_stages';
export * from './dragon_life_stages';
