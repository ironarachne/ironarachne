'use strict';

import Creature from '../creature';

export function all(): Creature[] {
  let behaviors = ['waiting', 'hunting', 'wandering', 'clinging to the ceiling'];

  let creatures = [
    new Creature(
      'black pudding',
      'black puddings',
      '',
      ['dissolve nonmagical metal things', 'amorphous', 'climb walls and ceilings'],
      ['dungeon', 'cave'],
      behaviors,
      [],
      2,
    ),
    new Creature(
      'blue jelly',
      'blue jellies',
      '',
      ['amorphous', 'climb walls and ceilings'],
      ['dungeon', 'cave'],
      behaviors,
      [],
      1,
    ),
    new Creature(
      'blue slime',
      'blue slimes',
      '',
      ['amorphous', 'climb walls and ceilings'],
      ['dungeon', 'cave'],
      behaviors,
      [],
      1,
    ),
    new Creature(
      'brown pudding',
      'brown puddings',
      '',
      ['amorphous', 'climb walls and ceilings'],
      ['dungeon', 'cave'],
      behaviors,
      [],
      1,
    ),
    new Creature(
      'gelatinous cube',
      'gelatinous cubes',
      '',
      ['dissolve nonmetal things'],
      ['dungeon'],
      ['waiting', 'wandering'],
      [],
      3,
    ),
    new Creature(
      'green slime',
      'green slimes',
      '',
      ['amorphous', 'climb walls and ceilings'],
      ['dungeon', 'cave'],
      behaviors,
      [],
      1,
    ),
    new Creature(
      'ochre jelly',
      'ochre jellies',
      '',
      ['amorphous', 'climb walls and ceilings', 'split in half when hit with lightning'],
      ['dungeon', 'cave'],
      behaviors,
      [],
      2,
    ),
  ];

  for (let i = 0; i < creatures.length; i++) {
    creatures[i].tags.push(creatures[i].name);
    creatures[i].tags.push('ooze');
  }

  return creatures;
}
