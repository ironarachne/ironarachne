'use strict';

import AgeCategory from './agecategory';

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
}

export function getCategoryFromName(name: string, ageGroups: AgeCategory[]): AgeCategory {
  for (let i = 0; i < ageGroups.length; i++) {
    if (ageGroups[i].name == name) {
      return ageGroups[i];
    }
  }
}

export function getHumanVariant(
  ageModifier: number,
  weightModifier: number,
  heightModifier: number,
  gender: string,
): AgeCategory[] {
  let categories = humanStandardFemale();

  if (gender == 'male') {
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
    new AgeCategory('infant', 'baby girl', 0, 1, 49, 2),
    new AgeCategory('toddler', 'toddler', 2, 3, 80, 14),
    new AgeCategory('young child', 'young girl', 4, 6, 115, 19),
    new AgeCategory('child', 'girl', 7, 12, 149, 20),
    new AgeCategory('young adult', 'young woman', 13, 19, 158, 57),
    new AgeCategory('adult', 'woman', 20, 60, 160, 64),
    new AgeCategory('elderly', 'woman', 61, 100, 155, 60),
  ];
}

export function humanStandardMale(): AgeCategory[] {
  return [
    new AgeCategory('infant', 'baby boy', 0, 1, 50, 2),
    new AgeCategory('toddler', 'toddler', 2, 3, 85, 14),
    new AgeCategory('young child', 'young boy', 4, 6, 115, 20),
    new AgeCategory('child', 'boy', 7, 12, 145, 36),
    new AgeCategory('young adult', 'young man', 13, 19, 170, 68),
    new AgeCategory('adult', 'man', 20, 60, 175, 70),
    new AgeCategory('elderly', 'man', 61, 100, 170, 65),
  ];
}
