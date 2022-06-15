'use strict';

import * as Components from '../../components/components';
import * as Words from '../../../words';
import * as RND from '../../../random';
import random from 'random';
import type Pattern from '../pattern';
import Component from '../../components/component';
import MeleeWeapon from '../../weapons/melee';

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

  complete(componentOptions: Component[], minValue: number, maxValue: number): MeleeWeapon {
    let blade = Components.getComponentForCategory('metal', componentOptions, minValue, maxValue);
    let body = Components.getComponentForCategory('wood', componentOptions, minValue, maxValue);

    let value = this.baseValue + blade.value + body.value;

    let cosmeticBlade = RND.item([
      'serrated',
      'recently sharpened',
      'curved',
      'straight',
      'single-edged',
      'wide',
      'grooved',
    ]);

    let cosmeticBody = RND.item(['carved', 'padded', 'embossed']);

    if (value < 2000) {
      cosmeticBlade = RND.item(['simple', 'straight', 'worn']);

      cosmeticBody = RND.item(['rough', 'worn']);
    }

    let description = `${Words.article(this.name)} ${this.name} with `;

    description += RND.item([
      `${Words.article(blade.descriptor)} ${blade.descriptor} blade`,
      `${Words.article(cosmeticBlade)} ${cosmeticBlade} ${blade.descriptor} blade`,
    ]);

    description += RND.item([
      ` and ${body.descriptor} body`,
      ` and ${cosmeticBody} ${body.descriptor} body`,
    ]);

    if (value > 3000 && random.int(1, 100) > 70) {
      description += RND.item([
        `, with a ` +
          RND.item(['yellow', 'blue', 'red', 'purple', 'green', 'grey', 'white', 'black']) +
          ` ribbon ` +
          RND.item(['wrapped around it', 'trailing from it', 'tied to it']),
        `, exquisitely crafted`,
        ` inlaid with ${RND.item(['gold', 'silver', 'copper', 'brass'])}`,
      ]);
    }

    let name = `${blade.descriptor} ${this.name}`;

    return new MeleeWeapon(name, description, this.damage, this.hands, value);
  }
}
