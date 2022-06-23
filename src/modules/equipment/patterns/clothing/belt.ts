'use strict';

import * as Components from '../../components/components';
import * as Words from '../../../words';
import * as RND from '../../../random';
import random from 'random';
import type Pattern from '../pattern';
import Component from '../../components/component';
import Clothing from '../../clothing/clothing';

export default class BeltPattern implements Pattern {
  name: string;
  tags: string[];
  baseValue: number;

  constructor(name: string, value: number) {
    this.name = name;
    this.tags = [name, 'belt', 'clothing'];
    this.baseValue = value;
  }

  complete(componentOptions: Component[], minValue: number, maxValue: number): Clothing {
    let body = Components.getComponentForCategory('leather', componentOptions, minValue, maxValue);
    let hardware = Components.getComponentForCategory(
      'metal',
      componentOptions,
      minValue,
      maxValue,
    );

    let value = this.baseValue + body.value + hardware.value;

    let description = RND.item([
      `${Words.article(this.name)} ${this.name} `,
      `${Words.article(this.name)} ${this.name} made of ${body.descriptor} `,
      `${Words.article(body.descriptor)} ${body.descriptor} ${this.name} `,
    ]);

    description += `with ${Words.article(hardware.descriptor)} ${hardware.descriptor} ${RND.item([
      'clasp',
      'buckle',
      'closure',
    ])}`;

    if (value > 1500 && random.int(1, 100) >= 70) {
      description += RND.item([
        ` that is embossed with ${RND.item(['simple', 'complex', 'ornate'])} patterns`,
        ` that has decorative stitching down the sides`,
      ]);
    }

    let name = `${body.descriptor} ${this.name}`;

    return new Clothing(name, description, 'waist', value);
  }
}
