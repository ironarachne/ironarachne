import * as RND from "@ironarachne/rng";
import * as Words from "@ironarachne/words";
import Component from "../../components/component.js";
import * as Components from "../../components/components.js";
import MeleeWeapon from "../../weapons/melee.js";
import type Pattern from "../pattern.js";

export default class ClubPattern implements Pattern {
  name: string;
  tags: string[];
  hands: number;
  baseValue: number;
  damage: string;

  constructor(name: string, hands: number, damage: string, value: number) {
    this.name = name;
    this.tags = [name, "club", "melee", "simple weapon", "weapon"];
    this.hands = hands;
    this.damage = damage;
    this.baseValue = value;
  }

  complete(componentOptions: Component[], quality: number): MeleeWeapon {
    let body = RND.item(Components.withCategory("wood", componentOptions));
    let handle = RND.item(Components.withCategory("leather", componentOptions));

    let cosmeticBody = RND.item(["carved", "spiked", "heavy", "bulbous", "square"]);

    let cosmeticHandle = RND.item(["short", "long", "comfortable", "broad"]);

    let description = `${Words.article(this.name)} ${this.name} with `;

    description += RND.item([
      `${Words.article(body.descriptor)} ${body.descriptor} body`,
      `${Words.article(cosmeticBody)} ${cosmeticBody} ${body.descriptor} body`,
    ]);

    description += RND.item([
      ` and ${Words.article(handle.descriptor)} ${handle.descriptor} wrapped handle`,
      ` and ${Words.article(cosmeticHandle)} ${cosmeticHandle} ${handle.descriptor} wrapped handle`,
    ]);

    let name = `${body.descriptor} ${this.name}`;

    let value = this.baseValue + body.value + handle.value;

    let tags = [name, this.name, "club", "melee", "simple weapon", "weapon"];

    return new MeleeWeapon(name, description, this.damage, this.hands, value, quality, tags);
  }
}
