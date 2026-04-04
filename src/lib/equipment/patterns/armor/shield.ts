import * as RNG from '@ironarachne/rng';
import * as Words from '@ironarachne/words';
import Armor from '../../armor/armor.js';
import Component from '../../components/component.js';
import * as Components from '../../components/components.js';
import type Pattern from '../pattern.js';

export default class ShieldPattern implements Pattern {
  name: string;
  tags: string[];
  baseValue: number;

  constructor(name: string, value: number) {
    this.name = name;
    this.tags = [name, 'shield'];
    this.baseValue = value;
  }

  complete(componentOptions: Component[], quality: number): Armor {
    let body = RNG.item(Components.withCategory('metal', componentOptions));

    let handle = RNG.item(Components.withCategory('wood', componentOptions));

    let trim = RNG.item(Components.withCategory('soft metal', componentOptions));

    let value = this.baseValue + body.value * 5 + trim.value;

    let description = RNG.item([
      `${Words.article(this.name)} ${this.name} made of ${body.descriptor}`,
      `${Words.article(body.descriptor)} ${body.descriptor} ${this.name} `,
    ]);

    description += RNG.item([
      ` with ${trim.descriptor} ${RNG.item(['trim', 'edging'])}`,
      ` trimmed with ${trim.descriptor}`,
    ]);

    description += RNG.item([` and a ${handle.descriptor} handle`, '']);

    if (quality > 1) {
      description += RNG.item([' and decorated with spikes']);
    }

    let name = `${body.descriptor} ${this.name}`;

    let armorClass = 1;
    let tags = [name, this.name, 'shield', 'armor'];

    return new Armor(name, description, 'arm', armorClass, value, quality, tags);
  }
}
