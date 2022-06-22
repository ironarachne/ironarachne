'use strict';

import * as Components from '../../components/components';
import * as Words from '../../../words';
import * as RND from '../../../random';
import type Pattern from '../pattern';
import Component from '../../components/component';
import MeleeWeapon from '../../weapons/melee';

export default class MacePattern implements Pattern {
  name: string;
  tags: string[];
  hands: number;
  baseValue: number;
  damage: string;

  constructor(name: string, hands: number, damage: string, value: number) {
    this.name = name;
    this.tags = [name, 'mace', 'melee', 'simple weapon', 'weapon'];
    this.hands = hands;
    this.damage = damage;
    this.baseValue = value;
  }

  complete(componentOptions: Component[], minValue: number, maxValue: number): MeleeWeapon {
    let head = Components.getComponentForCategory('metal', componentOptions, minValue, maxValue);
    let haft = Components.getComponentForCategory('wood', componentOptions, minValue, maxValue);
    let handle = Components.getComponentForCategory(
      'leather',
      componentOptions,
      minValue,
      maxValue,
    );

    let value = this.baseValue + head.value + haft.value + handle.value;

    let cosmeticHead = RND.item(['carved', 'spiked', 'heavy', 'large', 'dense']);

    let cosmeticHaft = RND.item(['straight', 'short', 'long']);

    let cosmeticHandle = RND.item(['short', 'long', 'comfortable', 'broad']);

    let description = `${Words.article(this.name)} ${this.name} with `;

    description += RND.item([
      `${Words.article(head.descriptor)} ${head.descriptor} head,`,
      `${Words.article(cosmeticHead)} ${cosmeticHead} ${head.descriptor} head,`,
    ]);

    description += RND.item([
      ` ${Words.article(haft.descriptor)} ${haft.descriptor} haft,`,
      ` ${Words.article(cosmeticHaft)} ${cosmeticHaft} ${haft.descriptor} haft,`,
    ]);

    description += RND.item([
      ` and ${Words.article(handle.descriptor)} ${handle.descriptor} wrapped handle`,
      ` and ${Words.article(cosmeticHandle)} ${cosmeticHandle} ${handle.descriptor} wrapped handle`,
    ]);

    let name = `${head.descriptor} ${this.name}`;

    return new MeleeWeapon(name, description, this.damage, this.hands, value);
  }
}