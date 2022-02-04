'use strict';

export interface Item {
  name: string;
  description: string;
  value: number;
}

export interface WornItem extends Item {
  areaOfBody: string;
}

export interface Weapon extends Item {
  damage: string;
  hands: number;
}

export class Armor implements WornItem {
  name: string;
  description: string;
  areaOfBody: string;
  armorClass: number;
  value: number;

  constructor(
    name: string,
    description: string,
    areaOfBody: string,
    armorClass: number,
    value: number,
  ) {
    this.name = name;
    this.description = description;
    this.areaOfBody = areaOfBody;
    this.armorClass = armorClass;
    this.value = value;
  }
}

export class Clothing implements WornItem {
  name: string;
  description: string;
  areaOfBody: string;
  value: number;

  constructor(name: string, description: string, areaOfBody: string, value: number) {
    this.name = name;
    this.description = description;
    this.areaOfBody = areaOfBody;
    this.value = value;
  }
}

export class MeleeWeapon implements Weapon {
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

export class RangedWeapon implements Weapon {
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
