'use strict';

import Creature from '../creature';

export function all(): Creature[] {
  let behaviors = ['gibbering', 'chittering', 'chattering', 'raging', 'resting'];

  let creatures = [
    new Creature(
      `dretch`,
      `dretches`,
      '',
      ['emit fetid cloud'],
      [],
      behaviors,
      ['fiend'],
      ['demon'],
      3,
    ),
    new Creature(
      'hell hound',
      'hell hounds',
      '',
      ['immune to fire damage', 'breathe fire once an hour'],
      [],
      ['resting', 'sleeping', 'hunting', 'stalking'],
      ['fiend'],
      ['canine'],
      3,
    ),
    new Creature(
      `imp`,
      `imps`,
      '',
      ['shapeshift into animal', 'see in darkness', 'resistant to magic'],
      [],
      behaviors,
      ['fiend'],
      ['demon'],
      3,
    ),
    new Creature(
      `lemure`,
      `lemures`,
      '',
      ['immune to fire', 'immune to poison'],
      [],
      behaviors,
      ['fiend'],
      ['demon'],
      1,
    ),
    new Creature(
      `quasit`,
      `quasits`,
      '',
      ['shapeshift into insect', 'invisible at will, unless attacking', 'resistant to magic'],
      [],
      behaviors,
      ['fiend'],
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
