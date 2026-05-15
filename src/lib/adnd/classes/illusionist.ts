import * as RNG from '@ironarachne/rng';
import type { AdndClassApplyOptions } from '../adnd_class_apply_options.js';
import { assignRandomStartingSpellsForClass } from '../adnd_class_starting_spells.js';
import type ADNDCharacter from '../adndcharacter.js';
import ADNDClass from '../adndclass.js';
import SpellFilter from '../spellfilter.js';

export default new ADNDClass(
  'illusionist',
  'wizard',
  '1d4',
  -1,
  16,
  -1,
  9,
  -1,
  -1,
  ['intelligence'],
  [
    'Create magical items',
    'Cast wizard spells (other than abjuration, invocation, evocation, or necromancy)',
  ],
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
  true,
  ['wizard'],
  [
    {
      filter: new SpellFilter('', 1, 'wizard', ['illusion'], []),
      count: 1,
    },
    {
      filter: new SpellFilter(
        '',
        1,
        'wizard',
        [],
        ['abjuration', 'invocation', 'evocation', 'necromancy'],
      ),
      count: 1,
    },
  ],
  ['dagger', 'staff', 'dart', 'knife', 'sling'],
  ['none'],
  1,
  4,
  -5,
  function (
    this: ADNDClass,
    character: ADNDCharacter,
    rng: RNG.RNG,
    options?: AdndClassApplyOptions,
  ): ADNDCharacter {
    if (options?.spells !== 'user') {
      assignRandomStartingSpellsForClass(this, character, rng);
    }
    return character;
  },
);
