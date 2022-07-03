'use strict';

import Armor from '../../armor/armor';
import Component from '../../components/component';
import type Pattern from '../pattern';
import * as Components from '../../components/components';
import * as RND from '../../../random';
import * as Words from '../../../words';
import random from 'random';

export default class LeatherArmorPattern implements Pattern {
  name: string;
  tags: string[];
  baseValue: number;

  constructor(name: string, value: number) {
    this.name = name;
    this.tags = [name, 'body armor', 'armor'];
    this.baseValue = value;
  }

  complete(componentOptions: Component[], quality: number): Armor {
    let body = RND.item(Components.withCategory('hard leather', componentOptions));
    let trim = RND.item(Components.withCategory('soft metal', componentOptions));

    let value = this.baseValue + body.value * 1000 + trim.value;

    let description = RND.item([
      `${Words.article(this.name)} ${this.name} made of ${body.descriptor}`,
      `${Words.article(body.descriptor)} ${body.descriptor} ${this.name} `,
    ]);

    description += RND.item([
      ` with ${trim.descriptor} ${RND.item([
        'hardware',
        'fasteners',
        'banding',
        'studs',
        'rivets',
      ])}`,
      ` fastened with ${trim.descriptor} ${RND.item(['buckles', 'clasps'])}`,
    ]);

    if (quality > 1 && random.int(1, 100) >= 70) {
      description += RND.item([
        `, with integrated sleeves`,
        `, with ${RND.item(['embossed patterns', 'a lacquered finish'])}`,
      ]);
    }

    let name = `${body.descriptor} ${this.name}`;
    let tags = [name, this.name, 'body armor', 'armor'];

    let armorClass = 11 + random.int(0, 1);

    return new Armor(name, description, 'torso', armorClass, value, quality, tags);
  }
}
