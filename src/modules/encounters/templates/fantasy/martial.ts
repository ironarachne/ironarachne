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
      'squad of soldiers',
      1,
      [
        new EncounterGroupTemplate(
          'soldiers',
          1,
          true,
          [Archetypes.byName('soldier', allArchetypes)],
          new MobFilter(['martial'], [], 'humanoid', '', ['undead']),
          2,
          4,
        ),
      ],
      ['martial', 'soldiers'],
      10,
    ),
    new EncounterTemplate(
      'squad of veterans',
      2,
      [
        new EncounterGroupTemplate(
          'veteran soldiers',
          2,
          true,
          [Archetypes.byName('veteran soldier', allArchetypes)],
          new MobFilter(['martial'], [], 'humanoid', '', ['undead']),
          2,
          4,
        ),
      ],
      ['martial', 'soldiers'],
      5,
    ),
    new EncounterTemplate(
      'captain',
      4,
      [
        new EncounterGroupTemplate(
          'captain',
          2,
          true,
          [Archetypes.byName('captain', allArchetypes)],
          new MobFilter(['martial'], [], 'humanoid', '', ['undead']),
          1,
          1,
        ),
        new EncounterGroupTemplate(
          'veteran soldiers',
          2,
          true,
          [Archetypes.byName('veteran soldier', allArchetypes)],
          new MobFilter(['martial'], [], 'humanoid', '', ['undead']),
          2,
          4,
        ),
      ],
      ['martial', 'soldiers'],
      3,
    ),
    new EncounterTemplate(
      'general',
      5,
      [
        new EncounterGroupTemplate(
          'general',
          3,
          true,
          [Archetypes.byName('general', allArchetypes)],
          new MobFilter(['martial'], [], 'humanoid', '', ['undead']),
          1,
          1,
        ),
        new EncounterGroupTemplate(
          'captain',
          2,
          true,
          [Archetypes.byName('captain', allArchetypes)],
          new MobFilter(['martial'], [], 'humanoid', '', ['undead']),
          1,
          2,
        ),
      ],
      ['martial', 'soldiers'],
      2,
    ),
  ];
}
