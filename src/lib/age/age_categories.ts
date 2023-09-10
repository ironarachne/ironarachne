import * as RND from "@ironarachne/rng";
import type AgeCategory from "./age_category";

export function getCategoryList(): string[] {
  const categories = humanStandard();

  let results = [];

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

export function getHumanVariant(
  ageModifier: number,
): AgeCategory[] {
  let categories = humanStandard();

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

export function getVariant(
  ageModifier: number,
  categories: AgeCategory[],
): AgeCategory[] {
  for (let i = 0; i < categories.length; i++) {
    if (i > 0) {
      categories[i].minAge = categories[i - 1].maxAge + 1;
    }
    categories[i].maxAge = Math.ceil(categories[i].maxAge * ageModifier);

    // Since "teenager" would be inappropriate if the ages aren't in the teenaged years, we'll change it to "young adult".
    if (categories[i].name == "teenager") {
      categories[i].name = "young adult";
      categories[i].noun = "young adult";
      categories[i].genderedNoun = ["young woman", "young man", "young adult"];
    }
  }

  return categories;
}

export function humanStandard(): AgeCategory[] {
  return [
    {
      name: "infant",
      noun: "baby",
      minAge: 0,
      maxAge: 1,
      genderedNoun: ["baby girl", "baby boy", "baby"],
      commonality: 1,
    },
    {
      name: "toddler",
      noun: "toddler",
      minAge: 2,
      maxAge: 3,
      genderedNoun: ["toddler", "toddler", "toddler"],
      commonality: 1,
    },
    {
      name: "young child",
      noun: "young child",
      minAge: 4,
      maxAge: 6,
      genderedNoun: ["young girl", "young boy", "young child"],
      commonality: 2,
    },
    { name: "child", noun: "child", minAge: 7, maxAge: 12, genderedNoun: ["girl", "boy", "child"], commonality: 2 },
    {
      name: "teenager",
      noun: "teenager",
      minAge: 13,
      maxAge: 19,
      genderedNoun: ["teen girl", "teen boy", "teenager"],
      commonality: 8,
    },
    { name: "adult", noun: "adult", minAge: 20, maxAge: 60, genderedNoun: ["woman", "man", "adult"], commonality: 20 },
    {
      name: "elderly",
      noun: "elder",
      minAge: 61,
      maxAge: 100,
      genderedNoun: ["old woman", "old man", "elder"],
      commonality: 3,
    },
  ];
}

export function randomWeighted(names: string[], options: AgeCategory[]): AgeCategory {
  let possibleAgeCategories: AgeCategory[] = [];

  for (let i = 0; i < options.length; i++) {
    if (names.includes(options[i].name)) {
      possibleAgeCategories.push(options[i]);
    }
  }

  const ageCategory: AgeCategory = RND.weighted(possibleAgeCategories);

  return ageCategory;
}
