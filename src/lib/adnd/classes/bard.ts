import * as RNG from '@ironarachne/rng';
import type { AdndClassApplyOptions } from '../adnd_class_apply_options.js';
import type ADNDCharacter from '../adndcharacter.js';
import type ADNDClass from '../adndclass.js';
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
    let skills = [
      { name: 'Pick Pockets', value: 10, points: 0 },
      { name: 'Detect Noise', value: 20, points: 0 },
      { name: 'Climb Walls', value: 50, points: 0 },
      { name: 'Read Languages', value: 5, points: 0 },
    ];
    skills = ThiefSkills.modifyForDexterity(skills, character.dexterity);
    let raceName = character.race.name;
    if (character.race.name.includes('halfling')) {
      raceName = 'halfling';
    }

    skills = ThiefSkills.modifyForRace(skills, raceName);

    if (options?.thiefSkills === 'user') {
      return character;
    }

    skills = rng.shuffle(skills);
    skills = ThiefSkills.distributePoints(skills, 20, rng);

    for (let i = 0; i < skills.length; i++) {
      character.abilities.push(`${skills[i].name}: ${skills[i].value + skills[i].points}%`);
    }

    return character;
  },
};

export default bard;
