import type * as RNG from '@ironarachne/rng';
import type ADNDCharacter from './adndcharacter.js';

export type ADNDSubraceApply = (character: ADNDCharacter, rng: RNG.RNG) => ADNDCharacter;

/**
 * A variety within a race — a Stout halfling, a grey elf, a hill dwarf.
 *
 * Deliberately smaller than {@link ADNDRace}. A subrace shares its race's eligibility minimums,
 * class list, height and weight tables, and its entry in every list a user reads; what it carries
 * is the handful of adjustments and abilities that separate it from its siblings. Making a subrace
 * a race of its own would triple the halfling row in the race dropdown and turn one eligibility
 * question into three.
 *
 * A subrace is resolved **within its race**, never globally, which is why it has no reference back
 * to one. Two races may both have a "Grey" variety without colliding, and a subrace name on its
 * own is not enough to look one up. That is exactly the property the string `Stout halfling`
 * lacked, and #99 is what its absence cost.
 */
export default interface ADNDSubrace {
  name: string;
  /**
   * Applies this variety's adjustments and abilities.
   *
   * Handed the race's RNG because some varieties roll for themselves — a Stout halfling has a 15%
   * chance of infravision where its siblings have 25%. It writes the character and never the race
   * or the subrace table; see decision 2 of docs/adnd-subraces.md.
   */
  apply: ADNDSubraceApply;
}
