import type * as RNG from '@ironarachne/rng';
import type { AdndClassApplyOptions } from '../adnd_class_apply_options.js';
import type ADNDCharacter from '../adndcharacter.js';
import type ADNDClass from '../adndclass.js';

const ranger: ADNDClass = {
  name: 'ranger',
  group: 'warrior',
  hitDice: '1d10',
  minStrength: 13,
  minDexterity: 13,
  minConstitution: 14,
  minIntelligence: -1,
  minWisdom: 14,
  minCharisma: -1,
  primeRequisites: ['strength', 'dexterity', 'wisdom'],
  abilities: [
    'When wearing studded leather or lighter armor, fight two-handed with no penalty',
    'Tracking proficiency',
    'When wearing studded leather or lighter armor, 10% chance to move silently',
    'When wearing studded leather or lighter armor, 15% chance to hide in shadows',
    'Adept with both trained and untamed creatures',
  ],
  allowedAlignments: ['lawful good', 'neutral good', 'chaotic good'],
  hasSpells: false,
  allowedSpellTypes: [],
  spellList: [],
  allowedWeapons: ['any'],
  allowedArmor: ['any'],
  initialWP: 4,
  initialNWP: 3,
  wpPenalty: -2,
  apply: function (
    this: ADNDClass,
    character: ADNDCharacter,
    _rng: RNG.RNG,
    _options?: AdndClassApplyOptions,
  ): ADNDCharacter {
    return character;
  },
};

export default ranger;
