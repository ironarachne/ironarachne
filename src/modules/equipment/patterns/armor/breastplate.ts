'use strict';

import Armor from '../../armor/armor';
import Component from '../../components/component';
import type Pattern from '../pattern';
import * as Components from '../../components/components';
import * as RND from '../../../random';
import * as Words from '../../../words';
import random from 'random';

export default class BreastplatePattern implements Pattern {
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
    let trim = Components.getComponentForCategory(
      'soft metal',
      componentOptions,
      minValue,
      maxValue,
    );

    let value = this.baseValue + body.value * 1000 + trim.value;

    let description = RND.item([
      `${Words.article(this.name)} ${this.name} made of ${body.descriptor}`,
      `${Words.article(body.descriptor)} ${body.descriptor} ${this.name} `,
    ]);

    description += RND.item([
      ` with ${trim.descriptor} ${RND.item(['trim', 'edging'])}`,
      ` trimmed with ${trim.descriptor}`,
      ` decorated with ${trim.descriptor} edging`,
    ]);

    if (value > 10000 && random.int(1, 100) >= 70) {
      description += RND.item([
        ` with overlapping plates`,
        ` with rolled edges`,
        ` with ornate engravings`,
      ]);
    }

    let name = `${body.descriptor} ${this.name}`;

    let armorClass = 14;

    return new Armor(name, description, 'torso', armorClass, value);
  }
}
