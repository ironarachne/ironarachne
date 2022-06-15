'use strict';

import * as Components from '../../components/components';
import * as RND from '../../../random';
import random from 'random';
import type Pattern from '../pattern';
import Component from '../../components/component';
import Clothing from '../../clothing/clothing';

export default class PantsPattern implements Pattern {
  name: string;
  tags: string[];
  baseValue: number;

  constructor(name: string, value: number) {
    this.name = name;
    this.tags = [name, 'bottom', 'pants', 'clothing'];
    this.baseValue = value;
  }

  complete(componentOptions: Component[], minValue: number, maxValue: number): Clothing {
    let body = Components.getComponentForCategory('fabric', componentOptions, minValue, maxValue);
    let hardware = Components.getComponentForCategory(
      'soft metal',
      componentOptions,
      minValue,
      maxValue,
    );

    let value = this.baseValue + body.value + hardware.value;

    let description = `${this.name} `;

    description += RND.item([`made of ${body.descriptor} with `, 'with ']);

    let lacing = ` ${RND.item(['tight', 'loose', ''])} lacing`;
    let closures =
      RND.item(['dull', 'embossed', 'rough', 'shiny', 'round', 'square']) +
      ` ${hardware.descriptor} ` +
      RND.item(['buttons', 'clasps']);

    description += RND.item([lacing, closures]);

    if (value > 1000 && random.int(1, 100) >= 70) {
      description += RND.item([
        ` that is embroidered with ${RND.item(['simple', 'complex', 'ornate'])} patterns`,
        ` that has decorative stitching down the sides`,
      ]);
    }

    let name = `${body.descriptor} ${this.name}`;

    return new Clothing(name, description, 'legs', value);
  }
}
