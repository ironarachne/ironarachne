"use strict";

import * as RND from "@ironarachne/rng";
import * as Words from "@ironarachne/words";
import random from "random";
import Component from "../../components/component.js";
import * as Components from "../../components/components.js";
import MeleeWeapon from "../../weapons/melee.js";
import type Pattern from "../pattern.js";

export default class KnifePattern implements Pattern {
  name: string;
  tags: string[];
  hands: number;
  baseValue: number;
  damage: string;

  constructor(name: string, hands: number, damage: string, value: number) {
    this.name = name;
    this.tags = [name, "knife", "melee", "simple weapon", "weapon"];
    this.hands = hands;
    this.damage = damage;
    this.baseValue = value;
  }

  complete(componentOptions: Component[], quality: number): MeleeWeapon {
    let blade = RND.item(Components.withCategory("hard metal", componentOptions));
    let hilt = RND.item(Components.withCategory("hard metal", componentOptions));
    let handle = RND.item(Components.withCategory("wood", componentOptions));

    let value = this.baseValue + blade.value + hilt.value + handle.value;

    let cosmeticBlade = RND.item([
      "serrated",
      "recently sharpened",
      "curved",
      "straight",
      "single-edged",
      "wide",
      "grooved",
    ]);

    let cosmeticHandle = RND.item(["carved", "padded", "embossed"]);

    let cosmeticHilt = RND.item(["gem-studded", "spiked", "curved", "inlaid"]);

    if (value < 2000) {
      cosmeticBlade = RND.item(["simple", "straight", "worn"]);

      cosmeticHandle = RND.item(["rough", "worn"]);

      cosmeticHilt = RND.item(["simple", "unadorned", "straight"]);
    }

    let description = `${Words.article(this.name)} ${this.name} with `;

    description += RND.item([
      `${Words.article(blade.descriptor)} ${blade.descriptor} blade,`,
      `${Words.article(cosmeticBlade)} ${cosmeticBlade} ${blade.descriptor} blade,`,
    ]);

    description += RND.item([
      ` ${hilt.descriptor} hilt,`,
      ` ${cosmeticHilt} ${hilt.descriptor} hilt,`,
    ]);

    description += RND.item([
      ` and ${handle.descriptor} handle`,
      ` and ${cosmeticHandle} ${handle.descriptor} handle`,
    ]);

    if (quality > 1 && random.int(1, 100) > 70) {
      description += RND.item([
        `, with a `
        + RND.item(["yellow", "blue", "red", "purple", "green", "grey", "white", "black"])
        + ` ribbon `
        + RND.item(["wrapped around it", "trailing from it", "tied to it"]),
        `, with a ${
          RND.item([
            "leather thong",
            RND.item(["gold", "brass", "silver", "iron"]) + " chain",
          ])
        } attached to the pommel`,
        `, exquisitely crafted`,
        ` inlaid with ${RND.item(["gold", "silver", "copper", "brass"])}`,
      ]);
    }

    let name = `${blade.descriptor} ${this.name}`;

    let tags = [name, this.name, "knife", "melee", "simple weapon", "bladed weapon", "weapon"];

    return new MeleeWeapon(name, description, this.damage, this.hands, value, quality, tags);
  }
}
