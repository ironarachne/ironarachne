import * as RNG from '@ironarachne/rng';
import type { AdndClassApplyOptions } from '../adnd_class_apply_options.js';
import type ADNDCharacter from '../adndcharacter.js';
import type ADNDClass from '../adndclass.js';

const fighter: ADNDClass = {
  name: 'fighter',
  group: 'warrior',
  hitDice: '1d10',
  minStrength: 9,
  minDexterity: -1,
  minConstitution: -1,
  minIntelligence: -1,
  minWisdom: -1,
  minCharisma: -1,
  primeRequisites: ['strength'],
  abilities: [],
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
  hasSpells: false,
  allowedSpellTypes: [],
  spellList: [],
  allowedWeapons: ['any'],
  allowedArmor: ['any'],
  initialWP: 4,
  initialNWP: 3,
  wpPenalty: -2,
  apply: (
    character: ADNDCharacter,
    _rng: RNG.RNG,
    _options?: AdndClassApplyOptions,
  ): ADNDCharacter => character,
};

export default fighter;
