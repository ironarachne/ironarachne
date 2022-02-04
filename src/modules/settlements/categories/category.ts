'use strict';

import * as RND from '../../random';

import random from 'random';

export default class SettlementCategory {
  name: string;
  minSize: number;
  maxSize: number;
  sizeClass: string;
  possibleDescriptions: string[];

  constructor() {
    this.name = '';
    this.minSize = 0;
    this.maxSize = 0;
    this.sizeClass = '';
    this.possibleDescriptions = [];
  }

  randomDescription(): string {
    let description = RND.item(this.possibleDescriptions);
    return description;
  }

  randomPopulation(): number {
    return random.int(this.minSize, this.maxSize);
  }
}
