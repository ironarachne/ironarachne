'use strict';

import Creature from '../creature';

export function all(): Creature[] {
  let behaviors = ['cautious', 'hunting', 'lethargic', 'resting', 'sleeping', 'stalking'];

  let creatures = [
    new Creature('cave bear', 'cave bears', '', [], ['wilderness', 'cave'], behaviors, ['bear']),
    new Creature('dire bat', 'dire bats', '', [], ['wilderness', 'cave'], behaviors, [
      'bat',
      'flying',
    ]),
    new Creature('dire bear', 'dire bears', '', [], ['wilderness', 'cave'], behaviors, ['bear']),
    new Creature('dire wolf', 'dire wolves', '', [], ['wilderness'], behaviors, ['canine', 'wolf']),
    new Creature('giant bat', 'giant bats', '', [], ['wilderness', 'cave'], behaviors, [
      'bat',
      'flying',
    ]),
    new Creature(
      'giant rat',
      'giant rats',
      '',
      [],
      ['city', 'dungeon', 'wilderness', 'cave'],
      behaviors,
      ['rat'],
    ),
    new Creature('great eagle', 'great eagles', '', [], ['wilderness'], behaviors, [
      'eagle',
      'bird',
      'flying',
    ]),
    new Creature('horse', 'horses', '', [], ['wilderness'], behaviors, ['horse']),
    new Creature('jaguar', 'jaguars', '', [], ['wilderness'], behaviors, ['feline']),
    new Creature('lion', 'lions', '', [], ['wilderness'], behaviors, ['feline']),
    new Creature('owlbear', 'owlbears', '', [], ['wilderness', 'cave'], behaviors, []),
    new Creature('tiger', 'tigers', '', [], ['wilderness'], behaviors, ['feline']),
    new Creature('war dog', 'war dogs', '', [], ['wilderness', 'cave', 'dungeon'], behaviors, [
      'canine',
      'dog',
      'martial',
    ]),
    new Creature('wild pig', 'wild pigs', '', [], ['wilderness'], behaviors, ['pig']),
    new Creature('wolf', 'wolves', '', [], ['wilderness'], behaviors, ['canine', 'wolf']),
  ];

  for (let i = 0; i < creatures.length; i++) {
    creatures[i].tags.push(creatures[i].name);
    creatures[i].tags.push('animal');
  }

  return creatures;
}
