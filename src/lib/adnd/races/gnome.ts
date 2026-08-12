import type ADNDCharacter from '../adndcharacter.js';
import type ADNDRace from '../adndrace.js';

const gnome: ADNDRace = {
  name: 'gnome',
  adjective: 'gnomish',
  apply: function (character: ADNDCharacter): ADNDCharacter {
    character.intelligence += 1;
    character.wisdom -= 1;
    // TODO: address saving throws
    character.abilities.push(
      '20% chance of magical item malfunction, except weapons, armor, shields, and illusionist items (and, if the gnome is a thief, items that duplicate thieving abilities)',
    );
    character.abilities.push('+1 to hit kobolds or goblins');
    character.abilities.push(
      'When gnolls, bugbears, ogres, trolls, ogre magi, giants, or titans attack gnomes, subtract -4 from their attack rolls',
    );
    character.abilities.push("Infravision (60')");
    character.abilities.push("Within 10', detect grade or slope in passages with 1-5 on 1d6");
    character.abilities.push(
      "Within 10', detect unsafe walls, ceiling, and floors with 1-7 on 1d10",
    );
    character.abilities.push('Determine approximate depth underground with 1-4 on 1d6');
    character.abilities.push(
      "Within 10', determine approximate direction underground with 1-3 on 1d6",
    );
    return character;
  },
  minStrength: 6,
  maxStrength: 18,
  minDexterity: 3,
  maxDexterity: 18,
  minConstitution: 8,
  maxConstitution: 18,
  minIntelligence: 6,
  maxIntelligence: 18,
  minWisdom: 3,
  maxWisdom: 18,
  minCharisma: 3,
  maxCharisma: 18,
  baseHeightMale: 38,
  baseHeightFemale: 36,
  baseWeightMale: 72,
  baseWeightFemale: 68,
  heightModifier: '1d6',
  weightModifier: '5d4',
  baseAge: 60,
  baseMovement: 6,
  ageModifier: '3d12',
  availableInitialLanguages: [
    'common',
    'gnome',
    'dwarf',
    'halfling',
    'goblin',
    'kobold',
    'burrowing mammal',
  ],
  allowedClasses: ['cleric', 'fighter', 'illusionist', 'thief'],
};

export default gnome;
