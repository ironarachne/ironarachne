import type Weapon from "$lib/weapons/weapon.js";

export default class ArmsManufacturer {
  name: string;
  description: string;
  models: Weapon[];

  constructor(name: string, description: string, models: Weapon[]) {
    this.name = name;
    this.description = description;
    this.models = models;
  }
}
