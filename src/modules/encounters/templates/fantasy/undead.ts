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
      'lich',
      5,
      [
        new EncounterGroupTemplate(
          'lich',
          5,
          true,
          [Archetypes.byName('lich', allArchetypes)],
          [],
          ['undead'],
          1,
          1,
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
          ['skeleton'],
          [],
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
          ['zombie'],
          [],
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
          ['vampire'],
          [],
          1,
          1,
        ),
      ],
      ['vampire', 'undead'],
      2,
    ),
  ];
}
