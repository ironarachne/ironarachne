import { allElements } from '@ironarachne/word-generator';
import { describe, expect, it } from 'vitest';

import {
  DEFAULT_PATTERN,
  MAXIMUM_WORD_COUNT,
  MINIMUM_WORD_COUNT,
  PATTERN_SYNTAX,
  WORD_PATTERN_SHEET_TITLE,
  clampWordCount,
  generateWords,
  isBlankPattern,
  patternElements,
  sheetToMarkdown,
  sheetToText,
  wordPatternSheet,
} from './word_patterns';

/** A cleared number field binds to `null`, which the type does not describe but the DOM produces. */
const cleared = null as unknown as number;

describe('patternElements', () => {
  it('returns every element the generator knows', () => {
    const elements = patternElements();

    expect(elements.length).toBe(allElements.length);
    expect(elements.length).toBeGreaterThan(0);
    expect(elements.map((element) => element.symbol)).toEqual(
      allElements.map((element) => element.symbol),
    );
  });

  it('returns plain rows rather than the package class instances', () => {
    for (const element of patternElements()) {
      expect(Object.getPrototypeOf(element)).toBe(Object.prototype);
      expect(element.name).not.toBe('');
      expect(element.symbol.length).toBeGreaterThan(0);
      expect(element.elements.length).toBeGreaterThan(0);
    }
  });

  it('hands out a fresh list, so a caller cannot reorder the package own list', () => {
    const first = patternElements();
    first.reverse();
    first[0].elements.push('nonsense');

    const second = patternElements();
    expect(second[0].symbol).toBe(allElements[0].symbol);
    expect(second[0].elements).toEqual(allElements[0].elements);
  });
});

describe('PATTERN_SYNTAX', () => {
  it('documents the two rules that are not a symbol', () => {
    // This was three paragraphs of prose above the controls, and the only place in the repository
    // the syntax appeared at all.
    expect(PATTERN_SYNTAX.map((rule) => rule.syntax)).toEqual(['A symbol', '(a,b,c)', '+']);
    for (const rule of PATTERN_SYNTAX) {
      expect(rule.meaning).not.toBe('');
      expect(rule.example).not.toBe('');
    }
  });

  it('gives examples that actually generate something', () => {
    for (const rule of PATTERN_SYNTAX) {
      expect(generateWords(rule.example, 1, 'example-seed'), rule.syntax).toHaveLength(1);
    }
  });
});

describe('isBlankPattern', () => {
  it('treats whitespace as no pattern at all', () => {
    expect(isBlankPattern('')).toBe(true);
    expect(isBlankPattern('   ')).toBe(true);
    expect(isBlankPattern('cvc')).toBe(false);
  });
});

describe('clampWordCount', () => {
  it('leaves a usable count alone', () => {
    expect(clampWordCount(10)).toBe(10);
  });

  it('floors a cleared, zero or negative count', () => {
    expect(clampWordCount(cleared)).toBe(MINIMUM_WORD_COUNT);
    expect(clampWordCount(NaN)).toBe(MINIMUM_WORD_COUNT);
    expect(clampWordCount(0)).toBe(MINIMUM_WORD_COUNT);
    expect(clampWordCount(-4)).toBe(MINIMUM_WORD_COUNT);
  });

  it('caps a count that would hang the page', () => {
    expect(clampWordCount(1_000_000)).toBe(MAXIMUM_WORD_COUNT);
    expect(clampWordCount(Infinity)).toBe(MINIMUM_WORD_COUNT);
  });

  it('rounds a fractional count to whole words', () => {
    expect(clampWordCount(7.4)).toBe(7);
  });
});

describe('generateWords', () => {
  it('returns the same words for the same seed', () => {
    // The page built a `new WordGenerator()` with no RNG, so nothing it produced could be got
    // back — which is also why none of this could be tested.
    const first = generateWords('cvcv', 5, 'a-fixed-seed');
    const second = generateWords('cvcv', 5, 'a-fixed-seed');

    expect(first).toHaveLength(5);
    expect(second).toEqual(first);
  });

  it('returns different words for a different seed', () => {
    expect(generateWords('cvcvcvcv', 5, 'one')).not.toEqual(generateWords('cvcvcvcv', 5, 'two'));
  });

  it('returns nothing at all for a blank pattern', () => {
    // 6.4. Generating from an empty pattern produces empty strings, which rendered as ten blank
    // bullets and exported as blank lines.
    expect(generateWords('', 10, 'seed')).toEqual([]);
    expect(generateWords('   ', 10, 'seed')).toEqual([]);
  });

  it('never returns an empty word', () => {
    for (const pattern of ['cvc', DEFAULT_PATTERN, '(cv,vc)c', 'cv+']) {
      for (const word of generateWords(pattern, 20, 'seed')) {
        expect(word.trim(), pattern).not.toBe('');
      }
    }
  });

  it('clamps the count rather than trusting it', () => {
    expect(generateWords('cvc', cleared, 'seed')).toHaveLength(MINIMUM_WORD_COUNT);
    expect(generateWords('cvc', 10_000, 'seed').length).toBeLessThanOrEqual(MAXIMUM_WORD_COUNT);
  });

  it('generates from the pattern the page opens with', () => {
    expect(generateWords(DEFAULT_PATTERN, 3, 'seed')).toHaveLength(3);
  });
});

describe('wordPatternSheet', () => {
  it('carries the syntax and the elements', () => {
    const sheet = wordPatternSheet();

    expect(sheet.title).toBe(WORD_PATTERN_SHEET_TITLE);
    expect(sheet.syntax).toEqual(PATTERN_SYNTAX);
    expect(sheet.elements.length).toBe(allElements.length);
    expect(sheet.sample).toBeUndefined();
  });

  it('carries a sample that has words in it', () => {
    const sheet = wordPatternSheet({ pattern: 'cvc', seed: 'seed', words: ['bod', 'gan'] });

    expect(sheet.sample?.words).toEqual(['bod', 'gan']);
  });

  it('drops a sample with nothing in it rather than heading an empty list', () => {
    expect(wordPatternSheet({ pattern: '', seed: 'seed', words: [] }).sample).toBeUndefined();
  });
});

describe('sheetToMarkdown', () => {
  it('writes both tables, headed', () => {
    const markdown = sheetToMarkdown(wordPatternSheet());

    expect(markdown.startsWith(`# ${WORD_PATTERN_SHEET_TITLE}\n\n`)).toBe(true);
    expect(markdown).toContain('## Pattern syntax');
    expect(markdown).toContain('| Syntax | Meaning | Example |');
    expect(markdown).toContain('## Elements');
    expect(markdown).toContain('| Name | Symbol | Elements |');
    expect(markdown).toContain('| consonants | `c` |');
    expect(markdown.endsWith('\n')).toBe(true);
  });

  it('omits the sample section when no pattern has been run', () => {
    expect(sheetToMarkdown(wordPatternSheet())).not.toContain('## Sample');
  });

  it('writes the sample with the seed that produced it', () => {
    const words = generateWords('cvc', 3, 'a-fixed-seed');
    const markdown = sheetToMarkdown(
      wordPatternSheet({ pattern: 'cvc', seed: 'a-fixed-seed', words }),
    );

    expect(markdown).toContain('## Sample');
    expect(markdown).toContain('Pattern `cvc`, seed `a-fixed-seed`');
    expect(markdown).toContain(`- ${words[0]}`);
  });

  it('never leaves a blank line inside a table', () => {
    expect(sheetToMarkdown(wordPatternSheet())).not.toContain('|\n\n|');
  });

  it('escapes the one element set that is made of table separators', () => {
    // The clicks set is `|`, `||`, `|!`. Unescaped, that row splits into five columns and takes the
    // rest of the table's alignment with it.
    const clicks = sheetToMarkdown(wordPatternSheet())
      .split('\n')
      .find((line) => line.startsWith('| clicks '));

    expect(clicks).toBeDefined();
    expect(clicks).not.toBeUndefined();
    expect(clicks?.split(/(?<!\\)\|/).length).toBe(5);
  });
});

describe('sheetToText', () => {
  it('writes the same sheet without pipes or the title the PDF draws itself', () => {
    const text = sheetToText(wordPatternSheet());

    // Not "contains no pipe": the clicks element set is `|`, `||`, `|!`, so the vocabulary itself
    // holds the character. What must be absent is a Markdown table built out of it.
    expect(text).not.toMatch(/^\|/m);
    expect(text).not.toContain('| --- |');
    expect(text).not.toContain(WORD_PATTERN_SHEET_TITLE);
    expect(text).toContain('Pattern syntax');
    expect(text).toContain('Elements');
    expect(text).toContain('consonants');
  });

  it('quotes the sample without Markdown, since a PDF renders none', () => {
    const text = sheetToText(
      wordPatternSheet({ pattern: 'cvc', seed: 'a-fixed-seed', words: ['bod'] }),
    );

    expect(text).toContain('Pattern "cvc", seed "a-fixed-seed"');
    expect(text).not.toContain('`');
  });

  it('has no run of blank lines anywhere in it', () => {
    expect(sheetToText(wordPatternSheet())).not.toMatch(/\n\s*\n\s*\n/);
  });
});
