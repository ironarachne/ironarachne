'use strict';

import type ItemMutator from './itemmutator';
import * as BladedWeapons from './weapons/bladedweapons';

export function all(): ItemMutator[] {
  let results = [];

  results = results.concat(BladedWeapons.all());

  return results;
}

export function withAnyTag(tags: string[], mutators: ItemMutator[]): ItemMutator[] {
  let result = [];
  let names = [];

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
  let result = [];

  for (let mutator of mutators) {
    if (mutator.tags.includes(tag)) {
      result.push(mutator);
    }
  }

  return result;
}
