import type { RNG } from '@ironarachne/rng';
import * as Words from '@ironarachne/words';
import Armor from '../../armor/armor.js';
import Component from '../../components/component.js';
import * as Components from '../../components/components.js';
import type Pattern from '../pattern.js';

export default class HelmetPattern implements Pattern {
  name: string;
  tags: string[];
  baseValue: number;

  constructor(name: string, value: number) {
    this.name = name;
    this.tags = [name, 'helmet', 'armor'];
    this.baseValue = value;
  }

  complete(componentOptions: Component[], quality: number, rng: RNG): Armor {
    const body = rng.item(Components.withCategory('metal', componentOptions));
    const trim = rng.item(Components.withCategory('soft metal', componentOptions));

    const value = this.baseValue + body.value * 10 + trim.value;

    let description = rng.item([
      `${Words.article(this.name)} ${this.name} made of ${body.descriptor}`,
      `${Words.article(body.descriptor)} ${body.descriptor} ${this.name} `,
    ]);

    description += rng.item([
      ` with ${trim.descriptor} ${rng.item(['trim', 'edging'])}`,
      ` trimmed with ${trim.descriptor}`,
    ]);

    if (quality > 1) {
      description += rng.item([' and set with jewels']);
    }

    const name = `${body.descriptor} ${this.name}`;

    const armorClass = 1;
    const tags = [name, this.name, 'helmet', 'armor'];

    return new Armor(name, description, 'head', armorClass, value, quality, tags);
  }
}
