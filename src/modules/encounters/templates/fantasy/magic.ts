'use strict';

import Archetype from '../../../archetypes/archetype';
import EncounterGroupTemplate from '../../grouptemplate';
import EncounterTemplate from '../../template';

export function all(): EncounterTemplate[] {
  return [
    new EncounterTemplate(
      "will o' the wisp",
      2,
      [new EncounterGroupTemplate("will o' the wisp", 2, false, [], ['magic'], [], 1, 1)],
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
          [],
          1,
          1,
        ),
      ],
      ['magic'],
    ),
  ];
}
