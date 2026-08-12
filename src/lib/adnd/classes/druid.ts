import * as RNG from '@ironarachne/rng';
import type { AdndClassApplyOptions } from '../adnd_class_apply_options.js';
import { assignRandomStartingSpellsForClass } from '../adnd_class_starting_spells.js';
import type ADNDCharacter from '../adndcharacter.js';
import type ADNDClass from '../adndclass.js';

const druid: ADNDClass = {
  name: 'druid',
  group: 'priest',
  hitDice: '1d8',
  minStrength: -1,
  minDexterity: -1,
  minConstitution: -1,
  minIntelligence: -1,
  minWisdom: 12,
  minCharisma: 15,
  primeRequisites: ['wisdom'],
  abilities: [
    'Cast priest spells',
    'Speak druidic',
    '+2 bonus to saving throws vs. fire or electrical attacks',
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
  allowedSpellTypes: ['priest'],
  spellList: [
    {
      filter: {
        name: '',
        level: 1,
        casterClass: 'priest',
        requiredTags: ['plant', 'animal', 'healing', 'weather', 'elemental'],
        bannedTags: [],
      },
      count: 1,
    },
  ],
  allowedWeapons: ['club', 'sickle', 'spear', 'scimitar', 'dagger', 'staff', 'dart', 'sling'],
  allowedArmor: ['leather', 'studded leather', 'wooden shield'],
  initialWP: 2,
  initialNWP: 4,
  wpPenalty: -3,
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

export default druid;
