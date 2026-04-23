import type { RNG } from '@ironarachne/rng';
import * as Words from '@ironarachne/words';

import Armor from '../../armor/armor.js';
import Component from '../../components/component.js';
import * as Components from '../../components/components.js';
import type Pattern from '../pattern.js';

export default class BreastplatePattern implements Pattern {
  name: string;
  tags: string[];
  baseValue: number;

  constructor(name: string, value: number) {
    this.name = name;
    this.tags = [name, 'body armor', 'armor'];
    this.baseValue = value;
  }

  complete(componentOptions: Component[], quality: number, rng: RNG): Armor {
    let body = rng.item(Components.withCategory('metal', componentOptions));
    let trim = rng.item(Components.withCategory('soft metal', componentOptions));

    let value = this.baseValue + body.value * 1000 + trim.value;

    let description = rng.item([
      `${Words.article(this.name)} ${this.name} made of ${body.descriptor}`,
      `${Words.article(body.descriptor)} ${body.descriptor} ${this.name} `,
    ]);

    description += rng.item([
      ` with ${trim.descriptor} ${rng.item(['trim', 'edging'])}`,
      ` trimmed with ${trim.descriptor}`,
      ` decorated with ${trim.descriptor} edging`,
    ]);

    if (quality > 1 && rng.int(1, 100) >= 70) {
      description += rng.item([
        ` with overlapping plates`,
        ` with rolled edges`,
        ` with ornate engravings`,
      ]);
    }

    let name = `${body.descriptor} ${this.name}`;

    let armorClass = 14;
    let tags = [name, this.name, 'breastplate', 'armor'];

    return new Armor(name, description, 'torso', armorClass, value, quality, tags);
  }
}
