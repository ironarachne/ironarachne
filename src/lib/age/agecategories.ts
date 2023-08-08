"use strict";

import AgeCategory from "./agecategory.js";

export function getCategoryList(): string[] {
  const categories = humanStandardFemale();

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

export function getHumanVariant(
  ageModifier: number,
  weightModifier: number,
  heightModifier: number,
  gender: string,
): AgeCategory[] {
  let categories = humanStandardFemale();

  if (gender == "male") {
    categories = humanStandardMale();
  }

  for (let i = 0; i < categories.length; i++) {
    if (i > 0) {
      categories[i].minAge = categories[i - 1].maxAge + 1;
    }
    categories[i].maxAge = Math.ceil(categories[i].maxAge * ageModifier);
    categories[i].minHeight = Math.ceil(categories[i].minHeight * heightModifier);
    categories[i].maxHeight = Math.ceil(categories[i].maxHeight * heightModifier);
    categories[i].minWeight = Math.ceil(categories[i].minWeight * weightModifier);
    categories[i].maxWeight = Math.ceil(categories[i].maxWeight * weightModifier);
  }

  return categories;
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

export function humanStandardFemale(): AgeCategory[] {
  return [
    newCategory("infant", "baby girl", 0, 1, 49, 2, 1),
    newCategory("toddler", "toddler", 2, 3, 80, 14, 1),
    newCategory("young child", "young girl", 4, 6, 115, 19, 2),
    newCategory("child", "girl", 7, 12, 149, 20, 2),
    newCategory("young adult", "young woman", 13, 19, 158, 57, 8),
    newCategory("adult", "woman", 20, 60, 160, 64, 20),
    newCategory("elderly", "woman", 61, 100, 155, 60, 3),
  ];
}

export function humanStandardMale(): AgeCategory[] {
  return [
    newCategory("infant", "baby boy", 0, 1, 50, 2, 1),
    newCategory("toddler", "toddler", 2, 3, 85, 14, 1),
    newCategory("young child", "young boy", 4, 6, 115, 20, 2),
    newCategory("child", "boy", 7, 12, 145, 36, 2),
    newCategory("young adult", "young man", 13, 19, 170, 68, 8),
    newCategory("adult", "man", 20, 60, 175, 70, 20),
    newCategory("elderly", "man", 61, 100, 170, 65, 3),
  ];
}

export function newCategory(
  name: string,
  noun: string,
  minAge: number,
  maxAge: number,
  minHeight: number,
  minWeight: number,
  commonality: number,
): AgeCategory {
  let category = new AgeCategory();

  category.name = name;
  category.noun = noun;
  category.minAge = minAge;
  category.maxAge = maxAge;
  category.minHeight = minHeight;
  category.maxHeight = Math.floor(minHeight * 1.05);
  category.minWeight = minWeight;
  category.maxWeight = Math.floor(minWeight * 1.05);
  category.commonality = commonality;

  return category;
}
