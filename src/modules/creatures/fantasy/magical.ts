'use strict';

import Creature from '../creature';

export function all(): Creature[] {
  let behaviors = ['immobile', 'inert', 'guarding', 'watching', 'wandering'];

  let creatures = [
    new Creature('clay golem', 'clay golems', '', [], ['dungeon'], behaviors, ['enchanted']),
    new Creature('stone golem', 'stone golems', '', [], ['dungeon'], behaviors, ['enchanted']),
    new Creature('iron golem', 'iron golems', '', [], ['dungeon'], behaviors, ['enchanted']),
    new Creature('wood golem', 'wood golems', '', [], ['dungeon'], behaviors, ['enchanted']),
    new Creature(
      'enchanted suit of armor',
      'enchanted suits of armor',
      '',
      [],
      ['dungeon'],
      behaviors,
      ['enchanted'],
    ),
    new Creature('enchanted book', 'enchanted books', '', [], ['dungeon'], behaviors, [
      'enchanted',
    ]),
    new Creature('lesser gargoyle', 'lesser gargoyles', '', [], ['dungeon'], behaviors, [
      'enchanted',
      'gargoyle',
    ]),
    new Creature('mimic', 'mimics', '', [], ['dungeon'], behaviors, ['enchanted']),
    new Creature(`will o' the wisp`, `will o' the wisps`, '', [], ['wilderness'], behaviors, [
      'light',
    ]),
  ];

  for (let i = 0; i < creatures.length; i++) {
    creatures[i].tags.push(creatures[i].name);
    creatures[i].tags.push('magic');
  }

  return creatures;
}
