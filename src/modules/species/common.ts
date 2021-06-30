"use strict";

import * as Age from "../age";
import * as Dice from "../dice";
import * as Measurement from "../measurements";
import {AgeCategory} from "../age";

export class Species {
  name: string;
  pluralName: string;
  adjective: string;
  weight: number;
  maxAge: number;
  heightScale: number;
  weightScale: number;
  traits: AppearanceTrait[];
  ageGroups: AgeCategory[];
  constructor(name: string, pluralName: string, adjective: string, weight: number, maxAge: number, heightScale: number, weightScale: number, traits: AppearanceTrait[]) {
    this.name = name;
    this.pluralName = pluralName;
    this.adjective = adjective;
    this.weight = weight;
    this.maxAge = maxAge;
    this.heightScale = heightScale;
    this.weightScale = weightScale;
    this.traits = traits;
    this.ageGroups = [];
  }
}

export class AppearanceTrait {
  name: string;
  descriptionTemplate: string;
  options: string[];
  description: string;

  constructor(name: string, descriptionTemplate: string, options: string[]) {
    this.name = name;
    this.descriptionTemplate = descriptionTemplate;
    this.options = options;
    this.description = "";
  }
}

export function calculateAgeCategories(species: Species) {
  const ageScale = species.maxAge / 100;
  const heightScale = species.heightScale;
  const weightScale = species.weightScale;

  const categories = Age.categories();

  species.ageGroups = [];

  for (let i = 0; i < categories.length; i++) {
    categories[i].minAge = Math.ceil(categories[i].minAge * ageScale);
    categories[i].maxAge = Math.ceil(categories[i].maxAge * ageScale);
    categories[i].femaleHeightMetric = getHeightMetric(heightScale, categories[i], "female");
    categories[i].femaleHeightImperial = getHeightImperial(heightScale, categories[i], "female");
    categories[i].maleHeightMetric = getHeightMetric(heightScale, categories[i], "male");
    categories[i].maleHeightImperial = getHeightImperial(heightScale, categories[i], "male");
    categories[i].femaleWeightMetric = getWeightMetric(weightScale, categories[i], "female");
    categories[i].femaleWeightImperial = getWeightImperial(weightScale, categories[i], "female");
    categories[i].maleWeightMetric = getWeightMetric(weightScale, categories[i], "male");
    categories[i].maleWeightImperial = getWeightImperial(weightScale, categories[i], "male");
    species.ageGroups.push(categories[i]);
  }

  return species;
}

export function getHeightImperial(heightScale: number, ageCategory: AgeCategory, gender: string) {
  let result = "";

  let base = Measurement.cmToInches(ageCategory.femaleHeightBase);
  let modifier = Measurement.cmToInches(ageCategory.femaleHeightModifier);

  if (gender == "male") {
    base = Measurement.cmToInches(ageCategory.maleHeightBase);
    modifier = Measurement.cmToInches(ageCategory.maleHeightModifier);
  }

  base = Math.floor(base * heightScale);
  modifier = Math.floor(modifier * heightScale);

  result = base + "+" + Dice.describeDice(Dice.simplify(Dice.rangeToDiceExpression(modifier)));

  return result;
}

export function getHeightMetric(heightScale: number, ageCategory: AgeCategory, gender: string) {
  let result = "";

  let base = ageCategory.femaleHeightBase;
  let modifier = ageCategory.femaleHeightModifier;

  if (gender == "male") {
    base = ageCategory.maleHeightBase;
    modifier = ageCategory.maleHeightModifier;
  }

  base = Math.floor(base * heightScale);
  modifier = Math.floor(modifier * heightScale);

  result = base + "+" + Dice.describeDice(Dice.simplify(Dice.rangeToDiceExpression(modifier)));

  return result;
}

export function getWeightImperial(weightScale: number, ageCategory: AgeCategory, gender: string) {
  let result = "";

  let base = Measurement.kgToPounds(ageCategory.femaleWeightBase);
  let modifier = Measurement.kgToPounds(ageCategory.femaleWeightModifier);

  if (gender == "male") {
    base = Measurement.kgToPounds(ageCategory.maleWeightBase);
    modifier = Measurement.kgToPounds(ageCategory.maleWeightModifier);
  }

  base = Math.floor(base * weightScale);
  modifier = Math.floor(modifier * weightScale);

  result = base + "+" + Dice.describeDice(Dice.simplify(Dice.rangeToDiceExpression(modifier)));

  return result;
}

export function getWeightMetric(weightScale: number, ageCategory: AgeCategory, gender: string) {
  let result = "";

  let base = ageCategory.femaleWeightBase;
  let modifier = ageCategory.femaleWeightModifier;

  if (gender == "male") {
    base = ageCategory.maleWeightBase;
    modifier = ageCategory.maleWeightModifier;
  }

  base = Math.floor(base * weightScale);
  modifier = Math.floor(modifier * weightScale);

  result = base + "+" + Dice.describeDice(Dice.simplify(Dice.rangeToDiceExpression(modifier)));

  return result;
}
