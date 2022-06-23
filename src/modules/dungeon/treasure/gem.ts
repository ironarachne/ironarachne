'use strict';

import type Item from '../../equipment/item';

export default class Gem implements Item {
  name: string;
  description: string;
  value: number;

  constructor() {
    this.name = 'a gem';
    this.description = 'a gem';
    this.value = 10;
  }
}
