import type { RNG } from '@ironarachne/rng';

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

  complete(componentOptions: Component[], quality: number, rng: RNG): Clothing {
    let body = rng.item(Components.withCategory('fabric', componentOptions));
    let hardware = rng.item(Components.withCategory('soft metal', componentOptions));

    let value = this.baseValue + body.value + hardware.value;

    let description = `${this.name} `;

    description += rng.item([`made of ${body.descriptor} with `, 'with ']);

    let lacing = ` ${rng.item(['tight', 'loose', ''])} lacing`;
    let closures =
      rng.item(['dull', 'embossed', 'rough', 'shiny', 'round', 'square']) +
      ` ${hardware.descriptor} ` +
      rng.item(['buttons', 'clasps']);

    description += rng.item([lacing, closures]);

    if (quality > 1 && rng.int(1, 100) >= 70) {
      description += rng.item([
        ` that is embroidered with ${rng.item(['simple', 'complex', 'ornate'])} patterns`,
        ` that has decorative stitching down the sides`,
      ]);
    }

    let name = `${body.descriptor} ${this.name}`;

    let tags = [name, this.name, 'bottom', 'pants', 'clothing'];

    return new Clothing(name, description, 'legs', value, quality, tags);
  }
}
