'use strict';

import Creature from '../creature';

export function all(): Creature[] {
  let behaviors = ['immobile', 'inert', 'guarding', 'watching', 'wandering'];

  let creatures = [
    new Creature(
      'amber golem',
      'amber golems',
      '',
      ['resistant to magic', 'cannot be polymorphed'],
      ['dungeon'],
      behaviors,
      ['enchanted', 'golem'],
      5,
    ),
    new Creature(
      'clay golem',
      'clay golems',
      '',
      ['immune to acid', 'cannot be polymorphed'],
      ['dungeon'],
      behaviors,
      ['enchanted', 'golem'],
      3,
    ),
    new Creature(
      'stone golem',
      'stone golems',
      '',
      ['resistant to fire', 'cannot be polymorphed'],
      ['dungeon'],
      behaviors,
      ['enchanted', 'golem'],
      3,
    ),
    new Creature(
      'iron golem',
      'iron golems',
      '',
      ['resistant to fire', 'cannot be polymorphed'],
      ['dungeon'],
      behaviors,
      ['enchanted', 'golem'],
      3,
    ),
    new Creature(
      'wood golem',
      'wood golems',
      '',
      ['cannot be polymorphed'],
      ['dungeon'],
      behaviors,
      ['enchanted', 'golem'],
      2,
    ),
    new Creature(
      'enchanted suit of armor',
      'enchanted suits of armor',
      '',
      [],
      ['dungeon'],
      behaviors,
      ['enchanted'],
      2,
    ),
    new Creature(
      'enchanted book',
      'enchanted books',
      '',
      ['cast a single minor spell'],
      ['dungeon'],
      behaviors,
      ['enchanted', 'flying'],
      1,
    ),
    new Creature(
      'lesser gargoyle',
      'lesser gargoyles',
      '',
      ['turn to stone at will'],
      ['dungeon'],
      behaviors,
      ['enchanted', 'gargoyle'],
      2,
    ),
    new Creature(
      'mimic',
      'mimics',
      '',
      ['resemble a chest or other large container at will'],
      ['dungeon'],
      behaviors,
      ['enchanted'],
      2,
    ),
    new Creature(
      `will o' the wisp`,
      `will o' the wisps`,
      '',
      ['glow with a bright light'],
      ['wilderness'],
      behaviors,
      ['light'],
      1,
    ),
  ];

  for (let i = 0; i < creatures.length; i++) {
    creatures[i].tags.push(creatures[i].name);
    creatures[i].tags.push('magic');
  }

  return creatures;
}
