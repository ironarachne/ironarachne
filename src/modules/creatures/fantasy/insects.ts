'use strict';

import Creature from '../creature';

export function all(): Creature[] {
  let behaviors = ['resting', 'hunting', 'exploring', 'wandering'];

  let creatures = [
    new Creature(
      'fire beetle',
      'fire beetles',
      '',
      ['glows with soft orange light'],
      ['wilderness', 'cave'],
      behaviors,
      ['beetle'],
      1,
    ),
    new Creature('giant ant', 'giant ants', '', [], ['wilderness'], behaviors, ['ant', 'swarm'], 1),
    new Creature(
      'giant bee',
      'giant bees',
      '',
      ['venomous sting'],
      ['wilderness'],
      behaviors,
      ['bee', 'flying', 'swarm'],
      2,
    ),
    new Creature(
      'giant beetle',
      'giant beetles',
      '',
      [],
      ['wilderness', 'cave', 'dungeon'],
      behaviors,
      ['beetle', 'swarm'],
      1,
    ),
    new Creature(
      'giant centipede',
      'giant centipedes',
      '',
      ['venomous bite'],
      ['wilderness', 'cave'],
      behaviors,
      ['centipede'],
      2,
    ),
    new Creature(
      'giant dragonfly',
      'giant dragonflies',
      '',
      [],
      ['wilderness'],
      behaviors,
      ['flying'],
      1,
    ),
    new Creature(
      'giant scorpion',
      'giant scorpions',
      '',
      ['deadly venomous sting'],
      ['wilderness', 'cave', 'dungeon'],
      behaviors,
      ['scorpion', 'arachnid'],
      3,
    ),
    new Creature(
      'giant spider',
      'giant spiders',
      '',
      ['deadly venomous bite'],
      ['wilderness', 'cave', 'dungeon'],
      behaviors,
      ['spider', 'arachnid'],
      3,
    ),
    new Creature(
      'rust monster',
      'rust monsters',
      '',
      ['rusts nonmagical metal it touches'],
      ['wilderness', 'cave', 'dungeon'],
      behaviors,
      [],
      3,
    ),
  ];

  for (let i = 0; i < creatures.length; i++) {
    creatures[i].tags.push(creatures[i].name);
    creatures[i].tags.push('insect');
  }

  return creatures;
}
