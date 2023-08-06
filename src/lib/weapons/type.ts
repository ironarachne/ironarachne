import type WeaponComponent from "./component.js";
import type WeaponEffect from "./effect.js";

export default class WeaponType {
  name: string;
  bases: string[];
  cosmetics: WeaponComponent[];
  effects: WeaponEffect[];
  range: string;
  hands: number;
  damageType: string;

  constructor() {
    this.name = "";
    this.bases = [];
    this.cosmetics = [];
    this.effects = [];
    this.range = "";
    this.hands = 0;
    this.damageType = "";
  }
}
