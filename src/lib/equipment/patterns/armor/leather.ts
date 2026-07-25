import type { RNG } from '@ironarachne/rng';
import * as Words from '@ironarachne/words';

import Armor from '../../armor/armor.js';
import Component from '../../components/component.js';
import * as Components from '../../components/components.js';
import type Pattern from '../pattern.js';

export default class LeatherArmorPattern implements Pattern {
  name: string;
  tags: string[];
  baseValue: number;

  constructor(name: string, value: number) {
    this.name = name;
    this.tags = [name, 'body armor', 'armor'];
    this.baseValue = value;
  }

  complete(componentOptions: Component[], quality: number, rng: RNG): Armor {
    const body = rng.item(Components.withCategory('hard leather', componentOptions));
    const trim = rng.item(Components.withCategory('soft metal', componentOptions));

    const value = this.baseValue + body.value * 1000 + trim.value;

    let description = rng.item([
      `${Words.article(this.name)} ${this.name} made of ${body.descriptor}`,
      `${Words.article(body.descriptor)} ${body.descriptor} ${this.name} `,
    ]);

    description += rng.item([
      ` with ${trim.descriptor} ${rng.item([
        'hardware',
        'fasteners',
        'banding',
        'studs',
        'rivets',
      ])}`,
      ` fastened with ${trim.descriptor} ${rng.item(['buckles', 'clasps'])}`,
    ]);

    if (quality > 1 && rng.int(1, 100) >= 70) {
      description += rng.item([
        `, with integrated sleeves`,
        `, with ${rng.item(['embossed patterns', 'a lacquered finish'])}`,
      ]);
    }

    const name = `${body.descriptor} ${this.name}`;
    const tags = [name, this.name, 'body armor', 'armor'];

    const armorClass = 11 + rng.int(0, 1);

    return new Armor(name, description, 'torso', armorClass, value, quality, tags);
  }
}
