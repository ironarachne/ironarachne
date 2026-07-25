import type { RNG } from '@ironarachne/rng';
import * as Words from '@ironarachne/words';

import Component from '../../components/component.js';
import * as Components from '../../components/components.js';
import MeleeWeapon from '../../weapons/melee.js';
import type Pattern from '../pattern.js';

export default class SpearPattern implements Pattern {
  name: string;
  tags: string[];
  hands: number;
  baseValue: number;
  damage: string;

  constructor(name: string, hands: number, damage: string, value: number) {
    this.name = name;
    this.tags = [name, 'spear', 'melee', 'simple weapon', 'weapon'];
    this.hands = hands;
    this.damage = damage;
    this.baseValue = value;
  }

  complete(componentOptions: Component[], quality: number, rng: RNG): MeleeWeapon {
    const blade = rng.item(Components.withCategory('metal', componentOptions));
    const body = rng.item(Components.withCategory('wood', componentOptions));

    const value = this.baseValue + blade.value + body.value;

    let cosmeticBlade = rng.item([
      'serrated',
      'recently sharpened',
      'curved',
      'straight',
      'single-edged',
      'wide',
      'grooved',
    ]);

    let cosmeticBody = rng.item(['carved', 'padded', 'embossed']);

    if (value < 2000) {
      cosmeticBlade = rng.item(['simple', 'straight', 'worn']);

      cosmeticBody = rng.item(['rough', 'worn']);
    }

    let description = `${Words.article(this.name)} ${this.name} with `;

    description += rng.item([
      `${Words.article(blade.descriptor)} ${blade.descriptor} blade`,
      `${Words.article(cosmeticBlade)} ${cosmeticBlade} ${blade.descriptor} blade`,
    ]);

    description += rng.item([
      ` and ${body.descriptor} body`,
      ` and ${cosmeticBody} ${body.descriptor} body`,
    ]);

    if (quality > 1 && rng.int(1, 100) > 70) {
      description += rng.item([
        `, with a ` +
          rng.item(['yellow', 'blue', 'red', 'purple', 'green', 'grey', 'white', 'black']) +
          ` ribbon ` +
          rng.item(['wrapped around it', 'trailing from it', 'tied to it']),
        `, exquisitely crafted`,
        ` inlaid with ${rng.item(['gold', 'silver', 'copper', 'brass'])}`,
      ]);
    }

    const name = `${blade.descriptor} ${this.name}`;

    const tags = [name, this.name, 'spear', 'melee', 'simple weapon', 'bladed weapon', 'weapon'];

    return new MeleeWeapon(name, description, this.damage, this.hands, value, quality, tags);
  }
}
