import * as RND from "@ironarachne/rng";
import * as Words from "@ironarachne/words";
import random from "random";
import Clothing from "../../clothing/clothing.js";
import Component from "../../components/component.js";
import * as Components from "../../components/components.js";
import type Pattern from "../pattern.js";

export default class BeltPattern implements Pattern {
  name: string;
  tags: string[];
  baseValue: number;

  constructor(name: string, value: number) {
    this.name = name;
    this.tags = [name, "belt", "clothing"];
    this.baseValue = value;
  }

  complete(componentOptions: Component[], quality: number): Clothing {
    let body = RND.item(Components.withCategory("leather", componentOptions));
    let hardware = RND.item(Components.withCategory("metal", componentOptions));

    let value = this.baseValue + body.value + hardware.value;

    let description = RND.item([
      `${Words.article(this.name)} ${this.name} `,
      `${Words.article(this.name)} ${this.name} made of ${body.descriptor} `,
      `${Words.article(body.descriptor)} ${body.descriptor} ${this.name} `,
    ]);

    description += `with ${Words.article(hardware.descriptor)} ${hardware.descriptor} ${
      RND.item([
        "clasp",
        "buckle",
        "closure",
      ])
    }`;

    if (quality > 1 && random.int(1, 100) >= 70) {
      description += RND.item([
        ` that is embossed with ${RND.item(["simple", "complex", "ornate"])} patterns`,
        ` that has decorative stitching down the sides`,
      ]);
    }

    let name = `${body.descriptor} ${this.name}`;

    let tags = [name, this.name, "belt", "clothing"];

    return new Clothing(name, description, "waist", value, quality, tags);
  }
}
