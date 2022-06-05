'use strict';

import Creature from '../creature';

export function all(): Creature[] {
  let behaviors = ['gibbering', 'chittering', 'chattering', 'raging', 'resting'];

  let creatures = [
    new Creature(
      'hell hound',
      'hell hounds',
      '',
      [],
      ['dungeon', 'hell'],
      ['resting', 'sleeping', 'hunting', 'stalking'],
      ['canine'],
    ),
    new Creature(`imp`, `imps`, '', [], ['dungeon', 'hell'], behaviors, ['demon']),
    new Creature(`quasit`, `quasits`, '', [], ['dungeon', 'hell'], behaviors, ['demon']),
  ];

  for (let i = 0; i < creatures.length; i++) {
    creatures[i].tags.push(creatures[i].name);
    creatures[i].tags.push('demonic');
  }

  return creatures;
}
