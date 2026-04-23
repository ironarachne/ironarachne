import type { RNG } from '@ironarachne/rng';
import * as Words from '@ironarachne/words';
import Component from '../../components/component.js';
import * as Components from '../../components/components.js';
import MeleeWeapon from '../../weapons/melee.js';
import type Pattern from '../pattern.js';

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

  complete(componentOptions: Component[], quality: number, rng: RNG): MeleeWeapon {
    let head = rng.item(Components.withCategory('metal', componentOptions));
    let haft = rng.item(Components.withCategory('wood', componentOptions));
    let handle = rng.item(Components.withCategory('leather', componentOptions));

    let value = this.baseValue + head.value + haft.value + handle.value;

    let cosmeticHead = rng.item(['carved', 'spiked', 'heavy', 'large', 'dense']);

    let cosmeticHaft = rng.item(['straight', 'short', 'long']);

    let cosmeticHandle = rng.item(['short', 'long', 'comfortable', 'broad']);

    let description = `${Words.article(this.name)} ${this.name} with `;

    description += rng.item([
      `${Words.article(head.descriptor)} ${head.descriptor} head,`,
      `${Words.article(cosmeticHead)} ${cosmeticHead} ${head.descriptor} head,`,
    ]);

    description += rng.item([
      ` ${Words.article(haft.descriptor)} ${haft.descriptor} haft,`,
      ` ${Words.article(cosmeticHaft)} ${cosmeticHaft} ${haft.descriptor} haft,`,
    ]);

    description += rng.item([
      ` and ${Words.article(handle.descriptor)} ${handle.descriptor} wrapped handle`,
      ` and ${Words.article(cosmeticHandle)} ${cosmeticHandle} ${handle.descriptor} wrapped handle`,
    ]);

    let name = `${head.descriptor} ${this.name}`;

    let tags = [name, this.name, 'mace', 'melee', 'simple weapon', 'weapon'];

    return new MeleeWeapon(name, description, this.damage, this.hands, value, quality, tags);
  }
}
