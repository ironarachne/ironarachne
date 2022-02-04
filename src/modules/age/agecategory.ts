'use strict';

import * as Dice from '../dice';
import * as Measurements from '../measurements';
import random from 'random';

export default class AgeCategory {
  name: string;
  noun: string;
  minAge: number;
  maxAge: number;
  minHeight: number; // in cm
  maxHeight: number; // in cm
  minWeight: number; // in kg
  maxWeight: number; // in kg

  constructor(
    name: string,
    noun: string,
    minAge: number,
    maxAge: number,
    minHeight: number,
    minWeight: number,
  ) {
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
    const metric =
      this.minHeight +
      ' + ' +
      Dice.describeDice(Dice.simplify(Dice.rangeToDiceExpression(metricHeightModifier))) +
      ' cm';
    const imperialHeightModifier = Math.max(
      Measurements.cmToInches(this.maxHeight - this.minHeight),
      4,
    );
    const imperial =
      Measurements.inchesToFeet(Measurements.cmToInches(this.minHeight)) +
      ' + ' +
      Dice.describeDice(Dice.simplify(Dice.rangeToDiceExpression(imperialHeightModifier))) +
      ' in.';

    return `${metric} (${imperial})`;
  }

  getWeightRange(): string {
    const metricWeightModifier = Math.max(this.maxWeight - this.minWeight, 4);
    const metric =
      this.minWeight +
      ' + ' +
      Dice.describeDice(Dice.simplify(Dice.rangeToDiceExpression(metricWeightModifier))) +
      ' kg';
    const imperialWeightModifier = Math.max(
      Measurements.kgToPounds(this.maxWeight - this.minWeight),
      4,
    );
    const imperial =
      Measurements.kgToPounds(this.minWeight) +
      ' + ' +
      Dice.describeDice(Dice.simplify(Dice.rangeToDiceExpression(imperialWeightModifier))) +
      ' lb.';

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
