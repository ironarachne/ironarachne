import type ADNDCharacter from '../adndcharacter.js';
import type ADNDRace from '../adndrace.js';

const elf: ADNDRace = {
  name: 'elf',
  adjective: 'elven',
  apply: function (character: ADNDCharacter): ADNDCharacter {
    character.dexterity += 1;
    character.constitution -= 1;
    // TODO: address special abilities
    character.abilities.push('90% resistance to sleep spell and all charm-related spells');
    character.abilities.push('+1 to hit with all bows other than crossbow');
    character.abilities.push('+1 to hit with short or long swords');
    character.abilities.push("Infravision (60')");
    character.abilities.push('Notice secret door with 1 on 1d6 when passing within 10 feet');
    character.abilities.push('Find secret door when actively searching with 1-2 on 1d6');
    character.abilities.push('Find concealed portal when actively searching with 1-3 on 1d6');
    character.abilities.push(
      'When not wearing metal armor, and either alone or with other elves/halflings not in metal armor, gain a bonus to surprise opponents. Those opponents have a -4 penalty to their surprise die rolls, or a -2 penalty if the elf has to open a door or screen to attack.',
    );
    return character;
  },
  minStrength: 3,
  maxStrength: 18,
  minDexterity: 6,
  maxDexterity: 18,
  minConstitution: 7,
  maxConstitution: 18,
  minIntelligence: 8,
  maxIntelligence: 18,
  minWisdom: 3,
  maxWisdom: 18,
  minCharisma: 3,
  maxCharisma: 18,
  baseHeightMale: 55,
  baseHeightFemale: 50,
  baseWeightMale: 90,
  baseWeightFemale: 70,
  heightModifier: '1d10',
  weightModifier: '3d10',
  baseAge: 100,
  baseMovement: 12,
  ageModifier: '5d6',
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
  allowedClasses: ['cleric', 'fighter', 'mage', 'ranger', 'thief'],
  subraces: [],
};

export default elf;
