import * as RNG from '@ironarachne/rng';
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

  complete(componentOptions: Component[], quality: number): MeleeWeapon {
    let blade = RNG.item(Components.withCategory('metal', componentOptions));
    let body = RNG.item(Components.withCategory('wood', componentOptions));

    let value = this.baseValue + blade.value + body.value;

    let cosmeticBlade = RNG.item([
      'serrated',
      'recently sharpened',
      'curved',
      'straight',
      'single-edged',
      'wide',
      'grooved',
    ]);

    let cosmeticBody = RNG.item(['carved', 'padded', 'embossed']);

    if (value < 2000) {
      cosmeticBlade = RNG.item(['simple', 'straight', 'worn']);

      cosmeticBody = RNG.item(['rough', 'worn']);
    }

    let description = `${Words.article(this.name)} ${this.name} with `;

    description += RNG.item([
      `${Words.article(blade.descriptor)} ${blade.descriptor} blade`,
      `${Words.article(cosmeticBlade)} ${cosmeticBlade} ${blade.descriptor} blade`,
    ]);

    description += RNG.item([
      ` and ${body.descriptor} body`,
      ` and ${cosmeticBody} ${body.descriptor} body`,
    ]);

    if (quality > 1 && RNG.int(1, 100) > 70) {
      description += RNG.item([
        `, with a ` +
          RNG.item(['yellow', 'blue', 'red', 'purple', 'green', 'grey', 'white', 'black']) +
          ` ribbon ` +
          RNG.item(['wrapped around it', 'trailing from it', 'tied to it']),
        `, exquisitely crafted`,
        ` inlaid with ${RNG.item(['gold', 'silver', 'copper', 'brass'])}`,
      ]);
    }

    let name = `${blade.descriptor} ${this.name}`;

    let tags = [name, this.name, 'spear', 'melee', 'simple weapon', 'bladed weapon', 'weapon'];

    return new MeleeWeapon(name, description, this.damage, this.hands, value, quality, tags);
  }
}
