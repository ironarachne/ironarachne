import WeaponComponent from "./component";
import WeaponEffect from "./effect";

export default class WeaponType {
  name: string;
  bases: string[];
  cosmetics: WeaponComponent[];
  effects: WeaponEffect[];
  range: string;
  hands: number;
  damageType: string;

  constructor(name: string, bases: string[], cosmetics: WeaponComponent[], effects: WeaponEffect[], range: string, hands: number, damageType: string) {
    this.name = name;
    this.bases = bases;
    this.cosmetics = cosmetics;
    this.effects = effects;
    this.range = range;
    this.hands = hands;
    this.damageType = damageType;
  }
}
