'use strict';

import Creature from '../creature';

export function all(): Creature[] {
  let creatures = [new Creature(`will o' the wisp`, `will o' the wisps`, '', [], ['light'])];

  for (let i = 0; i < creatures.length; i++) {
    creatures[i].tags.push(creatures[i].name);
    creatures[i].tags.push('magic');
  }

  return creatures;
}
