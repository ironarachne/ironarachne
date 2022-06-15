'use strict';

import * as Equipment from './equipment';
import * as Components from './components/components';
import type Item from './item';

export function getList(category: string, amount: number, valueThreshold: number): Item[] {
  let components = Components.all();

  let items = Equipment.generate(category, components, amount, valueThreshold);

  return items;
}
