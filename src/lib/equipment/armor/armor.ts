"use strict";

import type WornItem from "../wornitem.js";

export default class Armor implements WornItem {
  name: string;
  description: string;
  areaOfBody: string;
  armorClass: number;
  value: number;
  quality: number;
  tags: string[];

  constructor(
    name: string,
    description: string,
    areaOfBody: string,
    armorClass: number,
    value: number,
    quality: number,
    tags: string[],
  ) {
    this.name = name;
    this.description = description;
    this.areaOfBody = areaOfBody;
    this.armorClass = armorClass;
    this.value = value;
    this.quality = quality;
    this.tags = tags;
  }
}
