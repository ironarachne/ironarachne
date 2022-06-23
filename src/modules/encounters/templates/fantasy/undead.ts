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
      'lich',
      5,
      [
        new EncounterGroupTemplate(
          'lich',
          5,
          true,
          [Archetypes.byName('lich', allArchetypes)],
          new MobFilter(['magic'], [], 'humanoid', '', ['undead']),
          1,
          1,
        ),
      ],
      ['undead'],
      5,
    ),
    new EncounterTemplate(
      'necromancer',
      7,
      [
        new EncounterGroupTemplate(
          'necromancer',
          5,
          true,
          [Archetypes.byName('necromancer', allArchetypes)],
          new MobFilter(['magic'], [], 'humanoid', '', ['undead']),
          1,
          1,
        ),
        new EncounterGroupTemplate(
          'skeletons',
          2,
          true,
          [
            Archetypes.byName('warrior', allArchetypes),
            Archetypes.byName('soldier', allArchetypes),
            Archetypes.byName('guard', allArchetypes),
          ],
          new MobFilter(['skeleton'], [], '', '', []),
          3,
          6,
        ),
      ],
      ['mage', 'undead'],
      5,
    ),
    new EncounterTemplate(
      'pack of ghouls',
      5,
      [
        new EncounterGroupTemplate(
          'ghouls',
          3,
          false,
          [],
          new MobFilter(['ghoul'], [], '', '', []),
          2,
          4,
        ),
      ],
      ['undead'],
      5,
    ),
    new EncounterTemplate(
      'pack of undead',
      5,
      [
        new EncounterGroupTemplate(
          'undead',
          3,
          false,
          [],
          new MobFilter(['undead'], [], '', '', ['vampire']),
          2,
          4,
        ),
      ],
      ['undead'],
      5,
    ),
    new EncounterTemplate(
      'pack of skeletons',
      2,
      [
        new EncounterGroupTemplate(
          'skeletons',
          2,
          true,
          [
            Archetypes.byName('warrior', allArchetypes),
            Archetypes.byName('soldier', allArchetypes),
            Archetypes.byName('guard', allArchetypes),
          ],
          new MobFilter(['skeleton'], [], '', '', []),
          3,
          6,
        ),
      ],
      ['skeleton', 'undead'],
      10,
    ),
    new EncounterTemplate(
      'pack of zombies',
      3,
      [
        new EncounterGroupTemplate(
          'zombies',
          3,
          true,
          [
            Archetypes.byName('shambler', allArchetypes),
            Archetypes.byName('sprinter', allArchetypes),
          ],
          new MobFilter(['zombie'], [], '', '', []),
          3,
          6,
        ),
      ],
      ['zombie', 'undead'],
      10,
    ),
    new EncounterTemplate(
      'vampire',
      5,
      [
        new EncounterGroupTemplate(
          'vampire',
          5,
          true,
          [Archetypes.byName('warrior', allArchetypes)],
          new MobFilter(['vampire'], [], '', '', []),
          1,
          1,
        ),
      ],
      ['vampire', 'undead'],
      2,
    ),
  ];
}
