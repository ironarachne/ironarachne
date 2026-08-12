import * as RNG from '@ironarachne/rng';
import type { AdndClassApplyOptions } from '../adnd_class_apply_options.js';
import { assignRandomStartingSpellsForClass } from '../adnd_class_starting_spells.js';
import type ADNDCharacter from '../adndcharacter.js';
import type ADNDClass from '../adndclass.js';

const enchanter: ADNDClass = {
  name: 'enchanter',
  group: 'wizard',
  hitDice: '1d4',
  minStrength: -1,
  minDexterity: -1,
  minConstitution: -1,
  minIntelligence: 9,
  minWisdom: -1,
  minCharisma: 16,
  primeRequisites: ['intelligence'],
  abilities: ['Create magical items', 'Cast wizard spells'],
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
        requiredTags: ['enchantment', 'charm'],
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
        bannedTags: ['invocation', 'evocation', 'necromancy'],
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

export default enchanter;
