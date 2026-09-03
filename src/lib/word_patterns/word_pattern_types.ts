/**
 * The word generator's pattern vocabulary, as data.
 *
 * `@ironarachne/word-generator` owns the elements themselves; this library owns them as a table
 * somebody can read, plus the pattern syntax that is documented nowhere else in the repository.
 */

/** One row of the element table: a symbol, what it is called, and what it can stand for. */
export type WordPatternElement = {
  name: string;
  /** The single character written in a pattern. */
  symbol: string;
  /** Everything the symbol can expand to. */
  elements: string[];
};

/** One rule of pattern syntax that is not simply "a symbol from the element table". */
export type PatternSyntaxRule = {
  syntax: string;
  meaning: string;
  example: string;
};

/** A pattern actually run, and what it produced. */
export type WordPatternSample = {
  pattern: string;
  seed: string;
  words: string[];
};

/** The cheat sheet, arranged for reading, independent of the format it is written in. */
export type WordPatternSheet = {
  title: string;
  syntax: PatternSyntaxRule[];
  elements: WordPatternElement[];
  /** The tried-it-out box, when a pattern has actually been run. */
  sample?: WordPatternSample;
};
