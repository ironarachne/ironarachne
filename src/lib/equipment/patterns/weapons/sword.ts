import * as RNG from '@ironarachne/rng';
import * as Words from '@ironarachne/words';

import Component from '../../components/component.js';
import * as Components from '../../components/components.js';
import MeleeWeapon from '../../weapons/melee.js';
import type Pattern from '../pattern.js';

export default class SwordPattern implements Pattern {
  name: string;
  tags: string[];
  hands: number;
  baseValue: number;
  damage: string;

  constructor(name: string, hands: number, damage: string, value: number) {
    this.name = name;
    this.tags = [name, 'sword', 'melee', 'martial weapon', 'weapon'];
    this.hands = hands;
    this.damage = damage;
    this.baseValue = value;
  }

  complete(componentOptions: Component[], quality: number): MeleeWeapon {
    let blade = RNG.item(Components.withCategory('metal', componentOptions));
    let hilt = RNG.item(Components.withCategory('metal', componentOptions));
    let handle = RNG.item(Components.withCategory('wood', componentOptions));

    let value = this.baseValue + blade.value * 2 + hilt.value + handle.value;

    let cosmeticBlade = RNG.item([
      'serrated',
      'recently sharpened',
      'curved',
      'straight',
      'single-edged',
      'wide',
      'grooved',
    ]);

    let cosmeticHandle = RNG.item(['carved', 'padded', 'embossed']);

    let cosmeticHilt = RNG.item(['gem-studded', 'spiked', 'curved', 'inlaid']);

    if (quality < 2) {
      cosmeticBlade = RNG.item(['simple', 'straight', 'worn']);

      cosmeticHandle = RNG.item(['rough', 'worn']);

      cosmeticHilt = RNG.item(['simple', 'unadorned', 'straight']);
    }

    let description = `${Words.article(this.name)} ${this.name} with `;

    description += RNG.item([
      `${Words.article(blade.descriptor)} ${blade.descriptor} blade,`,
      `${Words.article(cosmeticBlade)} ${cosmeticBlade} ${blade.descriptor} blade,`,
    ]);

    description += RNG.item([
      ` ${hilt.descriptor} hilt,`,
      ` ${cosmeticHilt} ${hilt.descriptor} hilt,`,
    ]);

    description += RNG.item([
      ` and ${handle.descriptor} handle`,
      ` and ${cosmeticHandle} ${handle.descriptor} handle`,
    ]);

    if (quality > 1 && RNG.int(1, 100) > 70) {
      description += RNG.item([
        `, with a ` +
          RNG.item(['yellow', 'blue', 'red', 'purple', 'green', 'grey', 'white', 'black']) +
          ` ribbon ` +
          RNG.item(['wrapped around it', 'trailing from it', 'tied to it']),
        `, with a ${RNG.item([
          'leather thong',
          RNG.item(['gold', 'brass', 'silver', 'iron']) + ' chain',
        ])} attached to the pommel`,
        `, exquisitely crafted`,
        ` inlaid with ${RNG.item(['gold', 'silver', 'copper', 'brass'])}`,
      ]);
    }

    let name = `${blade.descriptor} ${this.name}`;

    let tags = [name, this.name, 'sword', 'melee', 'martial weapon', 'bladed weapon', 'weapon'];

    return new MeleeWeapon(name, description, this.damage, this.hands, value, quality, tags);
  }
}
