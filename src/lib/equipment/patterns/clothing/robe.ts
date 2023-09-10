import * as RND from "@ironarachne/rng";
import * as Words from "@ironarachne/words";
import random from "random";
import Clothing from "../../clothing/clothing.js";
import Component from "../../components/component.js";
import * as Components from "../../components/components.js";
import type Pattern from "../pattern.js";

export default class RobePattern implements Pattern {
  name: string;
  tags: string[];
  baseValue: number;

  constructor(name: string, value: number) {
    this.name = name;
    this.tags = [name, "outer", "clothing"];
    this.baseValue = value;
  }

  complete(componentOptions: Component[], quality: number): Clothing {
    let body = RND.item(Components.withCategory("fabric", componentOptions));
    let hardware = RND.item(Components.withCategory("soft metal", componentOptions));

    let value = this.baseValue + body.value + hardware.value;

    let description = `${Words.article(this.name)} ${this.name} `;

    description += RND.item([`made of ${body.descriptor} with `, "with "]);

    let sleeves = RND.item(["short", "long", "wide", "narrow", "bunched", "volumnous"]) + " sleeves";
    let lacing = "lacing " + RND.item(["down the middle", "at the top", "halfway down"]);
    let collar = `a ${RND.item(["wide", "tight", "open"])} collar`;
    let closures = RND.item(["dull", "embossed", "rough", "shiny", "round", "square"])
      + ` ${hardware.descriptor} `
      + RND.item(["buttons", "clasps"]);

    description += RND.item([sleeves, collar, lacing, closures]);

    if (quality > 1 && random.int(1, 100) >= 70) {
      description += RND.item([
        " that is artfully embroidered",
        ` that is embroidered with ${RND.item(["simple", "complex", "ornate"])} patterns`,
        " that is gusseted",
      ]);
    }

    let name = `${body.descriptor} ${this.name}`;

    let tags = [name, this.name, "outer", "clothing"];

    return new Clothing(name, description, "torso", value, quality, tags);
  }
}
