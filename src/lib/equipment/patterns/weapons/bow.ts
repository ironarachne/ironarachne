import type { RNG } from '@ironarachne/rng';
import * as Words from '@ironarachne/words';
import Component from '../../components/component.js';
import * as Components from '../../components/components.js';
import MeleeWeapon from '../../weapons/melee.js';
import RangedWeapon from '../../weapons/ranged.js';
import type Pattern from '../pattern.js';

export default class BowPattern implements Pattern {
  name: string;
  tags: string[];
  hands: number;
  baseValue: number;
  damage: string;

  constructor(name: string, hands: number, damage: string, value: number) {
    this.name = name;
    this.tags = [name, 'bow', 'ranged', 'martial weapon', 'weapon'];
    this.hands = hands;
    this.damage = damage;
    this.baseValue = value;
  }

  complete(componentOptions: Component[], quality: number, rng: RNG): MeleeWeapon {
    const body = rng.item(Components.withCategory('soft wood', componentOptions));
    const handle = rng.item(Components.withCategory('leather', componentOptions));

    const cosmeticBody = rng.item(['carved', 'heavy', 'light', 'simple']);

    const cosmeticHandle = rng.item(['short', 'long', 'comfortable']);

    let description = `${Words.article(this.name)} ${this.name} with `;

    description += rng.item([
      `${Words.article(body.descriptor)} ${body.descriptor} body`,
      `${Words.article(cosmeticBody)} ${cosmeticBody} ${body.descriptor} body`,
    ]);

    description += rng.item([
      ` and ${Words.article(handle.descriptor)} ${handle.descriptor} wrapped grip`,
      ` and ${Words.article(cosmeticHandle)} ${cosmeticHandle} ${handle.descriptor} wrapped grip`,
    ]);

    if (quality > 1) {
      description += rng.item([' and gilt highlights']);
    }

    const name = `${body.descriptor} ${this.name}`;

    const value = this.baseValue + body.value + handle.value;

    const tags = [name, this.name, 'bow', 'ranged', 'martial weapon', 'weapon'];

    return new RangedWeapon(
      name,
      description,
      this.damage,
      80,
      320,
      'arrow',
      this.hands,
      value,
      quality,
      tags,
    );
  }
}
