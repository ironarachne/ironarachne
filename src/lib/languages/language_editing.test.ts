import { describe, expect, it } from 'vitest';

import {
  addLexiconWord,
  filterLexicon,
  languageSyllablePatternText,
  lexiconSpeechParts,
  removeLexiconWord,
  setLanguageArticleSystem,
  setLanguageMorphologyAffix,
  setLanguageMorphologyPlacement,
  setLanguagePossessionKind,
  setLanguagePossessionMarker,
  setLanguageSyllablePattern,
  setLanguageText,
  setLanguageWordOrder,
  setLexiconWordField,
} from './language_editing';
import { rollLanguageSnapshot } from './language_roll';

const LANGUAGE = rollLanguageSnapshot('editing-seed');

describe('the identity fields', () => {
  it('rewrites one without disturbing the lexicon', () => {
    const renamed = setLanguageText(LANGUAGE, 'name', 'Kethric');

    expect(renamed.name).toBe('Kethric');
    expect(renamed.lexicon).toBe(LANGUAGE.lexicon);
    expect(LANGUAGE.name).not.toBe('Kethric');
  });
});

describe('the syllable template', () => {
  it('reads and writes the CVC string a conlanger types', () => {
    const changed = setLanguageSyllablePattern(LANGUAGE, 'cvc');

    expect(changed.syllablePattern).toEqual(['C', 'V', 'C']);
    expect(languageSyllablePatternText(changed)).toBe('CVC');
  });

  it('drops anything that is not a slot rather than fighting a half-typed field', () => {
    expect(setLanguageSyllablePattern(LANGUAGE, 'C-V x C').syllablePattern).toEqual([
      'C',
      'V',
      'C',
    ]);
    expect(setLanguageSyllablePattern(LANGUAGE, '').syllablePattern).toEqual([]);
  });

  it('does not rebuild the words that were built from the old template', () => {
    // Requirement 4.2: a conlanger who rewrote a word has made a decision, and regenerating the
    // lexicon whenever a rule changed would throw away every one of them.
    expect(setLanguageSyllablePattern(LANGUAGE, 'V').lexicon).toBe(LANGUAGE.lexicon);
  });
});

describe('the syntax fields', () => {
  it('changes the word order and the article system on their own', () => {
    expect(setLanguageWordOrder(LANGUAGE, 'OSV').wordOrder).toBe('OSV');
    expect(setLanguageArticleSystem(LANGUAGE, 'definite_only').articleSystem).toBe('definite_only');
  });

  it('gives a new possession marker a plausible affix rather than an empty one', () => {
    // An empty affix is one the translator emits as nothing, which reads as a bug rather than as a
    // field waiting to be filled in. Started from an explicitly unmarked language, because this
    // seed's own language already marks possession and switching to the kind it already has is the
    // no-op the next test asserts.
    const unmarked = setLanguagePossessionKind(LANGUAGE, 'none');
    const marked = setLanguagePossessionKind(unmarked, 'marker_on_possessed');

    expect(marked.possessionStrategy).toEqual({
      kind: 'marker_on_possessed',
      affix: LANGUAGE.morphology.pluralAffix,
      placement: 'suffix',
    });
  });

  it('leaves an existing marker alone rather than resetting it', () => {
    const marked = setLanguagePossessionKind(
      setLanguagePossessionKind(LANGUAGE, 'none'),
      'marker_on_possessed',
    );
    const edited = setLanguagePossessionMarker(marked, { affix: 'zu', placement: 'prefix' });

    expect(setLanguagePossessionKind(edited, 'marker_on_possessed')).toBe(edited);
    expect(edited.possessionStrategy).toEqual({
      kind: 'marker_on_possessed',
      affix: 'zu',
      placement: 'prefix',
    });
  });

  it('discards the affix when switching to a variant that has none', () => {
    const marked = setLanguagePossessionKind(
      setLanguagePossessionKind(LANGUAGE, 'none'),
      'marker_on_possessed',
    );

    expect(
      setLanguagePossessionKind(marked, 'juxtapose_possessor_before').possessionStrategy,
    ).toEqual({ kind: 'juxtapose_possessor_before' });
  });

  it('ignores a marker edit on a language that has no marker', () => {
    const unmarked = setLanguagePossessionKind(LANGUAGE, 'none');

    expect(setLanguagePossessionMarker(unmarked, { affix: 'zu' })).toBe(unmarked);
  });
});

describe('the morphology', () => {
  it('changes one affix and its placement without re-inflecting the lexicon', () => {
    const changed = setLanguageMorphologyPlacement(
      setLanguageMorphologyAffix(LANGUAGE, 'pluralAffix', 'oth'),
      'pluralPlacement',
      'prefix',
    );

    expect(changed.morphology.pluralAffix).toBe('oth');
    expect(changed.morphology.pluralPlacement).toBe('prefix');
    expect(changed.morphology.pastAffix).toBe(LANGUAGE.morphology.pastAffix);
    expect(changed.lexicon).toBe(LANGUAGE.lexicon);
  });
});

describe('the lexicon', () => {
  it('rewrites one word without disturbing its neighbours', () => {
    const changed = setLexiconWordField(LANGUAGE, 3, 'root', 'zzyzx');

    expect(changed.lexicon.words[3].root).toBe('zzyzx');
    expect(changed.lexicon.words[2]).toBe(LANGUAGE.lexicon.words[2]);
    expect(changed.lexicon.words[4]).toBe(LANGUAGE.lexicon.words[4]);
  });

  it('ignores an index that is not there', () => {
    expect(setLexiconWordField(LANGUAGE, -1, 'root', 'x')).toBe(LANGUAGE);
    expect(setLexiconWordField(LANGUAGE, 99_999, 'root', 'x')).toBe(LANGUAGE);
    expect(removeLexiconWord(LANGUAGE, 99_999)).toBe(LANGUAGE);
  });

  it('takes a word out', () => {
    const gone = removeLexiconWord(LANGUAGE, 0);

    expect(gone.lexicon.words.length).toBe(LANGUAGE.lexicon.words.length - 1);
    expect(gone.lexicon.words[0]).toBe(LANGUAGE.lexicon.words[1]);
  });

  it('adds a blank word of the part of speech asked for', () => {
    const added = addLexiconWord(LANGUAGE, 'verb');
    const word = added.lexicon.words[added.lexicon.words.length - 1];

    expect(word).toEqual({ root: '', pronunciation: '', speechPart: 'verb', meaning: '' });
  });
});

describe('filterLexicon', () => {
  it('returns every word when nothing is asked for', () => {
    expect(filterLexicon(LANGUAGE, '').length).toBe(LANGUAGE.lexicon.words.length);
  });

  it('carries the index into the unfiltered lexicon, not into the filtered view', () => {
    // The whole reason this returns pairs: an index into a filtered list changes as the user types
    // in the search box, and a handler holding one would rewrite the wrong word.
    const matches = filterLexicon(LANGUAGE, LANGUAGE.lexicon.words[500].meaning);
    const found = matches.find((entry) => entry.index === 500);

    expect(found?.word).toBe(LANGUAGE.lexicon.words[500]);
  });

  it('matches on the gloss and on the form, case-insensitively', () => {
    const word = LANGUAGE.lexicon.words[10];

    expect(filterLexicon(LANGUAGE, word.meaning.toUpperCase()).length).toBeGreaterThan(0);
    expect(filterLexicon(LANGUAGE, word.root.toUpperCase()).length).toBeGreaterThan(0);
  });

  it('narrows to one part of speech', () => {
    const verbs = filterLexicon(LANGUAGE, '', 'verb');

    expect(verbs.length).toBeGreaterThan(0);
    expect(verbs.every((entry) => entry.word.speechPart === 'verb')).toBe(true);
  });

  it('returns nothing for a search that matches nothing', () => {
    expect(filterLexicon(LANGUAGE, 'qqqqzzzz-not-a-word')).toEqual([]);
  });
});

describe('lexiconSpeechParts', () => {
  it('lists each part of speech once', () => {
    const parts = lexiconSpeechParts(LANGUAGE);

    expect(parts).toContain('noun');
    expect(parts).toContain('verb');
    expect(new Set(parts).size).toBe(parts.length);
    expect([...parts].sort()).toEqual(parts);
  });
});
