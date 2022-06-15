'use strict';

import type Item from '../../equipment/item';

export default class ArtObject implements Item {
  name: string;
  description: string;
  value: number;

  constructor() {
    this.name = 'an art object';
    this.description = 'an art object';
    this.value = 10;
  }
}
