'use strict';

import Creature from '../creature';

export function all(): Creature[] {
  let creatures = [
    new Creature('cave bear', 'cave bears', '', [], ['bear']),
    new Creature('dire bat', 'dire bats', '', [], ['bat', 'flying']),
    new Creature('dire bear', 'dire bears', '', [], ['bear']),
    new Creature('dire wolf', 'dire wolves', '', [], ['wolf']),
    new Creature('fire beetle', 'fire beetles', '', [], ['beetle', 'insect']),
    new Creature('giant bat', 'giant bats', '', [], ['bat', 'flying']),
    new Creature('giant bee', 'giant bees', '', [], ['bee', 'insect', 'flying']),
    new Creature('giant centipede', 'giant centipedes', '', [], ['centipede', 'insect']),
    new Creature('giant dragonfly', 'giant dragonflies', '', [], ['insect', 'flying']),
    new Creature('giant spider', 'giant spiders', '', [], ['spider', 'insect', 'arachnid']),
    new Creature('great eagle', 'great eagles', '', [], ['eagle', 'bird', 'flying']),
    new Creature('war dog', 'war dogs', '', [], ['dog', 'martial']),
  ];

  for (let i = 0; i < creatures.length; i++) {
    creatures[i].tags.push(creatures[i].name);
    creatures[i].tags.push('animal');
  }

  return creatures;
}
