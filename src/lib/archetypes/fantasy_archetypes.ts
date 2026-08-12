import type { Archetype } from './archetype_types';
import { FANTASY_COMBAT_ARCHETYPES } from './fantasy_combat_archetype_data';

export function getAllFantasyArchetypes(): Archetype[] {
  return [...getFantasyCombatArchetypes(), ...getFantasyNonCombatArchetypes()];
}

/**
 * The combat archetypes. The returned array is shared and must not be mutated.
 */
export function getFantasyCombatArchetypes(): Archetype[] {
  return FANTASY_COMBAT_ARCHETYPES;
}

export function getFantasyNonCombatArchetypes(): Archetype[] {
  return [
    {
      name: 'peasant',
      description: 'A common villager with no combat training.',
      basePowerModifier: 2,
      abilities: [
        {
          name: 'farming',
          description: 'Knowledge of agricultural practices.',
          category: 'labor',
          tags: ['farming', 'labor'],
        },
      ],
      actions: [],
      equipmentGenerationConfigs: [],
      addedTags: ['commoner'],
      tags: ['peasant', 'commoner'],
    },
    {
      name: 'merchant',
      description: 'A trader skilled in commerce and negotiation.',
      basePowerModifier: 3,
      abilities: [
        {
          name: 'bargaining',
          description: 'Negotiate better prices for goods.',
          category: 'commerce',
          tags: ['commerce', 'negotiation'],
        },
      ],
      actions: [],
      equipmentGenerationConfigs: [],
      addedTags: ['trader'],
      tags: ['merchant', 'commerce'],
    },
    {
      name: 'noble',
      description: 'A member of the aristocracy with influence and wealth.',
      basePowerModifier: 5,
      abilities: [
        {
          name: 'leadership',
          description: 'Inspire and lead others effectively.',
          category: 'social',
          tags: ['social', 'influence'],
        },
      ],
      actions: [],
      equipmentGenerationConfigs: [],
      addedTags: ['aristocrat'],
      tags: ['noble', 'influential'],
    },
  ];
}
