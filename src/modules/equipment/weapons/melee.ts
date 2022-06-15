'use strict';

import type Weapon from './weapon';

export default class MeleeWeapon implements Weapon {
  name: string;
  description: string;
  damage: string;
  hands: number;
  value: number;

  constructor(name: string, description: string, damage: string, hands: number, value: number) {
    this.name = name;
    this.description = description;
    this.damage = damage;
    this.hands = hands;
    this.value = value;
  }
}
