'use strict';

import EncounterGroupTemplate from '../../grouptemplate';
import EncounterTemplate from '../../template';
import * as Archetypes from '../../../archetypes/archetypes';
import * as FantasyArchetypes from '../../../archetypes/fantasy/all';
import MobFilter from '../../../mobs/filter';

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
          new MobFilter([], [], 'humanoid', '', ['undead']),
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
          new MobFilter(['enchanted'], [], 'construct', '', ['undead']),
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
          new MobFilter(['enchanted'], [], 'construct', '', ['undead']),
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
          new MobFilter([], [], 'humanoid', '', ['skeleton', 'zombie']),
          1,
          1,
        ),
      ],
      ['mage', 'magic'],
      5,
    ),
  ];
}
