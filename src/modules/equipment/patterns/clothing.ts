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
    new BeltPattern('belt', 1),
    new DressPattern('short dress', 2),
    new DressPattern('long dress', 2),
    new DressPattern('wedding dress', 10),
    new DressPattern('tight dress', 2),
    new DressPattern('loose dress', 3),
    new PantPattern('trews', 1),
    new PantPattern('pants', 1),
    new PantPattern('brais', 1),
    new PantPattern('breeches', 1),
    new PantPattern('trousers', 1),
    new TopPattern('shirt', 1),
    new TopPattern('short tunic', 2),
    new TopPattern('long tunic', 2),
  ];
}

export class BeltPattern implements Patterns.Pattern {
  name: string;
  tags: string[];
  baseValue: number;

  constructor(name: string, value: number) {
    this.name = name;
    this.tags = [name, 'belt', 'clothing'];
    this.baseValue = value;
  }

  complete(componentOptions: Components.Component[], valueThreshold: number): Item.Clothing {
    let body = ComponentCollection.getComponentForCategory("leather", componentOptions, valueThreshold);
    let hardware = ComponentCollection.getComponentForCategory("metal", componentOptions, valueThreshold);

    let description = RND.item([
      `${Words.article(this.name)} ${this.name} `,
      `${Words.article(this.name)} ${this.name} made of ${body.descriptor} `,
      `${Words.article(body.descriptor)} ${body.descriptor} ${this.name} `,
    ]);

    description += `with ${Words.article(hardware.descriptor)} ${hardware.descriptor} ${RND.item(['clasp', 'buckle', 'closure'])}`;

    if (random.int(1, 100) >= 70) {
      description += RND.item([
        ` that is embossed with ${RND.item(['simple', 'complex', 'ornate'])} patterns`,
        ` that has decorative stitching down the sides`,
      ]);
    }

    let name = `${body.descriptor} ${this.name}`;

    let value = this.baseValue + body.value + hardware.value;

    return new Item.Clothing(name, description, 'waist', value);
  }
}

export class DressPattern implements Patterns.Pattern {
  name: string;
  tags: string[];
  baseValue: number;

  constructor(name: string, value: number) {
    this.name = name;
    this.tags = [name, 'dress', 'clothing'];
    this.baseValue = value;
  }

  complete(componentOptions: Components.Component[], valueThreshold: number): Item.Clothing {
    let body = ComponentCollection.getComponentForCategory("fabric", componentOptions, valueThreshold);

    let description = `${Words.article(this.name)} ${this.name} `;

    description += RND.item([`made of ${body.descriptor} `, '']);

    if (random.int(1, 100) >= 70) {
      description += RND.item([
        ' that is artfully embroidered',
        ` that is embroidered with ${RND.item(['simple', 'complex', 'ornate'])} patterns`,
        ' that is gusseted',
      ]);
    }

    description += ' with ';

    let sleeves = RND.item(['short', 'long', 'wide', 'narrow', 'bunched', 'volumnous', 'no']) + ' sleeves';
    let lacing = RND.item(['tight ', '', 'double ', 'wide ']) + 'lacing ' + RND.item(['down the middle', 'at the top', 'halfway down', 'down the back']);
    let neck = RND.item(['a wide neck', 'a v-neck', 'a deep neck']);
    let waist = RND.item(['a tight waist', 'a narrow waist', 'a cinched waist', 'a belted waist']);

    description += RND.item([sleeves, lacing, neck, waist]);

    let name = `${body.descriptor} ${this.name}`;

    let value = this.baseValue + (body.value * 2);

    return new Item.Clothing(name, description, 'torso', value);
  }
}

export class PantPattern implements Patterns.Pattern {
  name: string;
  tags: string[];
  baseValue: number;

  constructor(name: string, value: number) {
    this.name = name;
    this.tags = [name, 'bottom', 'pants', 'clothing'];
    this.baseValue = value;
  }

  complete(componentOptions: Components.Component[], valueThreshold: number): Item.Clothing {
    let body = ComponentCollection.getComponentForCategory("fabric", componentOptions, valueThreshold);
    let hardware = ComponentCollection.getComponentForCategory("soft metal", componentOptions, valueThreshold);

    let description = `${this.name} `;

    description += RND.item([`made of ${body.descriptor} with `, 'with ']);

    let lacing = ` ${RND.item(['tight', 'loose', ''])} lacing`;
    let closures = RND.item(['dull', 'embossed', 'rough', 'shiny', 'round', 'square']) + ` ${hardware.descriptor} ` + RND.item(['buttons', 'clasps']);

    description += RND.item([lacing, closures]);

    if (random.int(1, 100) >= 70) {
      description += RND.item([
        ` that is embroidered with ${RND.item(['simple', 'complex', 'ornate'])} patterns`,
        ` that has decorative stitching down the sides`,
      ]);
    }

    let name = `${body.descriptor} ${this.name}`;

    let value = this.baseValue + body.value + hardware.value;

    return new Item.Clothing(name, description, 'legs', value);
  }
}

export class TopPattern implements Patterns.Pattern {
  name: string;
  tags: string[];
  baseValue: number;

  constructor(name: string, value: number) {
    this.name = name;
    this.tags = [name, 'top', 'clothing'];
    this.baseValue = value;
  }

  complete(componentOptions: Components.Component[], valueThreshold: number): Item.Clothing {
    let body = ComponentCollection.getComponentForCategory("fabric", componentOptions, valueThreshold);
    let hardware = ComponentCollection.getComponentForCategory("soft metal", componentOptions, valueThreshold);

    let description = `${Words.article(this.name)} ${this.name} `;

    description += RND.item([`made of ${body.descriptor} with `, 'with ']);

    let sleeves = RND.item(['short', 'long', 'wide', 'narrow', 'bunched', 'volumnous']) + ' sleeves';
    let lacing = 'lacing ' + RND.item(['down the middle', 'at the top', 'halfway down']);
    let collar = `a ${RND.item(['wide', 'tight', 'open'])} collar`;
    let closures = RND.item(['dull', 'embossed', 'rough', 'shiny', 'round', 'square']) + ` ${hardware.descriptor} ` + RND.item(['buttons', 'clasps']);

    description += RND.item([sleeves, collar, lacing, closures]);

    if (random.int(1, 100) >= 70) {
      description += RND.item([
        ' that is artfully embroidered',
        ` that is embroidered with ${RND.item(['simple', 'complex', 'ornate'])} patterns`,
        ' that is gusseted',
      ]);
    }

    let name = `${body.descriptor} ${this.name}`;

    let value = this.baseValue + body.value + hardware.value;

    return new Item.Clothing(name, description, 'torso', value);
  }
}


