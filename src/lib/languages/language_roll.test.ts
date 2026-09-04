import { describe, expect, it } from 'vitest';

import { rollLanguage, rollLanguageSnapshot } from './language_roll';

describe('rollLanguage', () => {
  /**
   * Requirement 2.2, and the test #74 explicitly asks for.
   *
   * "Regenerate from the seed" is only ever a storage strategy if it actually holds, and the way to
   * know is to generate the same language twice from one seed and compare the lexicon word for
   * word. This design stores the lexicon rather than relying on regeneration — but the re-roll does
   * rely on it, so the property is what makes 4.3 honest rather than a button that returns
   * something different every time it is pressed.
   */
  it('gives the same language, word for word, from the same seed', () => {
    for (let index = 0; index < 10; index += 1) {
      const seed = `determinism-${index}`;
      const first = rollLanguage(seed);
      const second = rollLanguage(seed);

      expect(second.name).toBe(first.name);
      expect(second.lexicon.words.length).toBe(first.lexicon.words.length);
      for (let word = 0; word < first.lexicon.words.length; word += 1) {
        expect(second.lexicon.words[word]).toEqual(first.lexicon.words[word]);
      }
      expect(second).toEqual(first);
    }
  });

  it('gives a different language for a different seed', () => {
    const names = new Set(
      Array.from({ length: 20 }, (_value, index) => rollLanguage(`vary-${index}`).name),
    );

    expect(names.size).toBeGreaterThan(1);
  });

  it('names every language it rolls, so a vault listing can tell them apart', () => {
    // Requirement 3.5, and what `nameOf` depends on.
    for (let index = 0; index < 20; index += 1) {
      expect(rollLanguage(`named-${index}`).name.trim()).not.toBe('');
    }
  });

  it('rolls a lexicon of a usable size', () => {
    // Measured rather than assumed, because #74 asks for the number: about 1,760 words and 144 KB
    // of JSON, which is the largest payload the site stores and still far below anything
    // `$lib/storage_status` reports on.
    const language = rollLanguage('size-seed');
    const bytes = new TextEncoder().encode(JSON.stringify(language)).length;

    expect(language.lexicon.words.length).toBeGreaterThan(1000);
    expect(bytes).toBeLessThan(1_000_000);
  });

  it('rolls a snapshot that is the snapshot of the language it rolled', () => {
    expect(rollLanguageSnapshot('same-seed')).toEqual(rollLanguage('same-seed'));
  });
});
