import * as RNG from '@ironarachne/rng';
import type { AdndClassApplyOptions } from '../adnd_class_apply_options.js';
import type ADNDCharacter from '../adndcharacter.js';
import type ADNDClass from '../adndclass.js';
import {
  orderThiefSkillRows,
  prepareThiefSkillRowsForCharacter,
} from '../adnd_thief_skill_builder.js';
import * as ThiefSkills from '../adndthiefskills.js';

const bard: ADNDClass = {
  name: 'bard',
  group: 'rogue',
  hitDice: '1d6',
  minStrength: -1,
  minDexterity: 12,
  minConstitution: -1,
  minIntelligence: 13,
  minWisdom: -1,
  minCharisma: 15,
  primeRequisites: ['dexterity', 'charisma'],
  abilities: [
    'Climb walls',
    'Detect noise',
    'Pick pockets',
    'Read languages',
    'Influence reactions',
  ],
  allowedAlignments: [
    'lawful neutral',
    'neutral good',
    'true neutral',
    'neutral evil',
    'chaotic neutral',
  ],
  hasSpells: false,
  allowedSpellTypes: [],
  spellList: [],
  allowedWeapons: ['any'],
  allowedArmor: ['padded', 'leather', 'studded leather', 'chain mail'],
  initialWP: 2,
  initialNWP: 3,
  wpPenalty: -3,
  apply: (
    character: ADNDCharacter,
    rng: RNG.RNG,
    options?: AdndClassApplyOptions,
  ): ADNDCharacter => {
    let skills = prepareThiefSkillRowsForCharacter('bard', character);

    if (options?.thiefSkills === 'user') {
      return character;
    }

    // See the same passage in `thief.ts`: the shuffle decides the allocation and must stay, and
    // the order it leaves behind is not what the sheet should print.
    skills = rng.shuffle(skills);
    skills = ThiefSkills.distributePoints(skills, 20, rng);
    character.thiefSkills = orderThiefSkillRows('bard', skills);

    return character;
  },
};

export default bard;
