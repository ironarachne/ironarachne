import type { RNG } from "@ironarachne/rng";
import type { WeaponType } from "./weapons";

export default class WeaponGeneratorConfig {
  weaponTypes: WeaponType[];
  rng: RNG;

  constructor(rng: RNG) {
    this.weaponTypes = [];
    this.rng = rng;
  }
}
