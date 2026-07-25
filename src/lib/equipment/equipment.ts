import type { RNG } from '@ironarachne/rng';
import Component from './components/component.js';
import type Item from './item.js';
import * as Patterns from './patterns/patterns.js';

export function generate(
  category: string,
  components: Component[],
  amount: number,
  valueThreshold: number,
  rng: RNG,
): Item[] {
  const result = [];
  let patterns = [];

  if (category == 'general') {
    patterns = Patterns.all();
  } else {
    patterns = Patterns.forCategory(category);
  }

  for (let i = 0; i < amount; i++) {
    const pattern = rng.item(patterns);
    const item = pattern.complete(components, valueThreshold, rng);
    result.push(item);
  }

  return result;
}
