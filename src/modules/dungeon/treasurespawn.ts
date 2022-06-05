'use strict';

import type { Item } from '../equipment/item';

export default class TreasureSpawn {
  minRoom: number;
  maxRoom: number;
  treasure: Item;
  behavior: string;
  value: number; // in copper coins
  isCarried: boolean;
  isHidden: boolean;

  constructor() {
    this.minRoom = -1;
    this.maxRoom = -1;
    this.value = 1;
    this.isCarried = false;
    this.isHidden = false;
  }
}
