'use strict';

import Creature from '../creature';

export function all(): Creature[] {
  let behaviors = ['resting', 'hunting', 'wandering'];

  let creatures = [
    new Creature(
      `dust mephit`,
      `dust mephits`,
      '',
      ['explodes on death', 'blinding dust breath'],
      ['desert'],
      behaviors,
      ['elemental'],
      ['elemental'],
      1,
    ),
    new Creature(
      `ice mephit`,
      `ice mephits`,
      '',
      ['cast fog cloud', 'ice explosion on death', 'frost breath', 'immune to cold'],
      ['arctic'],
      behaviors,
      ['elemental'],
      ['elemental'],
      1,
    ),
    new Creature(
      `magma mephit`,
      `magma mephits`,
      '',
      ['cast heat metal', 'lava explosion on death', 'fire breath', 'immune to fire'],
      ['underdark'],
      behaviors,
      ['elemental'],
      ['elemental'],
      1,
    ),
    new Creature(
      `steam mephit`,
      `steam mephits`,
      '',
      [
        'cast blur',
        'steam explosion on death',
        'scalding steam breath',
        'immune to fire',
        'immune to poison',
      ],
      ['underwater'],
      behaviors,
      ['elemental'],
      ['elemental'],
      1,
    ),
  ];

  for (let i = 0; i < creatures.length; i++) {
    creatures[i].tags.push(creatures[i].name);
    creatures[i].tags.push('elemental');
  }

  return creatures;
}
