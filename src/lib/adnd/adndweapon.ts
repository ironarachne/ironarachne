"use strict";

export default class ADNDWeapon {
  name: string;
  damageType: string; // bludgeoning, piercing, slashing
  damageSM: string; // dice expression
  damageL: string; // dice expression
  cost: number; // in copper pieces
  weight: number; // in pounds
  size: string; // small, medium, large
  speedFactor: number;
  category: string;
  usesAmmo: boolean;

  constructor(
    name: string,
    cost: number,
    weight: number,
    size: string,
    damageType: string,
    speedFactor: number,
    damageSM: string,
    damageL: string,
    category: string,
    usesAmmo: boolean = false,
  ) {
    this.name = name;
    this.damageType = damageType;
    this.damageSM = damageSM;
    this.damageL = damageL;
    this.cost = cost;
    this.weight = weight;
    this.size = size;
    this.speedFactor = speedFactor;
    this.category = category;
    this.usesAmmo = usesAmmo;
  }
}
