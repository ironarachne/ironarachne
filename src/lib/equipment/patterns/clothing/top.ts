import * as RNG from '@ironarachne/rng';
import * as Words from '@ironarachne/words';

import Clothing from '../../clothing/clothing.js';
import Component from '../../components/component.js';
import * as Components from '../../components/components.js';
import type Pattern from '../pattern.js';

export default class TopPattern implements Pattern {
  name: string;
  tags: string[];
  baseValue: number;

  constructor(name: string, value: number) {
    this.name = name;
    this.tags = [name, 'top', 'clothing'];
    this.baseValue = value;
  }

  complete(componentOptions: Component[], quality: number): Clothing {
    let body = RNG.item(Components.withCategory('fabric', componentOptions));
    let hardware = RNG.item(Components.withCategory('soft metal', componentOptions));

    let value = this.baseValue + body.value + hardware.value;

    let description = `${Words.article(this.name)} ${this.name} `;

    description += RNG.item([`made of ${body.descriptor} with `, 'with ']);

    let sleeves =
      RNG.item(['short', 'long', 'wide', 'narrow', 'bunched', 'volumnous']) + ' sleeves';
    let lacing = 'lacing ' + RNG.item(['down the middle', 'at the top', 'halfway down']);
    let collar = `a ${RNG.item(['wide', 'tight', 'open'])} collar`;
    let closures =
      RNG.item(['dull', 'embossed', 'rough', 'shiny', 'round', 'square']) +
      ` ${hardware.descriptor} ` +
      RNG.item(['buttons', 'clasps']);

    description += RNG.item([sleeves, collar, lacing, closures]);

    if (quality > 1 && RNG.int(1, 100) >= 70) {
      description += RNG.item([
        ' that is artfully embroidered',
        ` that is embroidered with ${RNG.item(['simple', 'complex', 'ornate'])} patterns`,
        ' that is gusseted',
      ]);
    }

    let name = `${body.descriptor} ${this.name}`;

    let tags = [name, this.name, 'top', 'clothing'];

    return new Clothing(name, description, 'torso', value, quality, tags);
  }
}
