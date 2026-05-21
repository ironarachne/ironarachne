import * as RNG from '@ironarachne/rng';
import type { AdndClassApplyOptions } from '../adnd_class_apply_options.js';
import { assignRandomStartingSpellsForClass } from '../adnd_class_starting_spells.js';
import type ADNDCharacter from '../adndcharacter.js';
import ADNDClass from '../adndclass.js';
import SpellFilter from '../spellfilter.js';

export default new ADNDClass(
  'druid',
  'priest',
  '1d8',
  -1,
  -1,
  -1,
  -1,
  12,
  15,
  ['wisdom'],
  [
    'Cast priest spells',
    'Speak druidic',
    '+2 bonus to saving throws vs. fire or electrical attacks',
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
  ['priest'],
  [
    {
      filter: new SpellFilter(
        '',
        1,
        'priest',
        ['plant', 'animal', 'healing', 'weather', 'elemental'],
        [],
      ),
      count: 1,
    },
  ],
  ['club', 'sickle', 'spear', 'scimitar', 'dagger', 'staff', 'dart', 'sling'],
  ['leather', 'studded leather', 'wooden shield'],
  2,
  4,
  -3,
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
