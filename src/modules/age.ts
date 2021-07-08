"use strict";

export class AgeCategory {
  name: string;
  minAge: number;
  maxAge: number;
  femaleHeightBase: number;
  maleHeightBase: number;
  femaleHeightModifier: number;
  maleHeightModifier: number;
  femaleWeightBase: number;
  maleWeightBase: number;
  femaleWeightModifier: number;
  maleWeightModifier: number;
  femaleHeightImperial: string;
  maleHeightImperial: string;
  femaleHeightMetric: string;
  maleHeightMetric: string;
  femaleWeightImperial: string;
  maleWeightImperial: string;
  femaleWeightMetric: string;
  maleWeightMetric: string;

  constructor(name: string, minAge: number, maxAge: number, femaleHeightBase: number, maleHeightBase: number, femaleHeightModifier: number, maleHeightModifier: number, femaleWeightBase: number, maleWeightBase: number, femaleWeightModifier: number, maleWeightModifier: number) {
    this.name = name;
    this.minAge = minAge;
    this.maxAge = maxAge;
    this.femaleHeightBase = femaleHeightBase;
    this.maleHeightBase = maleHeightBase;
    this.femaleHeightModifier = femaleHeightModifier;
    this.maleHeightModifier = maleHeightModifier;
    this.femaleWeightBase = femaleWeightBase;
    this.maleWeightBase = maleWeightBase;
    this.femaleWeightModifier = femaleWeightModifier;
    this.maleWeightModifier = maleWeightModifier;
    this.femaleHeightImperial = "";
    this.maleHeightImperial = "";
    this.femaleHeightMetric = "";
    this.maleHeightMetric = "";
    this.femaleWeightImperial = "";
    this.maleWeightImperial = "";
    this.femaleWeightMetric = "";
    this.maleWeightMetric = "";
  }
}

export function categories() {
  return [
    new AgeCategory(
      "infant",
      0,
      1,
      50,
      50,
      20,
      20,
      6,
      7,
      4,
      4,
    ),
    new AgeCategory(
      "child",
      2,
      12,
      100,
      100,
      40,
      40,
      20,
      20,
      20,
      20,
    ),
    new AgeCategory(
      "young adult",
      13,
      19,
      152,
      147,
      10,
      40,
      46,
      56,
      10,
      10,
    ),
    new AgeCategory(
      "adult",
      20,
      60,
      152,
      163,
      20,
      20,
      46,
      70,
      20,
      40,
    ),
    new AgeCategory(
      "elderly",
      61,
      100,
      152,
      163,
      20,
      20,
      46,
      70,
      20,
      40,
    ),
  ];
}
