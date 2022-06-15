'use strict';

import * as Components from '../../components/components';
import * as Words from '../../../words';
import * as RND from '../../../random';
import random from 'random';
import type Pattern from '../pattern';
import Component from '../../components/component';
import Clothing from '../../clothing/clothing';

export default class RobePattern implements Pattern {
  name: string;
  tags: string[];
  baseValue: number;

  constructor(name: string, value: number) {
    this.name = name;
    this.tags = [name, 'outer', 'clothing'];
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

    let description = `${Words.article(this.name)} ${this.name} `;

    description += RND.item([`made of ${body.descriptor} with `, 'with ']);

    let sleeves =
      RND.item(['short', 'long', 'wide', 'narrow', 'bunched', 'volumnous']) + ' sleeves';
    let lacing = 'lacing ' + RND.item(['down the middle', 'at the top', 'halfway down']);
    let collar = `a ${RND.item(['wide', 'tight', 'open'])} collar`;
    let closures =
      RND.item(['dull', 'embossed', 'rough', 'shiny', 'round', 'square']) +
      ` ${hardware.descriptor} ` +
      RND.item(['buttons', 'clasps']);

    description += RND.item([sleeves, collar, lacing, closures]);

    if (value > 1000 && random.int(1, 100) >= 70) {
      description += RND.item([
        ' that is artfully embroidered',
        ` that is embroidered with ${RND.item(['simple', 'complex', 'ornate'])} patterns`,
        ' that is gusseted',
      ]);
    }

    let name = `${body.descriptor} ${this.name}`;

    return new Clothing(name, description, 'torso', value);
  }
}
