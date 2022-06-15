'use strict';

import Archetype from '../../../archetypes/archetype';
import EncounterGroupTemplate from '../../grouptemplate';
import EncounterTemplate from '../../template';
import * as ItemGenerators from '../../../equipment/generators';

export function all(): EncounterTemplate[] {
  return [
    new EncounterTemplate(
      'swarming insects',
      3,
      [new EncounterGroupTemplate('swarming insects', 3, false, [], ['swarm'], [], 3, 8)],
      ['insects'],
      5,
    ),
    new EncounterTemplate(
      'wandering creature',
      2,
      [new EncounterGroupTemplate('wandering creature', 3, false, [], [], [], 1, 1)],
      ['wandering creature'],
      40,
    ),
    new EncounterTemplate(
      'group of wandering creatures',
      4,
      [new EncounterGroupTemplate('wandering creatures', 3, false, [], [], [], 2, 4)],
      ['wandering creature'],
      30,
    ),
  ];
}
