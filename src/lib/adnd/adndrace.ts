import type * as RNG from '@ironarachne/rng';
import type ADNDCharacter from './adndcharacter.js';

export type ADNDRaceApply = (character: ADNDCharacter, rng: RNG.RNG) => ADNDCharacter;

export default interface ADNDRace {
  name: string;
  adjective: string;
  apply: ADNDRaceApply;
  minStrength: number;
  maxStrength: number;
  minDexterity: number;
  maxDexterity: number;
  minConstitution: number;
  maxConstitution: number;
  minIntelligence: number;
  maxIntelligence: number;
  minWisdom: number;
  maxWisdom: number;
  minCharisma: number;
  maxCharisma: number;
  baseHeightMale: number;
  baseHeightFemale: number;
  baseWeightMale: number;
  baseWeightFemale: number;
  heightModifier: string; // dice expression
  weightModifier: string; // dice expression
  baseAge: number;
  baseMovement: number;
  ageModifier: string; // dice expression
  availableInitialLanguages: string[];
  allowedClasses: string[];
}
