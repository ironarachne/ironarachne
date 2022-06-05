'use strict';

import Archetype from '../../../archetypes/archetype';
import EncounterGroupTemplate from '../../grouptemplate';
import EncounterTemplate from '../../template';

export function all(): EncounterTemplate[] {
  return [
    new EncounterTemplate(
      'pack of skeletons',
      2,
      [
        new EncounterGroupTemplate(
          'skeletons',
          2,
          true,
          [
            new Archetype('warrior', [], ['martial']),
            new Archetype('archer', [], ['martial']),
            new Archetype('mage', [], ['magic']),
          ],
          ['skeleton'],
          [],
          3,
          6,
        ),
      ],
      ['skeleton', 'undead'],
    ),
    new EncounterTemplate(
      'pack of zombies',
      3,
      [
        new EncounterGroupTemplate(
          'zombies',
          3,
          true,
          [new Archetype('shambler', [], ['zombie']), new Archetype('sprinter', [], ['zombie'])],
          ['zombie'],
          [],
          3,
          6,
        ),
      ],
      ['zombie', 'undead'],
    ),
    new EncounterTemplate(
      'vampire',
      5,
      [
        new EncounterGroupTemplate(
          'vampire',
          5,
          true,
          [new Archetype('warrior', [], ['martial']), new Archetype('mage', [], ['magic'])],
          ['vampire'],
          [],
          1,
          1,
        ),
      ],
      ['vampire', 'undead'],
    ),
  ];
}
