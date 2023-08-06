"use strict";

import * as RND from "@ironarachne/rng";
import Component from "./components/component.js";
import type Item from "./item.js";
import * as Patterns from "./patterns/patterns.js";

export function generate(
  category: string,
  components: Component[],
  amount: number,
  valueThreshold: number,
): Item[] {
  let result = [];
  let patterns = [];

  if (category == "general") {
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
