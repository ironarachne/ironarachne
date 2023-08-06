"use strict";

import type Item from "../item.js";

export default class Component implements Item {
  name: string;
  description: string;
  descriptor: string;
  category: string;
  subType: string;
  value: number;
  quality: number;
  tags: string[];

  constructor(
    name: string,
    description: string,
    descriptor: string,
    category: string,
    subType: string,
    value: number,
    quality: number,
    tags: string[],
  ) {
    this.name = name;
    this.description = description;
    this.descriptor = descriptor;
    this.category = category;
    this.subType = subType;
    this.value = value;
    this.quality = quality;
    this.tags = tags;
  }
}
