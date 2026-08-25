import * as RNG from '@ironarachne/rng';
import type { AdndClassApplyOptions } from '../adnd_class_apply_options.js';
import type ADNDCharacter from '../adndcharacter.js';
import type ADNDClass from '../adndclass.js';
import {
  orderThiefSkillRows,
  prepareThiefSkillRowsForCharacter,
} from '../adnd_thief_skill_builder.js';
import * as ThiefSkills from '../adndthiefskills.js';

const thief: ADNDClass = {
  name: 'thief',
  group: 'rogue',
  hitDice: '1d6',
  minStrength: -1,
  minDexterity: 9,
  minConstitution: -1,
  minIntelligence: -1,
  minWisdom: -1,
  minCharisma: -1,
  primeRequisites: ['dexterity'],
  abilities: [
    'Pick pockets',
    'Open locks',
    'Find/remove traps',
    'Move silently',
    'Hide in shadows',
    'Detect noise',
    'Climb walls',
    'Read languages',
    'Backstab',
    "Thieves' cant",
  ],
  allowedAlignments: [
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
  allowedWeapons: [
    'club',
    'dagger',
    'hand crossbow',
    'lasso',
    'short bow',
    'broad sword',
    'long sword',
    'short sword',
    'staff',
    'dart',
    'knife',
    'sling',
  ],
  allowedArmor: ['leather', 'studded leather', 'padded', 'elven chain armor'],
  initialWP: 2,
  initialNWP: 3,
  wpPenalty: -3,
  apply: function (
    this: ADNDClass,
    character: ADNDCharacter,
    rng: RNG.RNG,
    options?: AdndClassApplyOptions,
  ): ADNDCharacter {
    let skills = prepareThiefSkillRowsForCharacter('thief', character);

    if (options?.thiefSkills === 'user') {
      return character;
    }

    // Shuffled before distributing: `distributePoints` picks by index, so the shuffle is what
    // decides which skills a roll favours, and it consumes the RNG. Sorted back afterwards,
    // because the order points were dealt in is not something a character sheet should show.
    skills = rng.shuffle(skills);
    skills = ThiefSkills.distributePoints(skills, 60, rng);
    character.thiefSkills = orderThiefSkillRows('thief', skills);

    return character;
  },
};

export default thief;
