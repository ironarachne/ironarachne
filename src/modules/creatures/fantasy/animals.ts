'use strict';

import Creature from '../creature';

export function all(): Creature[] {
  let behaviors = ['cautious', 'hunting', 'lethargic', 'resting', 'sleeping', 'stalking'];

  let creatures = [
    new Creature('cave bear', 'cave bears', '', [], ['wilderness', 'cave'], behaviors, ['bear'], 3),
    new Creature(
      'dire bat',
      'dire bats',
      '',
      [],
      ['wilderness', 'cave'],
      behaviors,
      ['bat', 'flying'],
      2,
    ),
    new Creature('dire bear', 'dire bears', '', [], ['wilderness', 'cave'], behaviors, ['bear'], 2),
    new Creature(
      'dire wolf',
      'dire wolves',
      '',
      [],
      ['wilderness'],
      behaviors,
      ['canine', 'wolf'],
      2,
    ),
    new Creature(
      'giant bat',
      'giant bats',
      '',
      [],
      ['wilderness', 'cave'],
      behaviors,
      ['bat', 'flying'],
      2,
    ),
    new Creature(
      'giant rat',
      'giant rats',
      '',
      [],
      ['city', 'dungeon', 'wilderness', 'cave'],
      behaviors,
      ['rat'],
      1,
    ),
    new Creature('goat', 'goats', '', [], ['wilderness'], behaviors, ['goat'], 1),
    new Creature(
      'great eagle',
      'great eagles',
      '',
      [],
      ['wilderness'],
      behaviors,
      ['eagle', 'bird', 'flying'],
      3,
    ),
    new Creature('horse', 'horses', '', [], ['wilderness'], behaviors, ['horse'], 1),
    new Creature('jaguar', 'jaguars', '', [], ['wilderness'], behaviors, ['feline'], 1),
    new Creature('lion', 'lions', '', [], ['wilderness'], behaviors, ['feline'], 1),
    new Creature('owlbear', 'owlbears', '', [], ['wilderness', 'cave'], behaviors, [], 3),
    new Creature('tiger', 'tigers', '', [], ['wilderness'], behaviors, ['feline'], 2),
    new Creature(
      'war dog',
      'war dogs',
      '',
      [],
      ['wilderness', 'cave', 'dungeon'],
      behaviors,
      ['canine', 'dog', 'martial'],
      1,
    ),
    new Creature('wild pig', 'wild pigs', '', [], ['wilderness'], behaviors, ['pig'], 1),
    new Creature('wolf', 'wolves', '', [], ['wilderness'], behaviors, ['canine', 'wolf'], 1),
  ];

  for (let i = 0; i < creatures.length; i++) {
    creatures[i].tags.push(creatures[i].name);
    creatures[i].tags.push('animal');
  }

  return creatures;
}
