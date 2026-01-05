import type { Decoration } from './equipment_types';

export const DECORATIONS: Record<string, Decoration> = {
  engraved: {
    name: 'Engraved',
    description: 'This item has intricate engravings.',
    valueMultiplier: 1.5,
    tagsAdded: ['engraved'],
  },
  jeweled: {
    name: 'Jeweled',
    description: 'This item is adorned with gemstones.',
    valueMultiplier: 5,
    tagsAdded: ['jeweled'],
  },
  ancient: {
    name: 'Ancient',
    description: 'This item is very old.',
    valueMultiplier: 2,
    tagsAdded: ['ancient'],
  },
  ceremonial: {
    name: 'Ceremonial',
    description: 'This item is intended for ceremonial use.',
    valueMultiplier: 3,
    tagsAdded: ['ceremonial'],
  },
  battle_worn: {
    name: 'Battle-worn',
    description: 'This item has seen many battles.',
    valueMultiplier: 0.8,
    tagsAdded: ['battle-worn'],
    tagsExcluded: ['ceremonial', 'jeweled'],
  },
  gilded: {
    name: 'Gilded',
    description: 'This item is plated with gold.',
    valueMultiplier: 3,
    tagsAdded: ['gilded'],
    tagsRequired: ['metal'],
  },
  runic: {
    name: 'Runic',
    description: 'This item is carved with runes.',
    valueMultiplier: 1.2,
    tagsAdded: ['runic'],
  },
  spiked: {
    name: 'Spiked',
    description: 'This item has decorative spikes.',
    valueMultiplier: 1.1,
    tagsAdded: ['spiked'],
    tagsRequired: ['armor'],
  },
  tattered: {
    name: 'Tattered',
    description: 'This item is torn and tattered.',
    valueMultiplier: 0.5,
    tagsAdded: ['tattered'],
    tagsRequired: ['cloth'],
  },
  pristine: {
    name: 'Pristine',
    description: 'This item looks brand new.',
    valueMultiplier: 1.5,
    tagsAdded: ['pristine'],
    tagsExcluded: ['battle-worn', 'tattered', 'rusty'],
  },
};
