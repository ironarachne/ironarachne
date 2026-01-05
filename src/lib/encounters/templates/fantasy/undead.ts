import * as Archetypes from '$lib/archetypes/archetypes.js';
import * as FantasyArchetypes from '$lib/archetypes/fantasy/all.js';
import { SpeciesFilter } from '$lib/species/filter.js';
import type EncounterTemplate from '../../encounter_template.js';

export function all(): EncounterTemplate[] {
  let allArchetypes = FantasyArchetypes.all();

  return [
    {
      name: 'lich',
      threatLevel: 5,
      groupTemplates: [
        {
          name: 'lich',
          threatLevel: 5,
          isSentient: true,
          archetypes: [Archetypes.byName('lich', allArchetypes)],
          filter: new SpeciesFilter([], [], 'humanoid', '', ['undead']),
          minNumber: 1,
          maxNumber: 1,
        },
      ],
      tags: ['undead'],
      commonality: 5,
    },
    {
      name: 'necromancer',
      threatLevel: 7,
      groupTemplates: [
        {
          name: 'necromancer',
          threatLevel: 5,
          isSentient: true,
          archetypes: [Archetypes.byName('necromancer', allArchetypes)],
          filter: new SpeciesFilter([], [], 'humanoid', '', ['undead']),
          minNumber: 1,
          maxNumber: 1,
        },
        {
          name: 'skeletons',
          threatLevel: 2,
          isSentient: true,
          archetypes: [
            Archetypes.byName('warrior', allArchetypes),
            Archetypes.byName('soldier', allArchetypes),
            Archetypes.byName('guard', allArchetypes),
          ],
          filter: new SpeciesFilter(['skeleton'], [], '', '', []),
          minNumber: 3,
          maxNumber: 6,
        },
      ],
      tags: ['mage', 'undead'],
      commonality: 5,
    },
    {
      name: 'pack of ghouls',
      threatLevel: 5,
      groupTemplates: [
        {
          name: 'ghouls',
          threatLevel: 3,
          isSentient: false,
          archetypes: [],
          filter: new SpeciesFilter(['ghoul'], [], '', '', []),
          minNumber: 2,
          maxNumber: 4,
        },
      ],
      tags: ['undead'],
      commonality: 5,
    },
    {
      name: 'pack of undead',
      threatLevel: 5,
      groupTemplates: [
        {
          name: 'undead',
          threatLevel: 3,
          isSentient: false,
          archetypes: [],
          filter: new SpeciesFilter(['undead'], [], '', '', ['vampire']),
          minNumber: 2,
          maxNumber: 4,
        },
      ],
      tags: ['undead'],
      commonality: 5,
    },
    {
      name: 'pack of skeletons',
      threatLevel: 2,
      groupTemplates: [
        {
          name: 'skeletons',
          threatLevel: 2,
          isSentient: true,
          archetypes: [
            Archetypes.byName('warrior', allArchetypes),
            Archetypes.byName('soldier', allArchetypes),
            Archetypes.byName('guard', allArchetypes),
          ],
          filter: new SpeciesFilter(['skeleton'], [], '', '', []),
          minNumber: 3,
          maxNumber: 6,
        },
      ],
      tags: ['skeleton', 'undead'],
      commonality: 10,
    },
    {
      name: 'pack of zombies',
      threatLevel: 3,
      groupTemplates: [
        {
          name: 'zombies',
          threatLevel: 3,
          isSentient: true,
          archetypes: [
            Archetypes.byName('shambler', allArchetypes),
            Archetypes.byName('sprinter', allArchetypes),
          ],
          filter: new SpeciesFilter(['zombie'], [], '', '', []),
          minNumber: 3,
          maxNumber: 6,
        },
      ],
      tags: ['zombie', 'undead'],
      commonality: 10,
    },
    {
      name: 'vampire',
      threatLevel: 5,
      groupTemplates: [
        {
          name: 'vampire',
          threatLevel: 5,
          isSentient: true,
          archetypes: [Archetypes.byName('warrior', allArchetypes)],
          filter: new SpeciesFilter(['vampire'], [], '', '', []),
          minNumber: 1,
          maxNumber: 1,
        },
      ],
      tags: ['vampire', 'undead'],
      commonality: 2,
    },
  ];
}
