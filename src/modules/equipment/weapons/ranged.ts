'use strict';

import type Weapon from './weapon';

export default class RangedWeapon implements Weapon {
  name: string;
  description: string;
  damage: string;
  shortRange: number;
  longRange: number;
  ammunitionType: string;
  hands: number;
  value: number;

  constructor(
    name: string,
    description: string,
    damage: string,
    shortRange: number,
    longRange: number,
    ammunitionType: string,
    hands: number,
    value: number,
  ) {
    this.name = name;
    this.description = description;
    this.damage = damage;
    this.shortRange = shortRange;
    this.longRange = longRange;
    this.ammunitionType = ammunitionType;
    this.hands = hands;
    this.value = value;
  }
}
