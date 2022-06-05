'use strict';

import Archetype from '../../../archetypes/archetype';
import EncounterGroupTemplate from '../../grouptemplate';
import EncounterTemplate from '../../template';

export function all(): EncounterTemplate[] {
  return [
    new EncounterTemplate(
      'group of cult acolytes',
      1,
      [
        new EncounterGroupTemplate(
          'cult acolytes',
          1,
          true,
          [new Archetype('cult acolyte', [], ['cult', 'acolyte'])],
          ['cult', 'corruptible'],
          ['undead'],
          2,
          4,
        ),
      ],
      ['cult'],
    ),
    new EncounterTemplate(
      'group of lesser demons',
      2,
      [new EncounterGroupTemplate('lesser demons', 2, false, [], ['demon'], [], 2, 4)],
      ['cult', 'demonic'],
    ),
    new EncounterTemplate(
      'cult priest',
      2,
      [
        new EncounterGroupTemplate(
          'cult priest',
          2,
          true,
          [new Archetype('cult priest', [], ['priest', 'cult'])],
          ['cult', 'corruptible'],
          ['undead'],
          1,
          1,
        ),
      ],
      ['cult'],
    ),
  ];
}
