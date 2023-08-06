"use strict";

import type Item from "../../equipment/item.js";

export default class Gem implements Item {
  name: string;
  description: string;
  value: number;
  quality: number;
  tags: string[];

  constructor() {
    this.name = "a gem";
    this.description = "a gem";
    this.value = 10;
    this.quality = 2;
    this.tags = ["gem"];
  }
}
