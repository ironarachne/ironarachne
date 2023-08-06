"use strict";

import type WornItem from "../wornitem.js";

export default class Clothing implements WornItem {
  name: string;
  description: string;
  areaOfBody: string;
  value: number;
  quality: number;
  tags: string[];

  constructor(
    name: string,
    description: string,
    areaOfBody: string,
    value: number,
    quality: number,
    tags: string[],
  ) {
    this.name = name;
    this.description = description;
    this.areaOfBody = areaOfBody;
    this.value = value;
    this.quality = quality;
    this.tags = tags;
  }
}
