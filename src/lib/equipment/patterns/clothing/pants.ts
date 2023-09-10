import * as RND from "@ironarachne/rng";
import random from "random";
import Clothing from "../../clothing/clothing.js";
import Component from "../../components/component.js";
import * as Components from "../../components/components.js";
import type Pattern from "../pattern.js";

export default class PantsPattern implements Pattern {
  name: string;
  tags: string[];
  baseValue: number;

  constructor(name: string, value: number) {
    this.name = name;
    this.tags = [name, "bottom", "pants", "clothing"];
    this.baseValue = value;
  }

  complete(componentOptions: Component[], quality: number): Clothing {
    let body = RND.item(Components.withCategory("fabric", componentOptions));
    let hardware = RND.item(Components.withCategory("soft metal", componentOptions));

    let value = this.baseValue + body.value + hardware.value;

    let description = `${this.name} `;

    description += RND.item([`made of ${body.descriptor} with `, "with "]);

    let lacing = ` ${RND.item(["tight", "loose", ""])} lacing`;
    let closures = RND.item(["dull", "embossed", "rough", "shiny", "round", "square"])
      + ` ${hardware.descriptor} `
      + RND.item(["buttons", "clasps"]);

    description += RND.item([lacing, closures]);

    if (quality > 1 && random.int(1, 100) >= 70) {
      description += RND.item([
        ` that is embroidered with ${RND.item(["simple", "complex", "ornate"])} patterns`,
        ` that has decorative stitching down the sides`,
      ]);
    }

    let name = `${body.descriptor} ${this.name}`;

    let tags = [name, this.name, "bottom", "pants", "clothing"];

    return new Clothing(name, description, "legs", value, quality, tags);
  }
}
