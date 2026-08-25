import type * as RNG from '@ironarachne/rng';
import type ADNDCharacter from './adndcharacter.js';
import type ADNDSubrace from './adndsubrace.js';

/**
 * Optional behaviour when applying a race, mirroring {@link AdndClassApplyOptions} on the class
 * side.
 *
 * `subrace` is how the builder says which variety the user chose. Without it a race with varieties
 * draws one itself, which is what the generator wants; with it, no draw is taken and the choice
 * stands.
 */
export type ADNDRaceApplyOptions = {
  subrace?: ADNDSubrace | null;
};

export type ADNDRaceApply = (
  character: ADNDCharacter,
  rng: RNG.RNG,
  options?: ADNDRaceApplyOptions,
) => ADNDCharacter;

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
  /**
   * The varieties within this race, empty for a race that has none.
   *
   * Empty is the ordinary case — five of the six races here have no varieties — and it must stay
   * cheap: a race with no subraces draws nothing at all when it is applied. Not a discarded draw,
   * not a draw against an empty list. Anything else would shift every roll after it and rewrite
   * the output of every existing seed for those five races in exchange for nothing.
   */
  subraces: ADNDSubrace[];
}
