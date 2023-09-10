import * as RND from "@ironarachne/rng";
import * as Words from "@ironarachne/words";
import Armor from "../../armor/armor.js";
import Component from "../../components/component.js";
import * as Components from "../../components/components.js";
import type Pattern from "../pattern.js";

export default class ChainmailPattern implements Pattern {
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

    let value = this.baseValue + body.value * 500;

    let description = RND.item([
      `${Words.article(this.name)} ${this.name} made of ${body.descriptor}`,
      `${Words.article(this.name)} ${this.name} made of ${
        RND.item([
          "loose ",
          "tight ",
          "dense ",
          "heavy ",
          "",
        ])
      }${body.descriptor} rings`,
      `${Words.article(body.descriptor)} ${body.descriptor} ${this.name}`,
    ]);

    let name = `${body.descriptor} ${this.name}`;

    if (quality > 1) {
      description += RND.item([" and decorative belting"]);
    }

    let armorClass = 16;
    let tags = [name, this.name, "chainmail", "armor"];

    return new Armor(name, description, "torso", armorClass, value, quality, tags);
  }
}
