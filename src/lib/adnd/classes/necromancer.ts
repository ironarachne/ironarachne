import * as RNG from '@ironarachne/rng';
import type { AdndClassApplyOptions } from '../adnd_class_apply_options.js';
import { assignRandomStartingSpellsForClass } from '../adnd_class_starting_spells.js';
import type ADNDCharacter from '../adndcharacter.js';
import type ADNDClass from '../adndclass.js';

const necromancer: ADNDClass = {
  name: 'necromancer',
  group: 'wizard',
  hitDice: '1d4',
  minStrength: -1,
  minDexterity: -1,
  minConstitution: -1,
  minIntelligence: 9,
  minWisdom: 16,
  minCharisma: -1,
  primeRequisites: ['intelligence'],
  abilities: [
    'Create magical items',
    'Cast wizard spells (other than illusion, enchantment, or charm)',
  ],
  allowedAlignments: [
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
  hasSpells: true,
  allowedSpellTypes: ['wizard'],
  spellList: [
    {
      filter: {
        name: '',
        level: 1,
        casterClass: 'wizard',
        requiredTags: ['necromancy'],
        bannedTags: [],
      },
      count: 1,
    },
    {
      filter: {
        name: '',
        level: 1,
        casterClass: 'wizard',
        requiredTags: [],
        bannedTags: ['enchantment', 'charm', 'illusion'],
      },
      count: 1,
    },
  ],
  allowedWeapons: ['dagger', 'staff', 'dart', 'knife', 'sling'],
  allowedArmor: ['none'],
  initialWP: 1,
  initialNWP: 4,
  wpPenalty: -5,
  apply: function (
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
};

export default necromancer;
