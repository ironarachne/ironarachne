'use strict';

import Archetype from '../../../archetypes/archetype';
import EncounterGroupTemplate from '../../grouptemplate';
import EncounterTemplate from '../../template';

export function all(): EncounterTemplate[] {
  return [
    new EncounterTemplate(
      'squad of soldiers',
      1,
      [
        new EncounterGroupTemplate(
          'soldiers',
          1,
          true,
          [new Archetype('soldier', [], ['soldier', 'martial'])],
          ['martial'],
          [],
          2,
          4,
        ),
      ],
      ['martial'],
    ),
    new EncounterTemplate(
      'squad of veterans',
      2,
      [
        new EncounterGroupTemplate(
          'veteran soldiers',
          2,
          true,
          [new Archetype('veteran soldier', [], ['soldier', 'martial'])],
          ['martial'],
          [],
          2,
          4,
        ),
      ],
      ['martial'],
    ),
    new EncounterTemplate(
      'captain',
      2,
      [
        new EncounterGroupTemplate(
          'captain',
          2,
          true,
          [new Archetype('captain', [], ['soldier', 'martial'])],
          ['martial'],
          [],
          1,
          1,
        ),
      ],
      ['martial'],
    ),
  ];
}
