"use strict";

import * as RND from "@ironarachne/rng";
import * as Words from "@ironarachne/words";
import random from "random";
import Armor from "../../armor/armor.js";
import Component from "../../components/component.js";
import * as Components from "../../components/components.js";
import type Pattern from "../pattern.js";

export default class BreastplatePattern implements Pattern {
  name: string;
  tags: string[];
  baseValue: number;

  constructor(name: string, value: number) {
    this.name = name;
    this.tags = [name, "body armor", "armor"];
    this.baseValue = value;
  }

  complete(componentOptions: Component[], quality: number): Armor {
    let body = RND.item(Components.withCategory("metal", componentOptions));
    let trim = RND.item(Components.withCategory("soft metal", componentOptions));

    let value = this.baseValue + body.value * 1000 + trim.value;

    let description = RND.item([
      `${Words.article(this.name)} ${this.name} made of ${body.descriptor}`,
      `${Words.article(body.descriptor)} ${body.descriptor} ${this.name} `,
    ]);

    description += RND.item([
      ` with ${trim.descriptor} ${RND.item(["trim", "edging"])}`,
      ` trimmed with ${trim.descriptor}`,
      ` decorated with ${trim.descriptor} edging`,
    ]);

    if (quality > 1 && random.int(1, 100) >= 70) {
      description += RND.item([
        ` with overlapping plates`,
        ` with rolled edges`,
        ` with ornate engravings`,
      ]);
    }

    let name = `${body.descriptor} ${this.name}`;

    let armorClass = 14;
    let tags = [name, this.name, "breastplate", "armor"];

    return new Armor(name, description, "torso", armorClass, value, quality, tags);
  }
}
