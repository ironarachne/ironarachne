import { RNG } from '@ironarachne/rng';
import { describe, expect, it } from 'vitest';

import { rollLanguage } from './language_roll';
import {
  languageFromSnapshot,
  languageFromSnapshotWithRng,
  toLanguageSnapshot,
} from './language_snapshot';

const LANGUAGE = rollLanguage('snapshot-seed');
const SNAPSHOT = toLanguageSnapshot(LANGUAGE);

describe('toLanguageSnapshot', () => {
  it('carries every field, there being no closure to strip', () => {
    // The library is twenty-nine modules; the payload is ten fields of plain data. The Maps and
    // Sets live in the translation machinery, which builds them from a language rather than
    // storing them in one.
    expect(SNAPSHOT).toEqual(LANGUAGE);
  });

  it('is storable', () => {
    expect(() => structuredClone(SNAPSHOT)).not.toThrow();
  });

  it('hands back a fresh object graph, so an editor cannot write into the page', () => {
    expect(SNAPSHOT.lexicon).not.toBe(LANGUAGE.lexicon);
    expect(SNAPSHOT.lexicon.words[0]).not.toBe(LANGUAGE.lexicon.words[0]);
    expect(SNAPSHOT.morphology).not.toBe(LANGUAGE.morphology);
    expect(SNAPSHOT.syllablePattern).not.toBe(LANGUAGE.syllablePattern);
  });

  it('stores the lexicon whole rather than a seed to rebuild it from', () => {
    // #74 asks whether to store the lexicon or regenerate it. The answer is store: a user who
    // renames one word has edited the language, and 4.2 says a seed may not overrule that.
    expect(SNAPSHOT.lexicon.words.length).toBeGreaterThan(1000);
    expect(SNAPSHOT.lexicon.words[0].meaning).toBe(LANGUAGE.lexicon.words[0].meaning);
  });
});

describe('the round trip', () => {
  // Requirement 7.2, over a spread of seeds rather than one, because a language's shape varies:
  // the possession strategy is a union whose `marker_on_possessed` variant carries two fields the
  // other three do not.
  it('is lossless across many seeds', () => {
    for (let index = 0; index < 20; index += 1) {
      const language = rollLanguage(`round-trip-${index}`);

      expect(languageFromSnapshot(toLanguageSnapshot(language))).toEqual(language);
    }
  });

  it('is lossless for a language that marks possession with an affix', () => {
    const marked = {
      ...SNAPSHOT,
      possessionStrategy: {
        kind: 'marker_on_possessed' as const,
        affix: 'ka',
        placement: 'suffix' as const,
      },
    };

    expect(languageFromSnapshot(marked)).toEqual(marked);
  });

  it('does not regenerate the lexicon on the way back', () => {
    // The words in a stored language are the words the user kept. Re-running `createLexicon` over
    // them would be the re-roll wearing a read's clothing.
    const edited = {
      ...SNAPSHOT,
      lexicon: {
        words: SNAPSHOT.lexicon.words.map((word, index) =>
          index === 0 ? { ...word, root: 'zzyzx' } : word,
        ),
      },
    };

    expect(languageFromSnapshot(edited).lexicon.words[0].root).toBe('zzyzx');
  });

  it('draws nothing from the RNG the registry hands it', () => {
    const rng = new RNG('unused');

    expect(languageFromSnapshotWithRng(SNAPSHOT, rng)).toEqual(
      languageFromSnapshotWithRng(SNAPSHOT, rng),
    );
  });
});
