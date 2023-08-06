import * as MUN from "@ironarachne/made-up-names";
import * as RND from "@ironarachne/rng";
import * as Words from "@ironarachne/words";
import random from "random";
import WeaponGeneratorConfig from "./config";
import type WeaponType from "./type";
import Weapon from "./weapon";

export default class WeaponGenerator {
  config: WeaponGeneratorConfig;

  constructor() {
    this.config = new WeaponGeneratorConfig();
  }

  generate(): Weapon {
    let weapon = new Weapon();
    let weaponType = RND.item(this.config.weaponTypes);

    weapon.damage = weaponType.damageType;
    weapon.effects = randomEffects(weaponType);
    weapon.cosmetics = randomCosmetics(weaponType);
    weapon.name = MUN.modelNumber() + " " + weaponType.name;
    weapon.description = describe(weapon, weaponType);

    return weapon;
  }
}

function describe(weapon: Weapon, weaponType: WeaponType): string {
  let description = RND.item(weaponType.bases) + " has ";

  description += Words.arrayToPhrase(weapon.effects) + " and ";
  description += Words.arrayToPhrase(weapon.cosmetics) + ". It ";
  description += weapon.effects + ".";

  return description;
}

function randomCosmetics(weaponType: WeaponType): string[] {
  let cosmetics: string[] = [];

  const numberOfCosmetics = random.int(1, 3);

  let cosmeticList: string[] = [];

  for (const cosmetic of weaponType.cosmetics) {
    cosmeticList.push(cosmetic.name);
  }

  cosmeticList = RND.shuffle(cosmeticList);

  for (let i = 0; i < numberOfCosmetics; i++) {
    let cosmetic = cosmeticList.pop();
    let cosmeticComponent;

    for (const c of weaponType.cosmetics) {
      if (c.name === cosmetic) {
        cosmeticComponent = c;
      }
    }

    if (cosmeticComponent !== undefined) {
      cosmetics.push(RND.item(cosmeticComponent.options));
    }
  }

  return cosmetics;
}

function randomEffects(weaponType: WeaponType): string[] {
  let effects: string[] = [];

  const numberOfEffects = random.int(1, 3);

  let effectList: string[] = [];

  for (const effect of weaponType.effects) {
    effectList.push(effect.name);
  }

  effectList = RND.shuffle(effectList);

  for (let i = 0; i < numberOfEffects; i++) {
    let effect = effectList.pop();

    let effectComponent;

    for (const e of weaponType.effects) {
      if (e.name === effect) {
        effectComponent = e;
      }
    }

    if (effectComponent !== undefined) {
      effects.push(RND.item(effectComponent.options));
    }
  }

  return effects;
}
