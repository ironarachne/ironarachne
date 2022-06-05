'use strict';

import Archetype from '../../../archetypes/archetype';
import EncounterGroupTemplate from '../../grouptemplate';
import EncounterTemplate from '../../template';

export function all(): EncounterTemplate[] {
  return [
    new EncounterTemplate(
      'group of raiders',
      3,
      [
        new EncounterGroupTemplate(
          'raider captain',
          2,
          true,
          [new Archetype('raider captain', [], ['raider', 'martial'])],
          ['martial'],
          ['undead'],
          1,
          1,
        ),
        new EncounterGroupTemplate(
          'raiders',
          3,
          true,
          [new Archetype('raider', [], ['raider', 'martial'])],
          ['martial'],
          ['undead'],
          3,
          6,
        ),
      ],
      ['martial'],
    ),
    new EncounterTemplate(
      'group of looters',
      3,
      [
        new EncounterGroupTemplate(
          'looters',
          3,
          true,
          [new Archetype('looter', [], ['looter', 'martial'])],
          ['martial'],
          ['undead'],
          3,
          6,
        ),
      ],
      ['martial'],
    ),
    new EncounterTemplate(
      'group of hunters',
      3,
      [
        new EncounterGroupTemplate(
          'hunters',
          3,
          true,
          [new Archetype('hunter', [], ['hunter', 'martial'])],
          ['martial'],
          ['undead'],
          3,
          6,
        ),
      ],
      ['martial'],
    ),
    new EncounterTemplate(
      'swarming insects',
      3,
      [new EncounterGroupTemplate('swarming insects', 3, false, [], ['swarm'], [], 3, 8)],
      ['insect swarm'],
    ),
    new EncounterTemplate(
      'wandering creature',
      3,
      [new EncounterGroupTemplate('wandering creature', 3, false, [], [], [], 1, 1)],
      ['wandering creature'],
    ),
    new EncounterTemplate(
      'group of wandering creatures',
      5,
      [new EncounterGroupTemplate('wandering creatures', 3, false, [], [], [], 2, 4)],
      ['wandering creature'],
    ),
  ];
}
