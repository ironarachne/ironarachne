"use strict";

import type Weapon from "./weapon.js";

export default class RangedWeapon implements Weapon {
  name: string;
  description: string;
  damage: string;
  shortRange: number;
  longRange: number;
  ammunitionType: string;
  hands: number;
  value: number;
  quality: number;
  tags: string[];

  constructor(
    name: string,
    description: string,
    damage: string,
    shortRange: number,
    longRange: number,
    ammunitionType: string,
    hands: number,
    value: number,
    quality: number,
    tags: string[],
  ) {
    this.name = name;
    this.description = description;
    this.damage = damage;
    this.shortRange = shortRange;
    this.longRange = longRange;
    this.ammunitionType = ammunitionType;
    this.hands = hands;
    this.value = value;
    this.quality = quality;
    this.tags = tags;
  }
}
