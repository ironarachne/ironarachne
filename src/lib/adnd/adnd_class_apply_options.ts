/** Optional behavior when applying a class to a character (see {@link ADNDClass}). */
export type AdndClassApplyOptions = {
  /**
   * `'random'` (default): fill {@link ADNDCharacter#spells} from {@link ADNDClass#spellList}.
   * `'user'`: skip automatic spells (builder supplies them afterward).
   */
  spells?: 'random' | 'user';
  /**
   * `'random'` (default): thief / bard discretionary skill points use the RNG (same as full generator).
   * `'user'`: skip skill distribution (builder assigns bonus points per skill).
   */
  thiefSkills?: 'random' | 'user';
};
