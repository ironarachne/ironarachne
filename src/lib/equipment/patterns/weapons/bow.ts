import * as RND from "@ironarachne/rng";
import * as Words from "@ironarachne/words";
import Component from "../../components/component.js";
import * as Components from "../../components/components.js";
import MeleeWeapon from "../../weapons/melee.js";
import RangedWeapon from "../../weapons/ranged.js";
import type Pattern from "../pattern.js";

export default class BowPattern implements Pattern {
  name: string;
  tags: string[];
  hands: number;
  baseValue: number;
  damage: string;

  constructor(name: string, hands: number, damage: string, value: number) {
    this.name = name;
    this.tags = [name, "bow", "ranged", "martial weapon", "weapon"];
    this.hands = hands;
    this.damage = damage;
    this.baseValue = value;
  }

  complete(componentOptions: Component[], quality: number): MeleeWeapon {
    let body = RND.item(Components.withCategory("soft wood", componentOptions));
    let handle = RND.item(Components.withCategory("leather", componentOptions));

    let cosmeticBody = RND.item(["carved", "heavy", "light", "simple"]);

    let cosmeticHandle = RND.item(["short", "long", "comfortable"]);

    let description = `${Words.article(this.name)} ${this.name} with `;

    description += RND.item([
      `${Words.article(body.descriptor)} ${body.descriptor} body`,
      `${Words.article(cosmeticBody)} ${cosmeticBody} ${body.descriptor} body`,
    ]);

    description += RND.item([
      ` and ${Words.article(handle.descriptor)} ${handle.descriptor} wrapped grip`,
      ` and ${Words.article(cosmeticHandle)} ${cosmeticHandle} ${handle.descriptor} wrapped grip`,
    ]);

    if (quality > 1) {
      description += RND.item([" and gilt highlights"]);
    }

    let name = `${body.descriptor} ${this.name}`;

    let value = this.baseValue + body.value + handle.value;

    let tags = [name, this.name, "bow", "ranged", "martial weapon", "weapon"];

    return new RangedWeapon(
      name,
      description,
      this.damage,
      80,
      320,
      "arrow",
      this.hands,
      value,
      quality,
      tags,
    );
  }
}
