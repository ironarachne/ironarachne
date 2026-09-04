import { describe, expect, it } from 'vitest';

import { rollLanguageSnapshot } from './language_roll';
import {
  articleDescription,
  glossaryLine,
  glossarySections,
  languageDisplayName,
  languageFileStem,
  languageToDocument,
  languageToMarkdown,
  languageToText,
  possessionDescription,
  speechPartHeading,
} from './language_presentation';
import type { LanguageSnapshot } from './language_snapshot';

const LANGUAGE = rollLanguageSnapshot('presentation-seed');

function headings(snapshot: LanguageSnapshot): string[] {
  return languageToDocument(snapshot).sections.map((entry) => entry.heading);
}

/** A language stripped to its rules, for the empty-section cases. */
function withWords(words: LanguageSnapshot['lexicon']['words']): LanguageSnapshot {
  return { ...LANGUAGE, lexicon: { words } };
}

describe('languageToDocument', () => {
  it('prints the blocks a conlang document is read from', () => {
    expect(headings(LANGUAGE)).toEqual(
      expect.arrayContaining(['Typology', 'Orthography', 'Morphology', 'Syntax', 'Nouns']),
    );
  });

  it('drops a part of speech the lexicon has none of', () => {
    // 6.4: a user who has deleted every adjective should not be handed an Adjectives heading with
    // nothing beneath it.
    const nounsOnly = withWords(
      LANGUAGE.lexicon.words.filter((word) => word.speechPart === 'noun'),
    );

    expect(headings(nounsOnly)).toContain('Nouns');
    expect(headings(nounsOnly)).not.toContain('Adjectives');
    expect(headings(nounsOnly)).not.toContain('Verbs');
  });

  it('still prints the rules for a language with no words left at all', () => {
    // Requirement 3.3's counterpart in the exports: an emptied lexicon is still a language.
    const empty = withWords([]);

    expect(headings(empty)).toContain('Typology');
    expect(headings(empty)).toContain('Syntax');
    expect(headings(empty)).not.toContain('Nouns');
  });

  it('drops the orthography section when there is nothing to say', () => {
    expect(headings({ ...LANGUAGE, orthographySummary: '   ' })).not.toContain('Orthography');
  });

  it('drops a morphology line whose affix is empty rather than printing a blank rule', () => {
    const noPlural = {
      ...LANGUAGE,
      morphology: { ...LANGUAGE.morphology, pluralAffix: '' },
    };
    const document = languageToDocument(noPlural);
    const morphology = document.sections.find((entry) => entry.heading === 'Morphology');

    expect(morphology?.items.some((item) => item.startsWith('Plural:'))).toBe(false);
    expect(morphology?.items.some((item) => item.startsWith('Past tense:'))).toBe(true);
  });

  it('drops the morphology section entirely when the language inflects for nothing', () => {
    const uninflected = {
      ...LANGUAGE,
      morphology: { ...LANGUAGE.morphology, pluralAffix: '', pastAffix: '' },
    };

    expect(headings(uninflected)).not.toContain('Morphology');
  });

  it('shows an inflection on a real word, an affix alone being hard to read', () => {
    const document = languageToDocument(LANGUAGE);
    const morphology = document.sections.find((entry) => entry.heading === 'Morphology');

    expect(morphology?.items[0]).toContain('becomes');
  });

  it('prints the inflection rule without an example when there is no word to show it on', () => {
    const document = languageToDocument(withWords([]));
    const morphology = document.sections.find((entry) => entry.heading === 'Morphology');

    expect(morphology?.items.some((item) => item.startsWith('Plural:'))).toBe(true);
    expect(morphology?.items.every((item) => !item.includes('becomes'))).toBe(true);
  });
});

describe('the glossary', () => {
  it('groups by part of speech and alphabetises by gloss within each', () => {
    // The generator emits words in bucket order, which is neither what a reader wants nor stable
    // to diff against.
    const nouns = glossarySections(LANGUAGE).find((entry) => entry.heading === 'Nouns');
    const glosses = nouns?.items ?? [];

    expect(glosses.length).toBeGreaterThan(0);
    const meanings = glosses.map((line) => line.split(' — ')[1]);
    expect(meanings).toEqual([...meanings].sort((a, b) => a.localeCompare(b)));
  });

  it('prints a line as form, pronunciation and gloss', () => {
    expect(
      glossaryLine({ root: 'ven', pronunciation: 'vɛn', speechPart: 'noun', meaning: 'stone' }),
    ).toBe('ven /vɛn/ — stone');
  });

  it('omits the pronunciation when there is none rather than printing empty slashes', () => {
    expect(
      glossaryLine({ root: 'ven', pronunciation: '', speechPart: 'noun', meaning: 'stone' }),
    ).toBe('ven — stone');
  });

  it('pluralises a part of speech for its heading', () => {
    expect(speechPartHeading('noun')).toBe('Nouns');
    expect(speechPartHeading('adverb')).toBe('Adverbs');
    expect(speechPartHeading('')).toBe('Other');
  });
});

describe('the prose descriptions', () => {
  it('says what the language does with articles', () => {
    expect(articleDescription({ ...LANGUAGE, articleSystem: 'none' })).toContain('no articles');
    expect(articleDescription({ ...LANGUAGE, articleSystem: 'definite_only' })).toContain(
      'no indefinite one',
    );
    expect(articleDescription({ ...LANGUAGE, articleSystem: 'definite_and_indefinite' })).toContain(
      'both',
    );
  });

  it('says how the language marks possession, in words rather than as a union tag', () => {
    expect(possessionDescription({ ...LANGUAGE, possessionStrategy: { kind: 'none' } })).toContain(
      'unmarked',
    );
    expect(
      possessionDescription({
        ...LANGUAGE,
        possessionStrategy: { kind: 'juxtapose_possessor_before' },
      }),
    ).toContain('before');
    expect(
      possessionDescription({
        ...LANGUAGE,
        possessionStrategy: { kind: 'marker_on_possessed', affix: 'ka', placement: 'suffix' },
      }),
    ).toContain('suffix “ka”');
  });
});

describe('the exports', () => {
  it('writes Markdown headed by the language name', () => {
    const markdown = languageToMarkdown(LANGUAGE);

    expect(markdown.startsWith(`# ${LANGUAGE.name}`)).toBe(true);
    expect(markdown).toContain('## Typology');
    expect(markdown).toContain(`- Word order: ${LANGUAGE.wordOrder}`);
    expect(markdown.endsWith('\n')).toBe(true);
  });

  it('never writes a heading with nothing under it', () => {
    // The claim 6.4 actually makes, asserted over the rendered text rather than the model.
    const markdown = languageToMarkdown(withWords([]));

    expect(markdown).not.toMatch(/## [^\n]+\n\n(##|$)/);
  });

  it('writes the PDF body without the title the PDF draws itself', () => {
    const text = languageToText(LANGUAGE);

    expect(text).not.toContain(`# ${LANGUAGE.name}`);
    expect(text).toContain('Typology');
    expect(text).toContain(`  Word order: ${LANGUAGE.wordOrder}`);
  });

  it('names the file after the language', () => {
    expect(languageFileStem({ ...LANGUAGE, name: 'Keth Ric' })).toBe('language-keth-ric');
  });

  it('has a name and a filename for a language that has neither', () => {
    expect(languageDisplayName({ ...LANGUAGE, name: '  ' })).toBe('Language');
    expect(languageFileStem({ ...LANGUAGE, name: '???' })).toBe('language');
  });
});
