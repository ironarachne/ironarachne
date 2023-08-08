import random from "random";
import { d as describeDice, s as simplify, a as rangeToDiceExpression } from "./dice.js";
import "./sentry-release-injection-file.js";
function cmToInches(cm) {
  return cm * 0.3937;
}
function kgToPounds(kg) {
  return kg * 2.2046;
}
function inchesToFeetExpression(inches) {
  let expression = "";
  const feet = Math.floor(inches / 12);
  const remainder = Math.floor(inches % 12);
  expression += feet + "'" + remainder + '"';
  return expression;
}
class AgeCategory {
  name;
  noun;
  minAge;
  maxAge;
  minHeight;
  // in cm
  maxHeight;
  // in cm
  minWeight;
  // in kg
  maxWeight;
  // in kg
  commonality;
  constructor() {
    this.name = "";
    this.noun = "";
    this.minAge = -1;
    this.maxAge = -1;
    this.minHeight = -1;
    this.maxHeight = -1;
    this.minWeight = -1;
    this.maxWeight = -1;
    this.commonality = 1;
  }
  getDescription() {
    return `Name: ${this.name}, Noun: ${this.noun}, Age: ${this.minAge} - ${this.maxAge}, Height: ${this.minHeight} - ${this.maxHeight}, Weight: ${this.minWeight} - ${this.maxWeight}`;
  }
  getHeightRange() {
    const metricHeightModifier = Math.max(this.maxHeight - this.minHeight, 4);
    const metric = this.minHeight + " + " + describeDice(simplify(rangeToDiceExpression(metricHeightModifier))) + " cm";
    const imperialHeightModifier = Math.max(
      cmToInches(this.maxHeight - this.minHeight),
      4
    );
    const imperial = inchesToFeetExpression(cmToInches(this.minHeight)) + " + " + describeDice(simplify(rangeToDiceExpression(imperialHeightModifier))) + " in.";
    return `${metric} (${imperial})`;
  }
  getWeightRange() {
    const metricWeightModifier = Math.max(this.maxWeight - this.minWeight, 4);
    const metric = this.minWeight + " + " + describeDice(simplify(rangeToDiceExpression(metricWeightModifier))) + " kg";
    const imperialWeightModifier = Math.max(
      Math.round(kgToPounds(this.maxWeight - this.minWeight)),
      4
    );
    const imperial = Math.round(kgToPounds(this.minWeight)) + " + " + describeDice(simplify(rangeToDiceExpression(imperialWeightModifier))) + " lb.";
    return `${metric} (${imperial})`;
  }
  randomAge() {
    return random.int(this.minAge, this.maxAge);
  }
  randomHeight() {
    return random.int(this.minHeight, this.maxHeight);
  }
  randomWeight() {
    return random.int(this.minWeight, this.maxWeight);
  }
}
function getCategoryList() {
  const categories = humanStandardFemale();
  let results = [];
  for (let i = 0; i < categories.length; i++) {
    results.push(categories[i].name);
  }
  return results;
}
function getCategoryFromAge(age, categories) {
  for (let i = 0; i < categories.length; i++) {
    if (categories[i].minAge <= age && categories[i].maxAge >= age) {
      return categories[i];
    }
  }
  throw new Error(`Failed to find age category for age ${age}`);
}
function getHumanVariant(ageModifier, weightModifier, heightModifier, gender) {
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
function getMaxAge(categories) {
  let maxAge = 0;
  for (let i = 0; i < categories.length; i++) {
    if (maxAge < categories[i].maxAge) {
      maxAge = categories[i].maxAge;
    }
  }
  return maxAge;
}
function humanStandardFemale() {
  return [
    newCategory("infant", "baby girl", 0, 1, 49, 2, 1),
    newCategory("toddler", "toddler", 2, 3, 80, 14, 1),
    newCategory("young child", "young girl", 4, 6, 115, 19, 2),
    newCategory("child", "girl", 7, 12, 149, 20, 2),
    newCategory("young adult", "young woman", 13, 19, 158, 57, 8),
    newCategory("adult", "woman", 20, 60, 160, 64, 20),
    newCategory("elderly", "woman", 61, 100, 155, 60, 3)
  ];
}
function humanStandardMale() {
  return [
    newCategory("infant", "baby boy", 0, 1, 50, 2, 1),
    newCategory("toddler", "toddler", 2, 3, 85, 14, 1),
    newCategory("young child", "young boy", 4, 6, 115, 20, 2),
    newCategory("child", "boy", 7, 12, 145, 36, 2),
    newCategory("young adult", "young man", 13, 19, 170, 68, 8),
    newCategory("adult", "man", 20, 60, 175, 70, 20),
    newCategory("elderly", "man", 61, 100, 170, 65, 3)
  ];
}
function newCategory(name, noun, minAge, maxAge, minHeight, minWeight, commonality) {
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
export {
  AgeCategory as A,
  getCategoryFromAge as a,
  humanStandardMale as b,
  cmToInches as c,
  getHumanVariant as d,
  getCategoryList as e,
  getMaxAge as g,
  humanStandardFemale as h,
  inchesToFeetExpression as i,
  kgToPounds as k
};
//# sourceMappingURL=agecategories.js.map
