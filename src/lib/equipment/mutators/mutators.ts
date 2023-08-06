"use strict";

import type ItemMutator from "./itemmutator.js";
import * as BladedWeapons from "./weapons/bladedweapons.js";

export function all(): ItemMutator[] {
  let results: ItemMutator[] = [];

  results = results.concat(BladedWeapons.all());

  return results;
}

export function withAnyTag(tags: string[], mutators: ItemMutator[]): ItemMutator[] {
  let result: ItemMutator[] = [];
  let names: string[] = [];

  for (let i = 0; i < mutators.length; i++) {
    for (let j = 0; j < tags.length; j++) {
      if (mutators[i].tags.includes(tags[j]) && !names.includes(mutators[i].name)) {
        result.push(mutators[i]);
        names.push(mutators[i].name);
        continue;
      }
    }
  }

  return result;
}

export function withTag(tag: string, mutators: ItemMutator[]): ItemMutator[] {
  let result: ItemMutator[] = [];

  for (let mutator of mutators) {
    if (mutator.tags.includes(tag)) {
      result.push(mutator);
    }
  }

  return result;
}
