import * as RND from "@ironarachne/rng";
import * as Words from "@ironarachne/words";
import random from "random";
import Clothing from "../../clothing/clothing.js";
import Component from "../../components/component.js";
import * as Components from "../../components/components.js";
import type Pattern from "../pattern.js";

export default class DressPattern implements Pattern {
  name: string;
  tags: string[];
  baseValue: number;

  constructor(name: string, value: number) {
    this.name = name;
    this.tags = [name, "dress", "clothing"];
    this.baseValue = value;
  }

  complete(componentOptions: Component[], quality: number): Clothing {
    let body = RND.item(Components.withCategory("fabric", componentOptions));

    let value = this.baseValue + body.value * 2;

    let description = `${Words.article(this.name)} ${this.name} `;

    description += RND.item([`made of ${body.descriptor} `, ""]);

    if (quality > 1 && random.int(1, 100) >= 70) {
      description += RND.item([
        " that is artfully embroidered",
        ` that is embroidered with ${RND.item(["simple", "complex", "ornate"])} patterns`,
        " that is gusseted",
      ]);
    }

    description += " with ";

    let sleeves = RND.item(["short", "long", "wide", "narrow", "bunched", "volumnous", "no"]) + " sleeves";
    let lacing = RND.item(["tight ", "", "double ", "wide "])
      + "lacing "
      + RND.item(["down the middle", "at the top", "halfway down", "down the back"]);
    let neck = RND.item(["a wide neck", "a v-neck", "a deep neck"]);
    let waist = RND.item(["a tight waist", "a narrow waist", "a cinched waist", "a belted waist"]);

    description += RND.item([sleeves, lacing, neck, waist]);

    let name = `${body.descriptor} ${this.name}`;

    let tags = [name, this.name, "dress", "clothing"];

    return new Clothing(name, description, "torso", value, quality, tags);
  }
}
