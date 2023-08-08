"use strict";

import random from "random";
import * as Dice from "../dice.js";
import * as Measurements from "../measurements.js";

export default class AgeCategory {
  name: string;
  noun: string;
  minAge: number;
  maxAge: number;
  minHeight: number; // in cm
  maxHeight: number; // in cm
  minWeight: number; // in kg
  maxWeight: number; // in kg
  commonality: number;

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

  getDescription(): string {
    return `Name: ${this.name}, Noun: ${this.noun}, Age: ${this.minAge} - ${this.maxAge}, Height: ${this.minHeight} - ${this.maxHeight}, Weight: ${this.minWeight} - ${this.maxWeight}`;
  }

  getHeightRange(): string {
    const metricHeightModifier = Math.max(this.maxHeight - this.minHeight, 4);
    const metric = this.minHeight
      + " + "
      + Dice.describeDice(Dice.simplify(Dice.rangeToDiceExpression(metricHeightModifier)))
      + " cm";
    const imperialHeightModifier = Math.max(
      Measurements.cmToInches(this.maxHeight - this.minHeight),
      4,
    );
    const imperial = Measurements.inchesToFeetExpression(Measurements.cmToInches(this.minHeight))
      + " + "
      + Dice.describeDice(Dice.simplify(Dice.rangeToDiceExpression(imperialHeightModifier)))
      + " in.";

    return `${metric} (${imperial})`;
  }

  getWeightRange(): string {
    const metricWeightModifier = Math.max(this.maxWeight - this.minWeight, 4);
    const metric = this.minWeight
      + " + "
      + Dice.describeDice(Dice.simplify(Dice.rangeToDiceExpression(metricWeightModifier)))
      + " kg";
    const imperialWeightModifier = Math.max(
      Math.round(Measurements.kgToPounds(this.maxWeight - this.minWeight)),
      4,
    );
    const imperial = Math.round(Measurements.kgToPounds(this.minWeight))
      + " + "
      + Dice.describeDice(Dice.simplify(Dice.rangeToDiceExpression(imperialWeightModifier)))
      + " lb.";

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
