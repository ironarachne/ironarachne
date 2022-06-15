'use strict';

import * as Components from '../../components/components';
import * as Words from '../../../words';
import * as RND from '../../../random';
import random from 'random';
import type Pattern from '../pattern';
import Component from '../../components/component';
import Clothing from '../../clothing/clothing';

export default class DressPattern implements Pattern {
  name: string;
  tags: string[];
  baseValue: number;

  constructor(name: string, value: number) {
    this.name = name;
    this.tags = [name, 'dress', 'clothing'];
    this.baseValue = value;
  }

  complete(componentOptions: Component[], minValue: number, maxValue: number): Clothing {
    let body = Components.getComponentForCategory('fabric', componentOptions, minValue, maxValue);

    let value = this.baseValue + body.value * 2;

    let description = `${Words.article(this.name)} ${this.name} `;

    description += RND.item([`made of ${body.descriptor} `, '']);

    if (value > 3000 && random.int(1, 100) >= 70) {
      description += RND.item([
        ' that is artfully embroidered',
        ` that is embroidered with ${RND.item(['simple', 'complex', 'ornate'])} patterns`,
        ' that is gusseted',
      ]);
    }

    description += ' with ';

    let sleeves =
      RND.item(['short', 'long', 'wide', 'narrow', 'bunched', 'volumnous', 'no']) + ' sleeves';
    let lacing =
      RND.item(['tight ', '', 'double ', 'wide ']) +
      'lacing ' +
      RND.item(['down the middle', 'at the top', 'halfway down', 'down the back']);
    let neck = RND.item(['a wide neck', 'a v-neck', 'a deep neck']);
    let waist = RND.item(['a tight waist', 'a narrow waist', 'a cinched waist', 'a belted waist']);

    description += RND.item([sleeves, lacing, neck, waist]);

    let name = `${body.descriptor} ${this.name}`;

    return new Clothing(name, description, 'torso', value);
  }
}
