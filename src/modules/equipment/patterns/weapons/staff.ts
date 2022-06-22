'use strict';

import * as Components from '../../components/components';
import * as Words from '../../../words';
import * as RND from '../../../random';
import random from 'random';
import type Pattern from '../pattern';
import Component from '../../components/component';
import MeleeWeapon from '../../weapons/melee';

export default class StaffPattern implements Pattern {
  name: string;
  tags: string[];
  hands: number;
  baseValue: number;
  damage: string;

  constructor(name: string, hands: number, damage: string, value: number) {
    this.name = name;
    this.tags = [name, 'staff', 'melee', 'simple weapon', 'weapon'];
    this.hands = hands;
    this.damage = damage;
    this.baseValue = value;
  }

  complete(componentOptions: Component[], minValue: number, maxValue: number): MeleeWeapon {
    let body = Components.getComponentForCategory('wood', componentOptions, minValue, maxValue);

    let cosmeticBody = RND.item(['carved', 'engraved', 'stained', 'painted']);

    let value = this.baseValue + body.value;

    let description = `${Words.article(this.name)} ${this.name} with `;

    description += RND.item([
      `${Words.article(body.descriptor)} ${body.descriptor} body`,
      `${Words.article(cosmeticBody)} ${cosmeticBody} ${body.descriptor} body`,
    ]);

    if (value > 3000 && random.int(1, 100) > 70) {
      description += RND.item([
        ` topped with a ${RND.item([
          'crystal globe',
          'raw crystal',
          'rough crystal',
          'polished crystal',
        ])}`,
        ` capped on top and bottom with ${RND.item([
          'steel',
          'gold',
          'silver',
          'bronze',
          'brass',
          'iron',
          'tin',
        ])}`,
      ]);
    }

    let name = `${body.descriptor} ${this.name}`;

    return new MeleeWeapon(name, description, this.damage, this.hands, value);
  }
}