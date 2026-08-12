import type ADNDCharacter from '../adndcharacter.js';
import type ADNDRace from '../adndrace.js';

const dwarf: ADNDRace = {
  name: 'dwarf',
  adjective: 'dwarven',
  apply: function (character: ADNDCharacter): ADNDCharacter {
    character.constitution += 1;
    character.charisma -= 1;
    // TODO: address saving throws
    character.abilities.push('20% chance of magical item malfunction');
    character.abilities.push('+1 to hit orcs, half-orcs, goblins, and hobgoblins');
    character.abilities.push(
      '-4 to attack rolls made on the character by ogres, trolls, ogre magi, giants, and titans',
    );
    character.abilities.push("Infravision (60')");
    character.abilities.push("Within 10', detect grade or slope in passage with 1-5 on 1d6");
    character.abilities.push("Within 10', detect new tunnel/passage construction with 1-5 on 1d6");
    character.abilities.push("Within 10', detect sliding/shifting walls or rooms with 1-4 on 1d6");
    character.abilities.push(
      "Within 10', detect stonework traps, pits, and deadfalls with 1-3 on 1d6",
    );
    character.abilities.push("Within 10', determine approximate depth underground with 1-3 on 1d6");
    return character;
  },
  minStrength: 8,
  maxStrength: 18,
  minDexterity: 3,
  maxDexterity: 17,
  minConstitution: 11,
  maxConstitution: 18,
  minIntelligence: 3,
  maxIntelligence: 18,
  minWisdom: 3,
  maxWisdom: 18,
  minCharisma: 3,
  maxCharisma: 17,
  baseHeightMale: 43,
  baseHeightFemale: 41,
  baseWeightMale: 130,
  baseWeightFemale: 105,
  heightModifier: '1d10',
  weightModifier: '4d10',
  baseAge: 40,
  baseMovement: 6,
  ageModifier: '5d6',
  availableInitialLanguages: ['common', 'dwarf', 'gnome', 'goblin', 'kobold', 'orc'],
  allowedClasses: ['cleric', 'fighter', 'thief'],
};

export default dwarf;
