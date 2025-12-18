import * as MUN from "@ironarachne/made-up-names";
import * as RNG from "@ironarachne/rng";
import * as Words from "@ironarachne/words";
import WeaponGeneratorConfig from "./config";
import type { WeaponType, WeaponComponent, Weapon } from "./weapons";

export default class WeaponGenerator {
  config: WeaponGeneratorConfig;
  rng: RNG.RNG;

  constructor(rng: RNG.RNG = new RNG.RNG(Date.now())) {
    this.config = new WeaponGeneratorConfig(rng);
    this.rng = rng;
  }

  describe(weapon: Weapon, weaponType: WeaponType): string {
    let description = `${this.rng.item(weaponType.bases)} `;

    description += `${Words.arrayToPhrase(weapon.effects)} and has `;
    description += `${Words.arrayToPhrase(weapon.cosmetics)}.`;

    return description;
  }

  generate(): Weapon {
    const weaponType = this.rng.item(this.config.weaponTypes);
    const nameGenerator = MUN.getModelNumberNameGenerator(this.rng);
    const weapon: Weapon = {
      name: `${nameGenerator.generate(1)[0]} ${weaponType.name}`,
      maker: "",
      damage: weaponType.damageType,
      cosmetics: this.randomCosmetics(weaponType),
      effects: this.randomEffects(weaponType),
      description: "",
    };

    weapon.description = this.describe(weapon, weaponType);

    return weapon;
  }

  randomCosmetics(weaponType: WeaponType): string[] {
    const cosmetics: string[] = [];

    const numberOfCosmetics = this.rng.int(1, 3);

    let cosmeticList: string[] = [];

    for (const cosmetic of weaponType.cosmetics) {
      cosmeticList.push(cosmetic.name);
    }

    cosmeticList = this.rng.shuffle(cosmeticList);

    for (let i = 0; i < numberOfCosmetics; i++) {
      const cosmetic = cosmeticList.pop();
      let cosmeticComponent: WeaponComponent | undefined;

      for (const c of weaponType.cosmetics) {
        if (c.name === cosmetic) {
          cosmeticComponent = c;
        }
      }

      if (cosmeticComponent !== undefined) {
        cosmetics.push(this.rng.item(cosmeticComponent.options));
      }
    }

    return cosmetics;
  }

  randomEffects(weaponType: WeaponType): string[] {
    const effects: string[] = [];

    const numberOfEffects = this.rng.int(1, 3);

    let effectList: string[] = [];

    for (const effect of weaponType.effects) {
      effectList.push(effect.name);
    }

    effectList = this.rng.shuffle(effectList);

    for (let i = 0; i < numberOfEffects; i++) {
      const effect = effectList.pop();

      let effectComponent: WeaponComponent | undefined;

      for (const e of weaponType.effects) {
        if (e.name === effect) {
          effectComponent = e;
        }
      }

      if (effectComponent !== undefined) {
        effects.push(this.rng.item(effectComponent.options));
      }
    }

    return effects;
  }
}
