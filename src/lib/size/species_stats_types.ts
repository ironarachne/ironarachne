/**
 * The species height and weight calculator's own shapes.
 *
 * The calculator does not read the species list. It takes proportions of a modern human and
 * derives the size and age ladders from `Sizes.getHumanVariant` and `AgeCategories.getHumanVariant`
 * — so what it produces is an author's working sheet for a species that does not exist yet, not a
 * lookup of one that does.
 */

/** One gender's proportions, as percentages of the human baseline. */
export type SpeciesProportions = {
  heightPercent: number;
  weightPercent: number;
};

/** Everything the calculator is given. */
export type SpeciesStatsInput = {
  /** The species' maximum lifespan in years. */
  maximumAge: number;
  female: SpeciesProportions;
  male: SpeciesProportions;
};

/** One age category's row of the sheet, for one gender. */
export type SpeciesStatsRow = {
  ageCategoryName: string;
  minAge: number;
  maxAge: number;
  ageRange: string;
  heightRange: string;
  weightRange: string;
};

/** One gender's ladder, from infant to elderly. */
export type SpeciesStatsGender = {
  /** The gender's name as the size matrix keys it. */
  name: string;
  /** How it is written in a heading. */
  label: string;
  rows: SpeciesStatsRow[];
};

/**
 * The adult figures, in the shape Ingenium Second Edition asks for a heritage.
 *
 * The one game system this tool speaks, which is why it is a named block rather than another row.
 */
export type IngeniumHeritage = {
  adultAge: number;
  maximumLifespan: number;
  femaleHeight: string;
  maleHeight: string;
  femaleWeight: string;
  maleWeight: string;
};

/** The whole sheet, arranged for reading, independent of the format it is written in. */
export type SpeciesStatsDocument = {
  title: string;
  /** The input as it was actually used, after clamping. */
  input: SpeciesStatsInput;
  /**
   * The lifespan the age ladder actually reaches, which is what the sheet reports.
   *
   * Not always the requested `input.maximumAge`: the ladder scales each category by a ratio and
   * rounds up, so a lifespan of 7 lands on 8 through nothing worse than `100 * 0.07` being
   * `7.000000000000001`. Reporting the ladder rather than the request is what keeps the summary
   * and the last row of the table from disagreeing.
   */
  lifespan: number;
  /** The sentence saying what the numbers are proportions of. */
  summary: string;
  genders: SpeciesStatsGender[];
  ingenium: IngeniumHeritage;
};
