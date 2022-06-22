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
      'group of raiders',
      3,
      [
        new EncounterGroupTemplate(
          'raider captain',
          2,
          true,
          [Archetypes.byName('raider captain', allArchetypes)],
          new MobFilter(['martial'], [], 'humanoid', '', ['undead']),
          1,
          1,
        ),
        new EncounterGroupTemplate(
          'raiders',
          3,
          true,
          [Archetypes.byName('raider', allArchetypes)],
          new MobFilter(['martial'], [], 'humanoid', '', ['undead']),
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
          new MobFilter(['martial'], [], 'humanoid', '', ['undead']),
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
          new MobFilter(['martial'], [], 'humanoid', '', ['undead']),
          2,
          4,
        ),
      ],
      ['bandits'],
      5,
    ),
  ];
}
