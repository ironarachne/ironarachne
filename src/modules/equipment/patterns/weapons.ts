'use strict';

import * as Components from '../components/components';
import * as ComponentCollection from '../components/collection';
import * as Item from '../item';
import * as Patterns from './patterns';
import * as Words from '../../words';
import * as RND from '../../random';
import random from 'random';

export function all(): Patterns.Pattern[] {
  return [
    new AxePattern('battleaxe', 1, '1d8', 1000),
    new AxePattern('greataxe', 1, '1d12', 3000),
    new AxePattern('handaxe', 1, '1d6', 500),
    new ClubPattern('club', 1, '1d4', 10),
    new ClubPattern('greatclub', 2, '1d8', 20),
    new StaffPattern('quarterstaff', 2, '1d6', 20),
    new StaffPattern('staff', 2, '1d6', 20),
    new SwordPattern('short sword', 1, '1d6', 1000),
    new SwordPattern('long sword', 1, '1d8', 1500),
    new SwordPattern('great sword', 2, '2d6', 5000),
  ];
}

export class AxePattern implements Patterns.Pattern {
  name: string;
  tags: string[];
  hands: number;
  baseValue: number;
  damage: string;

  constructor(name: string, hands: number, damage: string, value: number) {
    this.name = name;
    this.tags = [name, 'axe', 'weapon'];
    this.hands = hands;
    this.damage = damage;
    this.baseValue = value;
  }

  complete(componentOptions: Components.Component[], valueThreshold: number): Item.MeleeWeapon {
    let blade = ComponentCollection.getComponentForCategory(
      'hard metal',
      componentOptions,
      valueThreshold,
    );
    let handle = ComponentCollection.getComponentForCategory(
      'wood',
      componentOptions,
      valueThreshold,
    );

    let cosmeticBlade = RND.item([
      'serrated',
      'recently sharpened',
      'curved',
      'straight',
      'broad',
      'wide',
      'wickedly curved',
    ]);

    let cosmeticHandle = RND.item(['carved', 'padded', 'embossed', 'sanded']);

    let description = `${Words.article(this.name)} ${this.name} with `;

    description += RND.item([
      `${Words.article(blade.descriptor)} ${blade.descriptor} blade`,
      `${Words.article(cosmeticBlade)} ${cosmeticBlade} ${blade.descriptor} blade`,
    ]);

    description += RND.item([
      ` and ${handle.descriptor} handle`,
      ` and ${cosmeticHandle} ${handle.descriptor} handle`,
    ]);

    if (random.int(1, 100) > 70) {
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

    let value = this.baseValue + blade.value + handle.value;

    return new Item.MeleeWeapon(name, description, this.damage, this.hands, value);
  }
}

export class ClubPattern implements Patterns.Pattern {
  name: string;
  tags: string[];
  hands: number;
  baseValue: number;
  damage: string;

  constructor(name: string, hands: number, damage: string, value: number) {
    this.name = name;
    this.tags = [name, 'club', 'weapon'];
    this.hands = hands;
    this.damage = damage;
    this.baseValue = value;
  }

  complete(componentOptions: Components.Component[], valueThreshold: number): Item.MeleeWeapon {
    let body = ComponentCollection.getComponentForCategory(
      'wood',
      componentOptions,
      valueThreshold,
    );
    let handle = ComponentCollection.getComponentForCategory(
      'leather',
      componentOptions,
      valueThreshold,
    );

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

    return new Item.MeleeWeapon(name, description, this.damage, this.hands, value);
  }
}

export class StaffPattern implements Patterns.Pattern {
  name: string;
  tags: string[];
  hands: number;
  baseValue: number;
  damage: string;

  constructor(name: string, hands: number, damage: string, value: number) {
    this.name = name;
    this.tags = [name, 'staff', 'weapon'];
    this.hands = hands;
    this.damage = damage;
    this.baseValue = value;
  }

  complete(componentOptions: Components.Component[], valueThreshold: number): Item.MeleeWeapon {
    let body = ComponentCollection.getComponentForCategory(
      'wood',
      componentOptions,
      valueThreshold,
    );

    let cosmeticBody = RND.item(['carved', 'engraved', 'stained', 'painted']);

    let description = `${Words.article(this.name)} ${this.name} with `;

    description += RND.item([
      `${Words.article(body.descriptor)} ${body.descriptor} body`,
      `${Words.article(cosmeticBody)} ${cosmeticBody} ${body.descriptor} body`,
    ]);

    if (random.int(1, 100) > 70) {
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

    let value = this.baseValue + body.value;

    return new Item.MeleeWeapon(name, description, this.damage, this.hands, value);
  }
}

export class SwordPattern implements Patterns.Pattern {
  name: string;
  tags: string[];
  hands: number;
  baseValue: number;
  damage: string;

  constructor(name: string, hands: number, damage: string, value: number) {
    this.name = name;
    this.tags = [name, 'sword', 'weapon'];
    this.hands = hands;
    this.damage = damage;
    this.baseValue = value;
  }

  complete(componentOptions: Components.Component[], valueThreshold: number): Item.MeleeWeapon {
    let blade = ComponentCollection.getComponentForCategory(
      'hard metal',
      componentOptions,
      valueThreshold,
    );
    let hilt = ComponentCollection.getComponentForCategory(
      'hard metal',
      componentOptions,
      valueThreshold,
    );
    let handle = ComponentCollection.getComponentForCategory(
      'wood',
      componentOptions,
      valueThreshold,
    );

    let cosmeticBlade = RND.item([
      'serrated',
      'recently sharpened',
      'curved',
      'straight',
      'single-edged',
      'wide',
      'grooved',
    ]);

    let cosmeticHandle = RND.item(['carved', 'padded', 'embossed']);

    let cosmeticHilt = RND.item(['gem-studded', 'spiked', 'curved', 'inlaid']);

    let description = `${Words.article(this.name)} ${this.name} with `;

    description += RND.item([
      `${Words.article(blade.descriptor)} ${blade.descriptor} blade,`,
      `${Words.article(cosmeticBlade)} ${cosmeticBlade} ${blade.descriptor} blade,`,
    ]);

    description += RND.item([
      ` ${hilt.descriptor} hilt,`,
      ` ${cosmeticHilt} ${hilt.descriptor} hilt,`,
    ]);

    description += RND.item([
      ` and ${handle.descriptor} handle`,
      ` and ${cosmeticHandle} ${handle.descriptor} handle`,
    ]);

    if (random.int(1, 100) > 70) {
      description += RND.item([
        `, with a ` +
          RND.item(['yellow', 'blue', 'red', 'purple', 'green', 'grey', 'white', 'black']) +
          ` ribbon ` +
          RND.item(['wrapped around it', 'trailing from it', 'tied to it']),
        `, with a ${RND.item([
          'leather thong',
          RND.item(['gold', 'brass', 'silver', 'iron']) + ' chain',
        ])} attached to the pommel`,
        `, exquisitely crafted`,
        ` inlaid with ${RND.item(['gold', 'silver', 'copper', 'brass'])}`,
      ]);
    }

    let name = `${blade.descriptor} ${this.name}`;

    let value = this.baseValue + blade.value + hilt.value + handle.value;

    return new Item.MeleeWeapon(name, description, this.damage, this.hands, value);
  }
}
