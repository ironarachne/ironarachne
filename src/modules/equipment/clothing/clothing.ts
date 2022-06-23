'use strict';

import type WornItem from '../wornitem';

export default class Clothing implements WornItem {
  name: string;
  description: string;
  areaOfBody: string;
  value: number;

  constructor(name: string, description: string, areaOfBody: string, value: number) {
    this.name = name;
    this.description = description;
    this.areaOfBody = areaOfBody;
    this.value = value;
  }
}
