"use strict";

import * as Item from "../item";

export class Component implements Item.Item {
  name: string;
  description: string;
  descriptor: string;
  category: string;
  subType: string;
  value: number;

  constructor(name: string, description: string, descriptor: string, category: string, subType: string, value: number) {
    this.name = name;
    this.description = description;
    this.descriptor = descriptor;
    this.category = category;
    this.subType = subType;
    this.value = value;
  }
}
