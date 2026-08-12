import type { RNG } from '@ironarachne/rng';
import type ADNDCharacter from '../adndcharacter.js';
import type ADNDRace from '../adndrace.js';
import { applyHalflingWithOptions, randomHalflingApplyOptions } from './halfling_apply.js';

const halfling: ADNDRace = {
  name: 'halfling',
  adjective: 'halfling',
  apply: function (character: ADNDCharacter, rng: RNG): ADNDCharacter {
    return applyHalflingWithOptions(character, randomHalflingApplyOptions(rng));
  },
  minStrength: 7,
  maxStrength: 18,
  minDexterity: 7,
  maxDexterity: 18,
  minConstitution: 10,
  maxConstitution: 18,
  minIntelligence: 6,
  maxIntelligence: 18,
  minWisdom: 3,
  maxWisdom: 17,
  minCharisma: 3,
  maxCharisma: 18,
  baseHeightMale: 32,
  baseHeightFemale: 30,
  baseWeightMale: 52,
  baseWeightFemale: 48,
  heightModifier: '2d8',
  weightModifier: '5d4',
  baseAge: 20,
  baseMovement: 6,
  ageModifier: '3d4',
  availableInitialLanguages: ['common', 'halfling', 'dwarf', 'elf', 'gnome', 'goblin', 'orc'],
  allowedClasses: ['cleric', 'fighter', 'thief'],
};

export default halfling;
