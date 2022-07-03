'use strict';

import Component from '../components/component';
import type Item from '../item';

export default interface Pattern {
  name: string;
  tags: string[];
  baseValue: number;
  complete(componentOptions: Component[], quality: number): Item;
}
