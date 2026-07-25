import type * as RNG from '@ironarachne/rng';
import type { AdndClassApplyOptions } from '../adnd_class_apply_options.js';
import type ADNDCharacter from '../adndcharacter.js';
import ADNDClass from '../adndclass.js';

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
  function (
    this: ADNDClass,
    character: ADNDCharacter,
    _rng: RNG.RNG,
    _options?: AdndClassApplyOptions,
  ): ADNDCharacter {
    return character;
  },
);
