'use strict';

import Creature from '../creature';

export function all(): Creature[] {
  let behaviors = ['waiting', 'hunting', 'wandering'];

  let creatures = [
    new Creature('black pudding', 'black puddings', '', [], ['dungeon', 'cave'], behaviors, []),
    new Creature('blue jelly', 'blue jellies', '', [], ['dungeon', 'cave'], behaviors, []),
    new Creature('blue slime', 'blue slimes', '', [], ['dungeon', 'cave'], behaviors, []),
    new Creature('brown pudding', 'brown puddings', '', [], ['dungeon', 'cave'], behaviors, []),
    new Creature('gelatinous cube', 'gelatinous cubes', '', [], ['dungeon'], behaviors, []),
    new Creature('green slime', 'green slimes', '', [], ['dungeon', 'cave'], behaviors, []),
    new Creature('ochre jelly', 'ochre jellies', '', [], ['dungeon', 'cave'], behaviors, []),
  ];

  for (let i = 0; i < creatures.length; i++) {
    creatures[i].tags.push(creatures[i].name);
    creatures[i].tags.push('ooze');
  }

  return creatures;
}
