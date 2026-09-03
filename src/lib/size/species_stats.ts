/**
 * The species height and weight calculator, as logic rather than as a component.
 *
 * All of this lived in `SpeciesStatsCalculator.svelte`, where nothing could test it — and two
 * things had gone wrong there that a test would have caught the day they were written:
 *
 * - **An empty or zero input produced a nonsense sheet rather than no sheet.** A number input bound
 *   to `$state` yields `null` when the field is cleared, `null / 100` is `0`, and an age modifier
 *   of zero walks `getVariant` into rows whose minimum age is above their maximum. The clamps here
 *   are the fix, and they are the reason 6.4 passes: a sheet is always readable.
 * - **The human baseline was the literal `100`**, which happens to be right because the standard
 *   human age ladder ends at 100 and would silently stop being right the day it did not.
 *   `HUMAN_BASELINE_MAX_AGE` reads it from the ladder.
 *
 * The document is what the page renders and what both exports are written from, so what an author
 * reads on screen and what they take away cannot drift.
 */

import { AgeCategories } from '$lib/age';
import type { AgeCategory } from '$lib/age';

import * as Sizes from './sizes';
import { convertMatrixToSummary } from './size_matrix';
import type { SizeAgeSummary } from './size_matrix';
import type {
  IngeniumHeritage,
  SpeciesProportions,
  SpeciesStatsDocument,
  SpeciesStatsGender,
  SpeciesStatsInput,
  SpeciesStatsRow,
} from './species_stats_types';

/** The document's own title, shared by the page heading and both exports. */
export const SPECIES_STATS_TITLE = 'Species Height and Weight Calculator';

/**
 * The maximum age of the standard human ladder, which every proportion here is taken against.
 *
 * Read rather than written: it is 100 today, the component divided by a literal 100, and the two
 * agreeing was luck rather than design.
 */
export const HUMAN_BASELINE_MAX_AGE = AgeCategories.getMaxAge(AgeCategories.humanStandard());

/** The smallest proportion the calculator will work with, as a percentage. */
export const MINIMUM_PERCENT = 1;

/**
 * The smallest lifespan the calculator will work with, in years.
 *
 * One year per age category, because seven categories cannot span fewer than seven years without
 * one of them ending before it begins. `getVariant` refuses to emit such a row at all now, but a
 * ladder of seven identical one-year rows is a sheet nobody can read, so the floor is here too.
 */
export const MINIMUM_MAXIMUM_AGE = AgeCategories.humanStandard().length;

/** The age category the Ingenium block reads its figures from. */
const ADULT = 'adult';

/** The genders the human size matrix carries, in the order the sheet lists them. */
const GENDERS: { name: string; label: string }[] = [
  { name: 'female', label: 'Female' },
  { name: 'male', label: 'Male' },
];

/**
 * A number the arithmetic can survive, or the floor.
 *
 * `null` reaches here whenever a number input is cleared, and `NaN` whenever it holds something
 * that is not a number; both coerce to values that produce a sheet full of zeroes and reversed age
 * ranges rather than an error anyone would notice.
 */
function atLeast(value: number, floor: number): number {
  if (!Number.isFinite(value) || value < floor) {
    return floor;
  }
  return value;
}

/** One gender's proportions, floored so neither can be zero or absent. */
export function clampProportions(proportions: SpeciesProportions): SpeciesProportions {
  return {
    heightPercent: atLeast(proportions.heightPercent, MINIMUM_PERCENT),
    weightPercent: atLeast(proportions.weightPercent, MINIMUM_PERCENT),
  };
}

/** The input as the calculator will actually use it. */
export function clampInput(input: SpeciesStatsInput): SpeciesStatsInput {
  return {
    maximumAge: Math.round(atLeast(input.maximumAge, MINIMUM_MAXIMUM_AGE)),
    female: clampProportions(input.female),
    male: clampProportions(input.male),
  };
}

function toRow(summary: SizeAgeSummary): SpeciesStatsRow {
  return {
    ageCategoryName: summary.ageCategoryName,
    minAge: summary.minAge,
    maxAge: summary.maxAge,
    ageRange: `${summary.minAge} to ${summary.maxAge} years`,
    heightRange: summary.heightRange,
    weightRange: summary.weightRange,
  };
}

function genderLadder(
  gender: { name: string; label: string },
  proportions: SpeciesProportions,
  ageCategories: AgeCategory[],
): SpeciesStatsGender {
  const matrix = Sizes.getHumanVariant(
    proportions.weightPercent / 100,
    proportions.heightPercent / 100,
  );

  return {
    name: gender.name,
    label: gender.label,
    rows: convertMatrixToSummary(matrix, ageCategories, gender.name).map(toRow),
  };
}

function adultRow(gender: SpeciesStatsGender | undefined): SpeciesStatsRow | undefined {
  return gender?.rows.find((row) => row.ageCategoryName === ADULT);
}

function ingeniumHeritage(genders: SpeciesStatsGender[], lifespan: number): IngeniumHeritage {
  const female = adultRow(genders.find((gender) => gender.name === 'female'));
  const male = adultRow(genders.find((gender) => gender.name === 'male'));

  return {
    adultAge: female?.minAge ?? 0,
    maximumLifespan: lifespan,
    femaleHeight: female?.heightRange ?? '',
    maleHeight: male?.heightRange ?? '',
    femaleWeight: female?.weightRange ?? '',
    maleWeight: male?.weightRange ?? '',
  };
}

function proportionsSentence(label: string, proportions: SpeciesProportions): string {
  return `${label} ${proportions.heightPercent}% of human height and ${proportions.weightPercent}% of human weight`;
}

/** The sentence saying what the sheet's numbers are proportions of. */
export function speciesStatsSummary(input: SpeciesStatsInput, lifespan: number): string {
  const years = `a maximum lifespan of ${lifespan} ${lifespan === 1 ? 'year' : 'years'}`;
  return `Taken against a modern human: ${proportionsSentence('female at', input.female)}, ${proportionsSentence('male at', input.male)}, with ${years}.`;
}

/** The whole sheet, arranged for reading. */
export function speciesStatsDocument(input: SpeciesStatsInput): SpeciesStatsDocument {
  const clamped = clampInput(input);

  const ageCategories = AgeCategories.getHumanVariant(clamped.maximumAge / HUMAN_BASELINE_MAX_AGE);

  // What the ladder reaches, not what was asked for. The two differ by a year here and there and
  // the sheet has to pick one, or its last row contradicts its own opening sentence.
  const lifespan = AgeCategories.getMaxAge(ageCategories);

  const genders = GENDERS.map((gender) =>
    genderLadder(gender, gender.name === 'female' ? clamped.female : clamped.male, ageCategories),
  );

  return {
    title: SPECIES_STATS_TITLE,
    input: clamped,
    lifespan,
    summary: speciesStatsSummary(clamped, lifespan),
    genders,
    ingenium: ingeniumHeritage(genders, lifespan),
  };
}

function ingeniumLines(heritage: IngeniumHeritage): { label: string; value: string }[] {
  return [
    { label: 'Female height', value: heritage.femaleHeight },
    { label: 'Male height', value: heritage.maleHeight },
    { label: 'Female weight', value: heritage.femaleWeight },
    { label: 'Male weight', value: heritage.maleWeight },
    { label: 'Adult age', value: String(heritage.adultAge) },
    { label: 'Maximum lifespan', value: String(heritage.maximumLifespan) },
  ].filter((line) => line.value.trim() !== '');
}

/** The sheet as Markdown, for an author who keeps their species notes in it. */
export function speciesStatsToMarkdown(document: SpeciesStatsDocument): string {
  const blocks = [`# ${document.title}`, document.summary];

  for (const gender of document.genders) {
    blocks.push(
      [
        `## ${gender.label}`,
        '| Age category | Age range | Height | Weight |',
        '| --- | --- | --- | --- |',
        ...gender.rows.map(
          (row) =>
            `| ${row.ageCategoryName} | ${row.ageRange} | ${row.heightRange} | ${row.weightRange} |`,
        ),
      ].join('\n'),
    );
  }

  blocks.push(
    [
      '## Ingenium Second Edition heritage',
      ...ingeniumLines(document.ingenium).map((line) => `- ${line.label}: ${line.value}`),
    ].join('\n'),
  );

  return `${blocks.join('\n\n')}\n`;
}

/** The body of the PDF: the same sheet without the title the PDF draws itself. */
export function speciesStatsToText(document: SpeciesStatsDocument): string {
  const blocks = [document.summary];

  for (const gender of document.genders) {
    blocks.push(
      [
        gender.label,
        ...gender.rows.map(
          (row) =>
            `  ${row.ageCategoryName} - ${row.ageRange} - ${row.heightRange} - ${row.weightRange}`,
        ),
      ].join('\n'),
    );
  }

  blocks.push(
    [
      'Ingenium Second Edition heritage',
      ...ingeniumLines(document.ingenium).map((line) => `  ${line.label}: ${line.value}`),
    ].join('\n'),
  );

  return blocks.join('\n\n');
}

/**
 * A filename stem for an exported sheet, naming the proportions it was made from.
 *
 * A species being authored has no name yet — that is what the tool is for — so the numbers are the
 * only thing that tells one download from another.
 */
export function speciesStatsFileStem(document: SpeciesStatsDocument): string {
  const { female, male, maximumAge } = document.input;
  return `species-stats-f${female.heightPercent}x${female.weightPercent}-m${male.heightPercent}x${male.weightPercent}-age${maximumAge}`;
}
