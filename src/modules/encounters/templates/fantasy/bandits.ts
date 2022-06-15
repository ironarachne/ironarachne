'use strict';

import EncounterGroupTemplate from '../../grouptemplate';
import EncounterTemplate from '../../template';
import * as ItemGenerators from '../../../equipment/generators';
import * as Archetypes from '../../../archetypes/archetypes';
import * as FantasyArchetypes from '../../../archetypes/fantasy/all';

export function all(): EncounterTemplate[] {
  let allArchetypes = FantasyArchetypes.all();
  return [
    new EncounterTemplate(
      'group of raiders',
      3,
      [
        new EncounterGroupTemplate(
          'raider captain',
          2,
          true,
          [Archetypes.byName('raider captain', allArchetypes)],
          ['martial'],
          ['undead'],
          1,
          1,
        ),
        new EncounterGroupTemplate(
          'raiders',
          3,
          true,
          [Archetypes.byName('raider', allArchetypes)],
          ['martial'],
          ['undead'],
          3,
          6,
        ),
      ],
      ['bandits'],
      5,
    ),
    new EncounterTemplate(
      'group of looters',
      3,
      [
        new EncounterGroupTemplate(
          'looters',
          3,
          true,
          [Archetypes.byName('thug', allArchetypes)],
          ['martial'],
          ['undead'],
          3,
          6,
        ),
      ],
      ['bandits'],
      5,
    ),
    new EncounterTemplate(
      'group of thugs',
      2,
      [
        new EncounterGroupTemplate(
          'thugs',
          2,
          true,
          [Archetypes.byName('thug', allArchetypes)],
          ['martial'],
          ['undead'],
          2,
          4,
        ),
      ],
      ['bandits'],
      5,
    ),
  ];
}
