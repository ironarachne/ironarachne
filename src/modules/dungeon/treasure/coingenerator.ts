'use strict';

import BagOfCoins from './bagofcoins';
import * as Currency from '../../currency/currency';
import random from 'random';

export default class CoinGenerator {
  minValue: number;
  maxValue: number;

  constructor(min: number, max: number) {
    this.minValue = min;
    this.maxValue = max;
  }

  generate(): BagOfCoins {
    let bag = new BagOfCoins();

    bag.value = random.int(this.minValue, this.maxValue);

    bag.description =
      'a bag of coins containing ' + Currency.valueToCoins(bag.value, false, false, false);

    return bag;
  }
}
