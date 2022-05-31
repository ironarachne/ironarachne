'use strict';

import type { Item } from '../equipment/item';
import random from 'random';
import * as RND from '../random';
import * as Currency from '../currency/currency';

export class Key implements Item {
  name: string;
  description: string;
  value: number;
}

export class BagOfCoins implements Item {
  name: string;
  description: string;
  value: number;

  constructor() {
    this.name = 'a bag of coins';
    this.description = 'a bag of coins';
    this.value = 10;
  }
}

export class CoinGenerator {
  minValue: number;
  maxValue: number;

  constructor(min: number, max: number) {
    this.minValue = min;
    this.maxValue = max;
  }

  generate(): BagOfCoins {
    let bag = new BagOfCoins();

    bag.value = random.int(this.minValue, this.maxValue);

    bag.description = 'a bag of coins containing ' + Currency.valueToCoins(bag.value, false, false);

    return bag;
  }
}

export function common(): Item[] {
  let items = [];
  let amount = random.int(1, 100);
  let possibleItems = [new CoinGenerator(10, 50)];

  for (let i = 0; i < amount; i++) {
    let t = RND.item(possibleItems);
    items.push(t.generate());
  }

  return items;
}

export function uncommon(): Item[] {
  let items = [];
  let amount = random.int(1, 100);
  let possibleItems = [new CoinGenerator(100, 500)];

  for (let i = 0; i < amount; i++) {
    let t = RND.item(possibleItems);
    items.push(t.generate());
  }

  return items;
}

export function rare(): Item[] {
  let items = [];
  let amount = random.int(1, 100);
  let possibleItems = [new CoinGenerator(1000, 5000)];

  for (let i = 0; i < amount; i++) {
    let t = RND.item(possibleItems);
    items.push(t.generate());
  }

  return items;
}
