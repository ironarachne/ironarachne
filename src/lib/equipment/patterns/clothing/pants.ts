import * as RNG from '@ironarachne/rng';

import Clothing from '../../clothing/clothing.js';
import Component from '../../components/component.js';
import * as Components from '../../components/components.js';
import type Pattern from '../pattern.js';

export default class PantsPattern implements Pattern {
  name: string;
  tags: string[];
  baseValue: number;

  constructor(name: string, value: number) {
    this.name = name;
    this.tags = [name, 'bottom', 'pants', 'clothing'];
    this.baseValue = value;
  }

  complete(componentOptions: Component[], quality: number): Clothing {
    let body = RNG.item(Components.withCategory('fabric', componentOptions));
    let hardware = RNG.item(Components.withCategory('soft metal', componentOptions));

    let value = this.baseValue + body.value + hardware.value;

    let description = `${this.name} `;

    description += RNG.item([`made of ${body.descriptor} with `, 'with ']);

    let lacing = ` ${RNG.item(['tight', 'loose', ''])} lacing`;
    let closures =
      RNG.item(['dull', 'embossed', 'rough', 'shiny', 'round', 'square']) +
      ` ${hardware.descriptor} ` +
      RNG.item(['buttons', 'clasps']);

    description += RNG.item([lacing, closures]);

    if (quality > 1 && RNG.int(1, 100) >= 70) {
      description += RNG.item([
        ` that is embroidered with ${RNG.item(['simple', 'complex', 'ornate'])} patterns`,
        ` that has decorative stitching down the sides`,
      ]);
    }

    let name = `${body.descriptor} ${this.name}`;

    let tags = [name, this.name, 'bottom', 'pants', 'clothing'];

    return new Clothing(name, description, 'legs', value, quality, tags);
  }
}
