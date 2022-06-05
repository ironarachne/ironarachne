'use strict';

import Creature from '../creature';

export function all(): Creature[] {
  let behaviors = ['resting', 'hunting', 'exploring', 'wandering'];

  let creatures = [
    new Creature('fire beetle', 'fire beetles', '', [], ['wilderness', 'cave'], behaviors, [
      'beetle',
    ]),
    new Creature('giant ant', 'giant ants', '', [], ['wilderness'], behaviors, ['ant', 'swarm']),
    new Creature('giant bee', 'giant bees', '', [], ['wilderness'], behaviors, [
      'bee',
      'flying',
      'swarm',
    ]),
    new Creature(
      'giant beetle',
      'giant beetles',
      '',
      [],
      ['wilderness', 'cave', 'dungeon'],
      behaviors,
      ['beetle', 'swarm'],
    ),
    new Creature('giant centipede', 'giant centipedes', '', [], ['wilderness', 'cave'], behaviors, [
      'centipede',
    ]),
    new Creature('giant dragonfly', 'giant dragonflies', '', [], ['wilderness'], behaviors, [
      'flying',
    ]),
    new Creature(
      'giant scorpion',
      'giant scorpions',
      '',
      [],
      ['wilderness', 'cave', 'dungeon'],
      behaviors,
      ['scorpion', 'arachnid'],
    ),
    new Creature(
      'giant spider',
      'giant spiders',
      '',
      [],
      ['wilderness', 'cave', 'dungeon'],
      behaviors,
      ['spider', 'arachnid'],
    ),
    new Creature(
      'rust monster',
      'rust monsters',
      '',
      [],
      ['wilderness', 'cave', 'dungeon'],
      behaviors,
      [],
    ),
  ];

  for (let i = 0; i < creatures.length; i++) {
    creatures[i].tags.push(creatures[i].name);
    creatures[i].tags.push('insect');
  }

  return creatures;
}
