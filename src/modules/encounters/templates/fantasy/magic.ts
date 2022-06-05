'use strict';

import Archetype from '../../../archetypes/archetype';
import EncounterGroupTemplate from '../../grouptemplate';
import EncounterTemplate from '../../template';

export function all(): EncounterTemplate[] {
  return [
    new EncounterTemplate(
      'enchanted object',
      2,
      [
        new EncounterGroupTemplate(
          'enchanted object',
          2,
          false,
          [],
          ['enchanted'],
          ['undead'],
          1,
          1,
        ),
      ],
      ['magic'],
    ),
    new EncounterTemplate(
      'enchanted objects',
      4,
      [
        new EncounterGroupTemplate(
          'group of enchanted objects',
          4,
          false,
          [],
          ['enchanted'],
          ['undead'],
          2,
          4,
        ),
      ],
      ['magic'],
    ),
    new EncounterTemplate(
      'mage',
      2,
      [
        new EncounterGroupTemplate(
          'mage',
          2,
          true,
          [new Archetype('mage', [], ['magic'])],
          ['magic'],
          ['zombie', 'skeleton'],
          1,
          1,
        ),
      ],
      ['magic'],
    ),
  ];
}
