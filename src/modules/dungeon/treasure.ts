'use strict';

import type { Item } from '../equipment/item';
import random from 'random';
import * as RND from '../random';
import GemGenerator from './treasure/gemgenerator';
import CoinGenerator from './treasure/coingenerator';

export class Key implements Item {
  name: string;
  description: string;
  value: number;
}

export function common(): Item[] {
  let items = [];
  let amount = random.int(1, 100);
  let possibleItems = [new CoinGenerator(10, 50), new GemGenerator(1000, 5000)];

  for (let i = 0; i < amount; i++) {
    let t = RND.item(possibleItems);
    items.push(t.generate());
  }

  return items;
}

export function uncommon(): Item[] {
  let items = [];
  let amount = random.int(1, 100);
  let possibleItems = [new CoinGenerator(100, 500), new GemGenerator(5000, 501000)];

  for (let i = 0; i < amount; i++) {
    let t = RND.item(possibleItems);
    items.push(t.generate());
  }

  return items;
}

export function rare(): Item[] {
  let items = [];
  let amount = random.int(1, 100);
  let possibleItems = [new CoinGenerator(1000, 5000), new GemGenerator(501, 6000)];

  for (let i = 0; i < amount; i++) {
    let t = RND.item(possibleItems);
    items.push(t.generate());
  }

  return items;
}
