import type { Refinement } from './equipment_types';

export const REFINEMENTS: Record<string, Refinement> = {
  polished: {
    name: 'polished',
    description: 'This item has been polished to a mirror sheen.',
    valueMultiplier: 1.2,
    tagsRequired: ['metal'],
    tagsAdded: ['polished'],
  },
  rusty: {
    name: 'rusty',
    description: 'This item is covered in rust.',
    valueMultiplier: 0.5,
    tagsAdded: ['rusty'],
    tagsRequired: ['metal'],
    tagsExcluded: ['polished'],
  },
  serrated: {
    name: 'serrated',
    description: 'The edge of this weapon has been serrated to cause more damage.',
    valueMultiplier: 1.1,
    statOffsets: {
      damage: 1,
    },
    tagsRequired: ['slashing'],
    tagsAdded: ['serrated'],
  },
  reinforced: {
    name: 'reinforced',
    description: 'This item has been reinforced with extra material.',
    weightMultiplier: 1.2,
    valueMultiplier: 1.1,
    statOffsets: {
      defense: 1,
    },
    tagsRequired: ['armor'],
    tagsAdded: ['reinforced'],
  },
  balanced: {
    name: 'balanced',
    description: 'This weapon has been carefully balanced.',
    valueMultiplier: 1.5,
    tagsRequired: ['weapon'],
    tagsAdded: ['balanced'],
  },
  heavy: {
    name: 'heavy',
    description: 'This item is heavier than normal.',
    weightMultiplier: 1.5,
    statOffsets: {
      damage: 2,
    },
    tagsRequired: ['weapon', 'bludgeoning'],
    tagsAdded: ['heavy'],
  },
  lightweight: {
    name: 'lightweight',
    description: 'This item has been shaved down to be lighter.',
    weightMultiplier: 0.8,
    valueMultiplier: 1.1,
    tagsAdded: ['lightweight'],
  },
  shoddy: {
    name: 'shoddy',
    description: 'This item was poorly made.',
    valueMultiplier: 0.5,
    tagsAdded: ['shoddy'],
  },
  masterwork: {
    name: 'masterwork',
    description: 'This item is of exceptional quality.',
    valueMultiplier: 5,
    tagsAdded: ['masterwork'],
    tagsExcluded: ['shoddy', 'rusty'],
  },
};
