'use strict';

import Armor from '../../armor/armor';
import Component from '../../components/component';
import type Pattern from '../pattern';
import * as Components from '../../components/components';
import * as RND from '../../../random';
import * as Words from '../../../words';

export default class ChainmailPattern implements Pattern {
  name: string;
  tags: string[];
  baseValue: number;

  constructor(name: string, value: number) {
    this.name = name;
    this.tags = [name, 'body armor', 'armor'];
    this.baseValue = value;
  }

  complete(componentOptions: Component[], minValue: number, maxValue: number): Armor {
    let body = Components.getComponentForCategory(
      'hard metal',
      componentOptions,
      minValue,
      maxValue,
    );

    let value = this.baseValue + body.value * 500;

    let description = RND.item([
      `${Words.article(this.name)} ${this.name} made of ${body.descriptor}`,
      `${Words.article(this.name)} ${this.name} made of ${RND.item([
        'loose ',
        'tight ',
        'dense ',
        'heavy ',
        '',
      ])}${body.descriptor} rings`,
      `${Words.article(body.descriptor)} ${body.descriptor} ${this.name}`,
    ]);

    let name = `${body.descriptor} ${this.name}`;

    let armorClass = 16;

    return new Armor(name, description, 'torso', armorClass, value);
  }
}
