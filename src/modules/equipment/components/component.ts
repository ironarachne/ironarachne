'use strict';

import type Item from '../item';

export default class Component implements Item {
  name: string;
  description: string;
  descriptor: string;
  category: string;
  subType: string;
  value: number;

  constructor(
    name: string,
    description: string,
    descriptor: string,
    category: string,
    subType: string,
    value: number,
  ) {
    this.name = name;
    this.description = description;
    this.descriptor = descriptor;
    this.category = category;
    this.subType = subType;
    this.value = value;
  }
}
