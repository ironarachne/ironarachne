'use strict';

import Creature from '../creature';

export function all(): Creature[] {
  let behaviors = ['gibbering', 'chittering', 'chattering', 'raging', 'resting'];

  let creatures = [
    new Creature(
      'hell hound',
      'hell hounds',
      '',
      ['immune to fire damage', 'breathe fire once an hour'],
      ['dungeon', 'hell'],
      ['resting', 'sleeping', 'hunting', 'stalking'],
      ['canine'],
      3,
    ),
    new Creature(
      `imp`,
      `imps`,
      '',
      ['shapeshift into animal', 'see in darkness', 'resistant to magic'],
      ['dungeon', 'hell'],
      behaviors,
      ['demon'],
      3,
    ),
    new Creature(
      `quasit`,
      `quasits`,
      '',
      ['shapeshift into insect', 'invisible at will, unless attacking', 'resistant to magic'],
      ['dungeon', 'hell'],
      behaviors,
      ['demon'],
      4,
    ),
  ];

  for (let i = 0; i < creatures.length; i++) {
    creatures[i].tags.push(creatures[i].name);
    creatures[i].tags.push('demonic');
  }

  return creatures;
}
