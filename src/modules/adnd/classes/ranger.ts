'use strict';

import ADNDCharacter from '../adndcharacter';
import ADNDClass from '../adndclass';

export default new ADNDClass(
  'ranger',
  'warrior',
  '1d10',
  13,
  13,
  14,
  -1,
  14,
  -1,
  ['strength', 'dexterity', 'wisdom'],
  [
    'When wearing studded leather or lighter armor, fight two-handed with no penalty',
    'Tracking proficiency',
    'When wearing studded leather or lighter armor, 10% chance to move silently',
    'When wearing studded leather or lighter armor, 15% chance to hide in shadows',
    'Adept with both trained and untamed creatures',
  ],
  ['lawful good', 'neutral good', 'chaotic good'],
  false,
  [],
  [],
  ['any'],
  ['any'],
  4,
  3,
  -2,
  function (character: ADNDCharacter): ADNDCharacter {
    return character;
  },
);
