import type ADNDCharacter from '../adndcharacter.js';
import type ADNDRace from '../adndrace.js';

const halfelf: ADNDRace = {
  name: 'half-elf',
  adjective: 'half-elven',
  apply: function (character: ADNDCharacter): ADNDCharacter {
    character.abilities.push('30% resistance to sleep spell and all charm-related spells');
    character.abilities.push("Infravision (60')");
    character.abilities.push('Notice secret door with 1 on 1d6 when passing within 10 feet');
    character.abilities.push('Find secret door when actively searching with 1-2 on 1d6');
    character.abilities.push('Find concealed portal when actively searching with 1-3 on 1d6');
    return character;
  },
  minStrength: 3,
  maxStrength: 18,
  minDexterity: 6,
  maxDexterity: 18,
  minConstitution: 6,
  maxConstitution: 18,
  minIntelligence: 4,
  maxIntelligence: 18,
  minWisdom: 3,
  maxWisdom: 18,
  minCharisma: 3,
  maxCharisma: 18,
  baseHeightMale: 60,
  baseHeightFemale: 58,
  baseWeightMale: 110,
  baseWeightFemale: 85,
  heightModifier: '2d6',
  weightModifier: '3d12',
  baseAge: 15,
  baseMovement: 12,
  ageModifier: '1d6',
  availableInitialLanguages: [
    'common',
    'elf',
    'gnome',
    'halfling',
    'goblin',
    'hobgoblin',
    'gnoll',
    'orc',
  ],
  allowedClasses: [
    'bard',
    'cleric',
    'druid',
    'fighter',
    'mage',
    'ranger',
    'specialist wizard',
    'thief',
  ],
};

export default halfelf;
