import * as RNG from '@ironarachne/rng';
import type { AdndClassApplyOptions } from '../adnd_class_apply_options.js';
import type ADNDCharacter from '../adndcharacter.js';
import type ADNDClass from '../adndclass.js';
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
    let skills = [
      { name: 'Pick Pockets', value: 15, points: 0 },
      { name: 'Open Locks', value: 10, points: 0 },
      { name: 'Find/Remove Traps', value: 5, points: 0 },
      { name: 'Move Silently', value: 10, points: 0 },
      { name: 'Hide in Shadows', value: 5, points: 0 },
      { name: 'Detect Noise', value: 15, points: 0 },
      { name: 'Climb Walls', value: 60, points: 0 },
      { name: 'Read Languages', value: 0, points: 0 },
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
    skills = ThiefSkills.distributePoints(skills, 60, rng);

    for (let i = 0; i < skills.length; i++) {
      character.abilities.push(`${skills[i].name}: ${skills[i].value + skills[i].points}%`);
    }

    return character;
  },
};

export default thief;
