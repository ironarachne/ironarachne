"use strict";

import * as RND from "@ironarachne/rng";
import * as Words from "@ironarachne/words";
import random from "random";
import Component from "../../components/component.js";
import * as Components from "../../components/components.js";
import MeleeWeapon from "../../weapons/melee.js";
import type Pattern from "../pattern.js";

export default class StaffPattern implements Pattern {
  name: string;
  tags: string[];
  hands: number;
  baseValue: number;
  damage: string;

  constructor(name: string, hands: number, damage: string, value: number) {
    this.name = name;
    this.tags = [name, "staff", "melee", "simple weapon", "weapon"];
    this.hands = hands;
    this.damage = damage;
    this.baseValue = value;
  }

  complete(componentOptions: Component[], quality: number): MeleeWeapon {
    let body = RND.item(Components.withCategory("wood", componentOptions));

    let cosmeticBody = RND.item(["carved", "engraved", "stained", "painted"]);

    let value = this.baseValue + body.value;

    let description = `${Words.article(this.name)} ${this.name} with `;

    description += RND.item([
      `${Words.article(body.descriptor)} ${body.descriptor} body`,
      `${Words.article(cosmeticBody)} ${cosmeticBody} ${body.descriptor} body`,
    ]);

    if (quality > 1 && random.int(1, 100) > 70) {
      description += RND.item([
        ` topped with a ${
          RND.item([
            "crystal globe",
            "raw crystal",
            "rough crystal",
            "polished crystal",
          ])
        }`,
        ` capped on top and bottom with ${
          RND.item([
            "steel",
            "gold",
            "silver",
            "bronze",
            "brass",
            "iron",
            "tin",
          ])
        }`,
      ]);
    }

    let name = `${body.descriptor} ${this.name}`;

    let tags = [name, this.name, "staff", "melee", "simple weapon", "weapon"];

    return new MeleeWeapon(name, description, this.damage, this.hands, value, quality, tags);
  }
}
