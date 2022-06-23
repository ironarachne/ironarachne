'use strict';

import type Item from '../../equipment/item';

export default class BagOfCoins implements Item {
  name: string;
  description: string;
  value: number;

  constructor() {
    this.name = 'a bag of coins';
    this.description = 'a bag of coins';
    this.value = 10;
  }
}
