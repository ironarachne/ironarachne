import * as RNG from '@ironarachne/rng';
import type { AdndClassApplyOptions } from '../adnd_class_apply_options.js';
import type ADNDCharacter from '../adndcharacter.js';
import ADNDClass from '../adndclass.js';

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
  (character: ADNDCharacter, _rng: RNG.RNG, _options?: AdndClassApplyOptions): ADNDCharacter =>
    character,
);
