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
      'archmage',
      5,
      [
        new EncounterGroupTemplate(
          'archmage',
          5,
          true,
          [Archetypes.byName('archmage', allArchetypes)],
          [],
          ['undead'],
          1,
          1,
        ),
      ],
      ['mage', 'magic'],
      1,
    ),
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
      3,
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
      2,
    ),
    new EncounterTemplate(
      'mage',
      2,
      [
        new EncounterGroupTemplate(
          'mage',
          2,
          true,
          [Archetypes.byName('mage', allArchetypes)],
          ['magic'],
          ['zombie', 'skeleton'],
          1,
          1,
        ),
      ],
      ['mage', 'magic'],
      5,
    ),
  ];
}
