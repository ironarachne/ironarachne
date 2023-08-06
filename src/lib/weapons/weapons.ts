import WeaponComponent from "./component.js";
import WeaponEffect from "./effect.js";
import WeaponType from "./type.js";
import Weapon from "./weapon.js";

export function newWeapon(
  name: string,
  maker: string,
  damage: string,
  effects: string[],
  description: string,
): Weapon {
  let weapon = new Weapon();
  weapon.name = name;
  weapon.maker = maker;
  weapon.damage = damage;
  weapon.effects = effects;
  weapon.description = description;

  return weapon;
}

export function newWeaponEffect(name: string, options: string[]): WeaponEffect {
  let effect = new WeaponEffect();
  effect.name = name;
  effect.options = options;

  return effect;
}

export function newWeaponComponent(name: string, options: string[]): WeaponComponent {
  let component = new WeaponComponent();
  component.name = name;
  component.options = options;

  return component;
}

export function newWeaponType(
  name: string,
  bases: string[],
  cosmetics: WeaponComponent[],
  effects: WeaponEffect[],
  range: string,
  hands: number,
  damageType: string,
): WeaponType {
  let weaponType = new WeaponType();
  weaponType.name = name;
  weaponType.bases = bases;
  weaponType.cosmetics = cosmetics;
  weaponType.effects = effects;
  weaponType.range = range;
  weaponType.hands = hands;
  weaponType.damageType = damageType;

  return weaponType;
}
