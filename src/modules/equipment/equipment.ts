'use strict';

import * as RND from '../random';
import * as Components from './components/components';
import * as Patterns from './patterns/patterns';
import * as Item from './item';

export function generate(
  category: string,
  components: Components.Component[],
  amount: number,
  valueThreshold: number,
): Item.Item[] {
  let result = [];
  let patterns = [];

  if (category == 'general') {
    patterns = Patterns.all();
  } else {
    patterns = Patterns.forCategory(category);
  }

  for (let i = 0; i < amount; i++) {
    let pattern = RND.item(patterns);
    let item = pattern.complete(components, valueThreshold);
    result.push(item);
  }

  return result;
}
