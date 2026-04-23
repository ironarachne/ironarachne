import type { RNG } from '@ironarachne/rng';
import * as Words from '@ironarachne/words';
import Armor from '../../armor/armor.js';
import Component from '../../components/component.js';
import * as Components from '../../components/components.js';
import type Pattern from '../pattern.js';

export default class PrimitiveShieldPattern implements Pattern {
  name: string;
  tags: string[];
  baseValue: number;

  constructor(name: string, value: number) {
    this.name = name;
    this.tags = [name, 'shield'];
    this.baseValue = value;
  }

  complete(componentOptions: Component[], quality: number, rng: RNG): Armor {
    let body = rng.item(Components.withCategory('wood', componentOptions));

    let handle = rng.item(Components.withCategory('wood', componentOptions));

    let trim = rng.item(Components.withCategory('leather', componentOptions));

    let value = this.baseValue + body.value * 5 + trim.value;

    let description = rng.item([
      `${Words.article(this.name)} ${this.name} made of ${body.descriptor}`,
      `${Words.article(body.descriptor)} ${body.descriptor} ${this.name} `,
    ]);

    description += rng.item([
      ` with ${trim.descriptor} ${rng.item(['trim', 'edging'])}`,
      ` trimmed with ${trim.descriptor}`,
    ]);

    description += rng.item([` and a ${handle.descriptor} handle`, '']);

    if (quality > 1) {
      description += rng.item([' and decorated with bone']);
    }

    let name = `${body.descriptor} ${this.name}`;

    let armorClass = 1;
    let tags = [name, this.name, 'shield', 'armor'];

    return new Armor(name, description, 'arm', armorClass, value, quality, tags);
  }
}
