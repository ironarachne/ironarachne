import type WeaponType from "./type";

export default class WeaponGeneratorConfig {
  weaponTypes: WeaponType[];

  constructor() {
    this.weaponTypes = [];
  }
}
