'use strict';

import type Weapon from './weapon';

export default class MeleeWeapon implements Weapon {
  name: string;
  description: string;
  damage: string;
  hands: number;
  value: number;
  quality: number;
  tags: string[];

  constructor(
    name: string,
    description: string,
    damage: string,
    hands: number,
    value: number,
    quality: number,
    tags: string[],
  ) {
    this.name = name;
    this.description = description;
    this.damage = damage;
    this.hands = hands;
    this.value = value;
    this.quality = quality;
    this.tags = tags;
  }
}
