import type { RNG } from '@ironarachne/rng';
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

  complete(componentOptions: Component[], quality: number, rng: RNG): MeleeWeapon {
    let blade = rng.item(Components.withCategory('metal', componentOptions));
    let hilt = rng.item(Components.withCategory('metal', componentOptions));
    let handle = rng.item(Components.withCategory('wood', componentOptions));

    let value = this.baseValue + blade.value * 2 + hilt.value + handle.value;

    let cosmeticBlade = rng.item([
      'serrated',
      'recently sharpened',
      'curved',
      'straight',
      'single-edged',
      'wide',
      'grooved',
    ]);

    let cosmeticHandle = rng.item(['carved', 'padded', 'embossed']);

    let cosmeticHilt = rng.item(['gem-studded', 'spiked', 'curved', 'inlaid']);

    if (quality < 2) {
      cosmeticBlade = rng.item(['simple', 'straight', 'worn']);

      cosmeticHandle = rng.item(['rough', 'worn']);

      cosmeticHilt = rng.item(['simple', 'unadorned', 'straight']);
    }

    let description = `${Words.article(this.name)} ${this.name} with `;

    description += rng.item([
      `${Words.article(blade.descriptor)} ${blade.descriptor} blade,`,
      `${Words.article(cosmeticBlade)} ${cosmeticBlade} ${blade.descriptor} blade,`,
    ]);

    description += rng.item([
      ` ${hilt.descriptor} hilt,`,
      ` ${cosmeticHilt} ${hilt.descriptor} hilt,`,
    ]);

    description += rng.item([
      ` and ${handle.descriptor} handle`,
      ` and ${cosmeticHandle} ${handle.descriptor} handle`,
    ]);

    if (quality > 1 && rng.int(1, 100) > 70) {
      description += rng.item([
        `, with a ` +
          rng.item(['yellow', 'blue', 'red', 'purple', 'green', 'grey', 'white', 'black']) +
          ` ribbon ` +
          rng.item(['wrapped around it', 'trailing from it', 'tied to it']),
        `, with a ${rng.item([
          'leather thong',
          rng.item(['gold', 'brass', 'silver', 'iron']) + ' chain',
        ])} attached to the pommel`,
        `, exquisitely crafted`,
        ` inlaid with ${rng.item(['gold', 'silver', 'copper', 'brass'])}`,
      ]);
    }

    let name = `${blade.descriptor} ${this.name}`;

    let tags = [name, this.name, 'sword', 'melee', 'martial weapon', 'bladed weapon', 'weapon'];

    return new MeleeWeapon(name, description, this.damage, this.hands, value, quality, tags);
  }
}
