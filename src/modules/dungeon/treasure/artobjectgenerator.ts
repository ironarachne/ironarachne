'use strict';

import ArtObject from './artobject';
import random from 'random';
import * as RND from '../../random';
import * as Currency from '../../currency/currency';
import * as Words from '../../words';
import type TreasureGenerator from './treasuregenerator';

export default class ArtObjectGenerator implements TreasureGenerator {
  minValue: number;
  maxValue: number;
  count: number;

  constructor(min: number, max: number, count: number) {
    this.minValue = min;
    this.maxValue = max;
    this.count = count;
  }

  generate(): ArtObject[] {
    let objects = [];

    for (let i = 0; i < this.count; i++) {
      let object = new ArtObject();

      object.value = random.int(this.minValue, this.maxValue);
      object.name = getRandomArtObject();

      let worth = Currency.valueToCoins(object.value, false, false, false);

      object.description = `${Words.article(object.name)} ${object.name} worth ${worth}`;

      objects.push(object);
    }

    return objects;
  }
}

function getRandomArtObject(): string {
  return RND.item(['figurine', 'carving', 'painting']);
}
