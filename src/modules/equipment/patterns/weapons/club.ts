'use strict';

import * as Components from '../../components/components';
import * as Words from '../../../words';
import * as RND from '../../../random';
import type Pattern from '../pattern';
import Component from '../../components/component';
import MeleeWeapon from '../../weapons/melee';

export default class ClubPattern implements Pattern {
  name: string;
  tags: string[];
  hands: number;
  baseValue: number;
  damage: string;

  constructor(name: string, hands: number, damage: string, value: number) {
    this.name = name;
    this.tags = [name, 'club', 'melee', 'simple weapon', 'weapon'];
    this.hands = hands;
    this.damage = damage;
    this.baseValue = value;
  }

  complete(componentOptions: Component[], quality: number): MeleeWeapon {
    let body = RND.item(Components.withCategory('wood', componentOptions));
    let handle = RND.item(Components.withCategory('leather', componentOptions));

    let cosmeticBody = RND.item(['carved', 'spiked', 'heavy', 'bulbous', 'square']);

    let cosmeticHandle = RND.item(['short', 'long', 'comfortable', 'broad']);

    let description = `${Words.article(this.name)} ${this.name} with `;

    description += RND.item([
      `${Words.article(body.descriptor)} ${body.descriptor} body`,
      `${Words.article(cosmeticBody)} ${cosmeticBody} ${body.descriptor} body`,
    ]);

    description += RND.item([
      ` and ${Words.article(handle.descriptor)} ${handle.descriptor} wrapped handle`,
      ` and ${Words.article(cosmeticHandle)} ${cosmeticHandle} ${handle.descriptor} wrapped handle`,
    ]);

    let name = `${body.descriptor} ${this.name}`;

    let value = this.baseValue + body.value + handle.value;

    let tags = [name, this.name, 'club', 'melee', 'simple weapon', 'weapon'];

    return new MeleeWeapon(name, description, this.damage, this.hands, value, quality, tags);
  }
}
