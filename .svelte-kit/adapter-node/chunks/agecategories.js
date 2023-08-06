import random from "random";
import { d as describeDice, s as simplify, a as rangeToDiceExpression } from "./dice.js";
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
  constructor(name, noun, minAge, maxAge, minHeight, minWeight) {
    this.name = name;
    this.noun = noun;
    this.minAge = minAge;
    this.maxAge = maxAge;
    this.minHeight = minHeight;
    this.maxHeight = Math.floor(minHeight * 1.05);
    this.minWeight = minWeight;
    this.maxWeight = Math.floor(minWeight * 1.05);
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
function getCategoryFromName(name, ageGroups) {
  for (let i = 0; i < ageGroups.length; i++) {
    if (ageGroups[i].name == name) {
      return ageGroups[i];
    }
  }
  throw new Error(`Failed to find age category for name ${name}`);
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
    new AgeCategory("infant", "baby girl", 0, 1, 49, 2),
    new AgeCategory("toddler", "toddler", 2, 3, 80, 14),
    new AgeCategory("young child", "young girl", 4, 6, 115, 19),
    new AgeCategory("child", "girl", 7, 12, 149, 20),
    new AgeCategory("young adult", "young woman", 13, 19, 158, 57),
    new AgeCategory("adult", "woman", 20, 60, 160, 64),
    new AgeCategory("elderly", "woman", 61, 100, 155, 60)
  ];
}
function humanStandardMale() {
  return [
    new AgeCategory("infant", "baby boy", 0, 1, 50, 2),
    new AgeCategory("toddler", "toddler", 2, 3, 85, 14),
    new AgeCategory("young child", "young boy", 4, 6, 115, 20),
    new AgeCategory("child", "boy", 7, 12, 145, 36),
    new AgeCategory("young adult", "young man", 13, 19, 170, 68),
    new AgeCategory("adult", "man", 20, 60, 175, 70),
    new AgeCategory("elderly", "man", 61, 100, 170, 65)
  ];
}
export {
  getCategoryFromAge as a,
  getCategoryList as b,
  cmToInches as c,
  getCategoryFromName as d,
  getHumanVariant as e,
  humanStandardMale as f,
  getMaxAge as g,
  humanStandardFemale as h,
  inchesToFeetExpression as i,
  kgToPounds as k
};
