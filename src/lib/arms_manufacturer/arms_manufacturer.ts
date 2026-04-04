import type { Weapon } from '$lib/weapons/weapons';

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
