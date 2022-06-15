'use strict';

import type WornItem from '../wornitem';

export default class Armor implements WornItem {
  name: string;
  description: string;
  areaOfBody: string;
  armorClass: number;
  value: number;

  constructor(
    name: string,
    description: string,
    areaOfBody: string,
    armorClass: number,
    value: number,
  ) {
    this.name = name;
    this.description = description;
    this.areaOfBody = areaOfBody;
    this.armorClass = armorClass;
    this.value = value;
  }
}
