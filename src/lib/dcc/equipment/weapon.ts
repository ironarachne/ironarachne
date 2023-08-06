"use strict";

import type DCCItem from "./item.js";

export default class DCCWeapon implements DCCItem {
  name: string;
  classification: string;
  damage: string;
  range: string;
  value: number;

  constructor(name: string, classification: string, range: string, damage: string, value: number) {
    this.name = name;
    this.classification = classification;
    this.range = range;
    this.damage = damage;
    this.value = value;
  }
}
