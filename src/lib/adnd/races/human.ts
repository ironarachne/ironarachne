import type ADNDCharacter from '../adndcharacter.js';
import type ADNDRace from '../adndrace.js';

const human: ADNDRace = {
  name: 'human',
  adjective: 'human',
  apply: function (character: ADNDCharacter): ADNDCharacter {
    return character;
  },
  minStrength: 1,
  maxStrength: 25,
  minDexterity: 1,
  maxDexterity: 25,
  minConstitution: 1,
  maxConstitution: 25,
  minIntelligence: 1,
  maxIntelligence: 25,
  minWisdom: 1,
  maxWisdom: 25,
  minCharisma: 1,
  maxCharisma: 25,
  baseHeightMale: 60,
  baseHeightFemale: 59,
  baseWeightMale: 140,
  baseWeightFemale: 100,
  heightModifier: '2d10',
  weightModifier: '6d10',
  baseAge: 15,
  baseMovement: 12,
  ageModifier: '1d4',
  availableInitialLanguages: [
    'common',
    'dwarf',
    'elf',
    'gnome',
    'halfling',
    'goblin',
    'hobgoblin',
    'gnoll',
    'orc',
    'giant',
    'kobold',
  ],
  allowedClasses: [
    'bard',
    'cleric',
    'druid',
    'fighter',
    'illusionist',
    'mage',
    'paladin',
    'ranger',
    'specialist wizard',
    'thief',
  ],
};

export default human;
