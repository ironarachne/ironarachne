'use strict';

import ADNDCharacter from '../adndcharacter';
import ADNDClass from '../adndclass';

export default new ADNDClass(
  'fighter',
  'warrior',
  '1d10',
  9,
  -1,
  -1,
  -1,
  -1,
  -1,
  ['strength'],
  [],
  [
    'lawful good',
    'lawful neutral',
    'lawful evil',
    'neutral good',
    'true neutral',
    'neutral evil',
    'chaotic evil',
    'chaotic neutral',
    'chaotic good',
  ],
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
