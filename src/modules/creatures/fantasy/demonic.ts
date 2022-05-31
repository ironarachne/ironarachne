'use strict';

import Creature from '../creature';

export function all(): Creature[] {
  let creatures = [new Creature(`imp`, `imps`, '', [], ['demon'])];

  for (let i = 0; i < creatures.length; i++) {
    creatures[i].tags.push(creatures[i].name);
    creatures[i].tags.push('demonic');
  }

  return creatures;
}
