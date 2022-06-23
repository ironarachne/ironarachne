'use strict';

import Creature from '../creature';

export function all(): Creature[] {
  let behaviors = ['hunting'];

  let creatures = [
    new Creature(
      'ghoul',
      'ghouls',
      '',
      [],
      ['swamp', 'underdark', 'urban'],
      behaviors,
      ['undead'],
      [],
      2,
    ),
    new Creature(
      'shadow',
      'shadows',
      '',
      [
        'amorphous',
        'immune to necrotic magic',
        'immune to poison',
        'see in the dark',
        'drain strength',
      ],
      ['swamp', 'underdark', 'urban'],
      behaviors,
      ['undead'],
      [],
      2,
    ),
    new Creature(
      `will o' the wisp`,
      `will o' the wisps`,
      '',
      ['glow with a bright light', 'become invisible'],
      ['forest'],
      behaviors,
      ['undead'],
      [],
      1,
    ),
  ];

  for (let i = 0; i < creatures.length; i++) {
    creatures[i].tags.push(creatures[i].name);
    creatures[i].tags.push('undead');
  }

  return creatures;
}
