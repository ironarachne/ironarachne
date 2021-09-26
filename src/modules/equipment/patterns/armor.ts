"use strict";

import * as Components from "../components/components";
import * as ComponentCollection from "../components/collection";
import * as Item from "../item";
import * as Patterns from "./patterns";
import * as Words from "../../words";
import * as RND from "../../random";
import random from "random";

export function all(): Patterns.Pattern[] {
  return [
    new HelmetPattern('armet', 500),
    new HelmetPattern('bascinet', 1000),
    new HelmetPattern('great helm', 500),
    new HelmetPattern('kettle helm', 500),
    new HelmetPattern('nasal helm', 500),
    new HelmetPattern('pot helm', 500),
    new HelmetPattern('spangenhelm', 500),
    new BreastplatePattern('breastplate', 40000),
    new BreastplatePattern('corrugated breastplate', 45000),
    new BreastplatePattern('skirted breastplate', 45000),
    new BreastplatePattern('cuirass', 40000),
    new BreastplatePattern('plate cuirass', 40000),
    new BreastplatePattern('Gothic cuirass', 50000),
    new LeatherArmorPattern('cuirass', 1000),
    new LeatherArmorPattern('brigandine', 1000),
    new ChainmailPattern('chain hauberk', 5500),
    new ChainmailPattern('chain shirt', 4500),
    new ChainmailPattern('chain vest', 4500),
  ];
}

export class HelmetPattern implements Patterns.Pattern {
  name: string;
  tags: string[];
  baseValue: number;

  constructor(name: string, value: number) {
    this.name = name;
    this.tags = [name, 'helmet', 'armor'];
    this.baseValue = value;
  }

  complete(componentOptions: Components.Component[], valueThreshold: number): Item.Armor {
    let body = ComponentCollection.getComponentForCategory("hard metal", componentOptions, valueThreshold);
    let trim = ComponentCollection.getComponentForCategory("soft metal", componentOptions, valueThreshold);

    let description = RND.item([
      `${Words.article(this.name)} ${this.name} made of ${body.descriptor}`,
      `${Words.article(body.descriptor)} ${body.descriptor} ${this.name} `,
    ]);

    description += RND.item([
      ` with ${trim.descriptor} ${RND.item(['trim', 'edging'])}`,
      ` trimmed with ${trim.descriptor}`,
    ])

    let name = `${body.descriptor} ${this.name}`;

    let value = this.baseValue + (body.value * 10) + trim.value;

    let armorClass = 1;

    return new Item.Armor(name, description, 'torso', armorClass, value);
  }
}

export class BreastplatePattern implements Patterns.Pattern {
  name: string;
  tags: string[];
  baseValue: number;

  constructor(name: string, value: number) {
    this.name = name;
    this.tags = [name, 'body armor', 'armor'];
    this.baseValue = value;
  }

  complete(componentOptions: Components.Component[], valueThreshold: number): Item.Armor {
    let body = ComponentCollection.getComponentForCategory("hard metal", componentOptions, valueThreshold);
    let trim = ComponentCollection.getComponentForCategory("soft metal", componentOptions, valueThreshold);

    let description = RND.item([
      `${Words.article(this.name)} ${this.name} made of ${body.descriptor}`,
      `${Words.article(body.descriptor)} ${body.descriptor} ${this.name} `,
    ]);

    description += RND.item([
      ` with ${trim.descriptor} ${RND.item(['trim', 'edging'])}`,
      ` trimmed with ${trim.descriptor}`,
      ` decorated with ${trim.descriptor} edging`,
    ]);

    if (random.int(1, 100) >= 70) {
      description += RND.item([
        ` with overlapping plates`,
        ` with rolled edges`,
        ` with ornate engravings`,
      ]);
    }

    let name = `${body.descriptor} ${this.name}`;

    let value = this.baseValue + (body.value * 1000) + trim.value;

    let armorClass = 14;

    return new Item.Armor(name, description, 'torso', armorClass, value);
  }
}

export class ChainmailPattern implements Patterns.Pattern {
  name: string;
  tags: string[];
  baseValue: number;

  constructor(name: string, value: number) {
    this.name = name;
    this.tags = [name, 'body armor', 'armor'];
    this.baseValue = value;
  }

  complete(componentOptions: Components.Component[], valueThreshold: number): Item.Armor {
    let body = ComponentCollection.getComponentForCategory("hard metal", componentOptions, valueThreshold);

    let description = RND.item([
      `${Words.article(this.name)} ${this.name} made of ${body.descriptor}`,
      `${Words.article(this.name)} ${this.name} made of ${RND.item(['loose ', 'tight ', 'dense ', 'heavy ', ''])}${body.descriptor} rings`,
      `${Words.article(body.descriptor)} ${body.descriptor} ${this.name}`,
    ]);

    let name = `${body.descriptor} ${this.name}`;

    let value = this.baseValue + (body.value * 500);

    let armorClass = 16;

    return new Item.Armor(name, description, 'torso', armorClass, value);
  }
}

export class LeatherArmorPattern implements Patterns.Pattern {
  name: string;
  tags: string[];
  baseValue: number;

  constructor(name: string, value: number) {
    this.name = name;
    this.tags = [name, 'body armor', 'armor'];
    this.baseValue = value;
  }

  complete(componentOptions: Components.Component[], valueThreshold: number): Item.Armor {
    let body = ComponentCollection.getComponentForCategory("hard leather", componentOptions, valueThreshold);
    let trim = ComponentCollection.getComponentForCategory("soft metal", componentOptions, valueThreshold);

    let description = RND.item([
      `${Words.article(this.name)} ${this.name} made of ${body.descriptor}`,
      `${Words.article(body.descriptor)} ${body.descriptor} ${this.name} `,
    ]);

    description += RND.item([
      ` with ${trim.descriptor} ${RND.item(['hardware', 'fasteners', 'banding', 'studs', 'rivets'])}`,
      ` fastened with ${trim.descriptor} ${RND.item(['buckles', 'clasps'])}`,
    ]);

    if (random.int(1, 100) >= 70) {
      description += RND.item([
        `, with integrated sleeves`,
        `, with ${RND.item(['embossed patterns', 'a lacquered finish'])}`,
      ]);
    }

    let name = `${body.descriptor} ${this.name}`;

    let value = this.baseValue + (body.value * 1000) + trim.value;

    let armorClass = 11 + random.int(0, 1);

    return new Item.Armor(name, description, 'torso', armorClass, value);
  }
}
