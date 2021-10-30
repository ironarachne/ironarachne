"use strict";

import * as Dice from "./dice";
import * as Measurements from "./measurements";
import random from "random";

export class AgeCategory {
  name: string;
  noun: string;
  minAge: number;
  maxAge: number;
  minHeight: number; // in cm
  maxHeight: number; // in cm
  minWeight: number; // in kg
  maxWeight: number; // in kg

  constructor(name: string, noun: string, minAge: number, maxAge: number, minHeight: number, minWeight: number) {
    this.name = name;
    this.noun = noun;
    this.minAge = minAge;
    this.maxAge = maxAge;
    this.minHeight = minHeight;
    this.maxHeight = Math.floor(minHeight * 1.2);
    this.minWeight = minWeight;
    this.maxWeight = Math.floor(minWeight * 1.2);
  }

  getHeightRange(): string {
    const metricHeightModifier = Math.max(this.maxHeight - this.minHeight, 4);
    const metric = this.minHeight + " + " + Dice.describeDice(Dice.simplify(Dice.rangeToDiceExpression(metricHeightModifier))) + " cm";
    const imperialHeightModifier = Math.max(Measurements.cmToInches(this.maxHeight - this.minHeight), 4);
    const imperial = Measurements.inchesToFeet(Measurements.cmToInches(this.minHeight)) + " + " + Dice.describeDice(Dice.simplify(Dice.rangeToDiceExpression(imperialHeightModifier))) + " in.";

    return `${metric} (${imperial})`;
  }

  getWeightRange(): string {
    const metricWeightModifier = Math.max(this.maxWeight - this.minWeight, 4);
    const metric = this.minWeight + " + " + Dice.describeDice(Dice.simplify(Dice.rangeToDiceExpression(metricWeightModifier))) + " kg";
    const imperialWeightModifier = Math.max(Measurements.kgToPounds(this.maxWeight - this.minWeight), 4);
    const imperial = Measurements.kgToPounds(this.minWeight) + " + " + Dice.describeDice(Dice.simplify(Dice.rangeToDiceExpression(imperialWeightModifier))) + " lb.";

    return `${metric} (${imperial})`;
  }

  randomAge(): number {
    return random.int(this.minAge, this.maxAge);
  }

  randomHeight(): number {
    return random.int(this.minHeight, this.maxHeight);
  }

  randomWeight(): number {
    return random.int(this.minWeight, this.maxWeight);
  }
}

export function getCategoryFromName(name: string, ageGroups: AgeCategory[]): AgeCategory {
  for (let i=0;i<ageGroups.length;i++) {
    if (ageGroups[i].name == name) {
      return ageGroups[i];
    }
  }
}

export function getHumanVariant(ageModifier: number, weightModifier: number, heightModifier: number): AgeCategory[] {
  let categories = humanStandardFemale();

  for (let i=0;i<categories.length;i++) {
    categories[i].minAge = Math.floor(categories[i].minAge * ageModifier);
    categories[i].maxAge = Math.ceil(categories[i].maxAge * ageModifier);
    categories[i].minHeight = Math.ceil(categories[i].minHeight * heightModifier);
    categories[i].maxHeight = Math.ceil(categories[i].maxHeight * heightModifier);
    categories[i].minWeight = Math.ceil(categories[i].minWeight * weightModifier);
    categories[i].maxWeight = Math.ceil(categories[i].maxWeight * weightModifier);
  }

  return categories;
}

export function humanStandardFemale(): AgeCategory[] {
  return [
    new AgeCategory(
      "infant",
      "baby girl",
      0,
      1,
      49,
      2,
    ),
    new AgeCategory(
      "toddler",
      "toddler",
      2,
      3,
      80,
      14,
    ),
    new AgeCategory(
      "young child",
      "young girl",
      4,
      6,
      115,
      19,
    ),
    new AgeCategory(
      "child",
      "girl",
      7,
      12,
      149,
      20,
    ),
    new AgeCategory(
      "young adult",
      "young woman",
      13,
      19,
      163,
      57,
    ),
    new AgeCategory(
      "adult",
      "woman",
      20,
      60,
      168,
      64,
    ),
    new AgeCategory(
      "elderly",
      "woman",
      61,
      100,
      165,
      60,
    ),
  ];
}

export function humanStandardMale(): AgeCategory[] {
  return [
    new AgeCategory(
      "infant",
      "baby boy",
      0,
      1,
      50,
      2,
    ),
    new AgeCategory(
      "toddler",
      "toddler",
      2,
      3,
      85,
      14,
    ),
    new AgeCategory(
      "young child",
      "young boy",
      4,
      6,
      115,
      20,
    ),
    new AgeCategory(
      "child",
      "boy",
      7,
      12,
      145,
      36,
    ),
    new AgeCategory(
      "young adult",
      "young man",
      13,
      19,
      176,
      68,
    ),
    new AgeCategory(
      "adult",
      "man",
      20,
      60,
      180,
      70,
    ),
    new AgeCategory(
      "elderly",
      "man",
      61,
      100,
      175,
      65,
    ),
  ];
}
