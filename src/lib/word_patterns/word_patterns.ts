/**
 * The word generator's pattern vocabulary, and the cheat sheet written from it.
 *
 * `WordGeneratorCheatSheet.svelte` built the element table as an HTML string and injected it with
 * `{@html}` — the one `svelte/no-at-html-tags` suppression on the page, for markup the component
 * had concatenated itself. Nothing could test it, the headers in that string were unverifiable, and
 * the page's three paragraphs of pattern syntax were the only place that syntax is written down.
 * All of it is data here instead, which is
 * [decision 8 of the readiness pass](../../../docs/tool-readiness.md): a reference tool with no
 * logic still gets a library, because an exemption would be used by the next reference page too.
 *
 * The elements come from `@ironarachne/word-generator` rather than being copied, so the sheet
 * cannot describe a vocabulary the generator does not have. It already had drifted: the package's
 * own doc comment lists thirty-six symbols and ships forty-five.
 */

import { RNG } from '@ironarachne/rng';
import { WordGenerator, allElements } from '@ironarachne/word-generator';

import type {
  PatternSyntaxRule,
  WordPatternElement,
  WordPatternSample,
  WordPatternSheet,
} from './word_pattern_types';

/** The sheet's own title, shared by the page heading and the exports. */
export const WORD_PATTERN_SHEET_TITLE = 'Word Generator Cheat Sheet';

/** The filename stem for an exported sheet. */
export const WORD_PATTERN_SHEET_FILE_STEM = 'word-generator-cheat-sheet';

/** The most words one press will produce, so a mistyped count cannot hang the page. */
export const MAXIMUM_WORD_COUNT = 200;

/** The fewest, which is also what a cleared number field falls back to. */
export const MINIMUM_WORD_COUNT = 1;

/**
 * The pattern with which the page opens.
 *
 * It used to open empty, and Generate on an empty pattern produces empty strings — ten blank
 * bullets, which is requirement 6.4 exactly. A pattern that works on arrival is both the fix and
 * the better introduction to a syntax nobody has read yet.
 */
export const DEFAULT_PATTERN = 'cvcv';

/**
 * The syntax that is not simply "a symbol from the element table".
 *
 * This lived in three paragraphs of prose above the controls, which is the only place in the
 * repository the syntax is documented at all — so it is data now, and the exports carry it.
 */
export const PATTERN_SYNTAX: PatternSyntaxRule[] = [
  {
    syntax: 'A symbol',
    meaning: 'Stands for one element drawn from that symbol’s set, listed in the table below.',
    example: 'cvc',
  },
  {
    syntax: '(a,b,c)',
    meaning: 'Chooses one of the comma-separated patterns inside the parentheses.',
    example: '(cv,vc)c',
  },
  {
    syntax: '+',
    meaning: 'Duplicates the previous character after it has been processed.',
    example: 'cv+',
  },
];

/**
 * Every element the generator knows, as plain rows.
 *
 * `allElements` holds class instances; the sheet wants data, and a fresh array each call so a
 * caller sorting or filtering it cannot reorder the package's own list.
 */
export function patternElements(): WordPatternElement[] {
  return allElements.map((element) => ({
    name: element.name,
    symbol: element.symbol,
    elements: [...element.elements],
  }));
}

/** Whether a pattern has anything in it to generate from. */
export function isBlankPattern(pattern: string): boolean {
  return pattern.trim() === '';
}

/** A word count the generator can survive: whole, at least one, and not unbounded. */
export function clampWordCount(count: number): number {
  if (!Number.isFinite(count)) {
    return MINIMUM_WORD_COUNT;
  }
  return Math.min(Math.max(Math.round(count), MINIMUM_WORD_COUNT), MAXIMUM_WORD_COUNT);
}

/**
 * Words from a pattern, reproducibly.
 *
 * The page built a `new WordGenerator()` with no RNG, so nothing it produced could be got back —
 * which is also why none of this could be tested. One `RNG` for the whole run, threaded in, is the
 * repository's normal shape.
 *
 * A blank pattern returns nothing rather than a list of empty strings, and any word that comes back
 * empty anyway is dropped: an empty `<li>` is a layout artifact (6.4), and a blank line in an
 * export is the same fault in the other format.
 */
export function generateWords(pattern: string, count: number, seed: string): string[] {
  if (isBlankPattern(pattern)) {
    return [];
  }

  const generator = new WordGenerator(new RNG(seed));
  generator.patterns = [pattern];

  const words: string[] = [];
  for (let i = 0; i < clampWordCount(count); i++) {
    words.push(generator.generate());
  }

  return words.filter((word) => word.trim() !== '');
}

/** The cheat sheet, arranged for reading. */
export function wordPatternSheet(sample?: WordPatternSample): WordPatternSheet {
  return {
    title: WORD_PATTERN_SHEET_TITLE,
    syntax: PATTERN_SYNTAX,
    elements: patternElements(),
    // 6.4: an untried pattern leaves the section out rather than exporting an empty heading.
    sample: sample !== undefined && sample.words.length > 0 ? sample : undefined,
  };
}

/**
 * A cell a Markdown table can hold.
 *
 * The clicks element set is `|`, `||`, `|!`, so this vocabulary genuinely contains the one
 * character a Markdown table uses as its column separator. Unescaped, that one row silently splits
 * into five columns and takes the rest of the table's alignment with it.
 */
function escapeCell(value: string): string {
  return value.replaceAll('|', '\\|');
}

function sampleHeading(sample: WordPatternSample, quote: string): string {
  return `Pattern ${quote}${sample.pattern}${quote}, seed ${quote}${sample.seed}${quote}`;
}

/** The sheet as Markdown, for a developer who keeps their notes in it. */
export function sheetToMarkdown(sheet: WordPatternSheet): string {
  const blocks = [
    `# ${sheet.title}`,
    '## Pattern syntax',
    [
      '| Syntax | Meaning | Example |',
      '| --- | --- | --- |',
      ...sheet.syntax.map(
        (rule) =>
          `| \`${escapeCell(rule.syntax)}\` | ${escapeCell(rule.meaning)} | \`${escapeCell(rule.example)}\` |`,
      ),
    ].join('\n'),
    '## Elements',
    [
      '| Name | Symbol | Elements |',
      '| --- | --- | --- |',
      ...sheet.elements.map(
        (element) =>
          `| ${escapeCell(element.name)} | \`${escapeCell(element.symbol)}\` | ${escapeCell(element.elements.join(', '))} |`,
      ),
    ].join('\n'),
  ];

  if (sheet.sample !== undefined) {
    blocks.push(
      '## Sample',
      sampleHeading(sheet.sample, '`'),
      sheet.sample.words.map((word) => `- ${word}`).join('\n'),
    );
  }

  return `${blocks.join('\n\n')}\n`;
}

/** The body of the PDF: the same sheet without the title the PDF draws itself. */
export function sheetToText(sheet: WordPatternSheet): string {
  const blocks = [
    'Pattern syntax',
    sheet.syntax
      .map((rule) => `  ${rule.syntax} - ${rule.meaning} Example: ${rule.example}`)
      .join('\n'),
    'Elements',
    sheet.elements
      .map((element) => `  ${element.symbol}  ${element.name}: ${element.elements.join(', ')}`)
      .join('\n'),
  ];

  if (sheet.sample !== undefined) {
    blocks.push(
      'Sample',
      sampleHeading(sheet.sample, '"'),
      sheet.sample.words.map((word) => `  ${word}`).join('\n'),
    );
  }

  return blocks.join('\n\n');
}
