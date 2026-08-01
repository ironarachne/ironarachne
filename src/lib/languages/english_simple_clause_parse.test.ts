import { describe, expect, it } from 'vitest';
import { parseEnglishSimpleClause } from './english_simple_clause_parse';
import {
  splitEnglishPossessiveNounToken,
  tryParseEnglishPossessiveNounPhrase,
} from './english_possessive_parse';
import type { Lexicon, SimpleClauseIr, SimpleTranslationErr, Word } from './language_types';
import { buildLexiconTranslationIndex } from './lexicon_translation_index';

function word(root: string, meaning: string, speechPart: string): Word {
  return { root, pronunciation: root, speechPart, meaning };
}

const LEXICON: Lexicon = {
  words: [
    word('mika', 'cat', 'noun'),
    word('doru', 'dog', 'noun'),
    word('vasu', 'sword', 'noun'),
    word('nolu', 'man', 'noun'),
    word('kesi', 'city', 'noun'),
    word('teshi', 'see', 'verb'),
    word('kanu', 'run', 'verb'),
    word('zel', 'the', 'article'),
    word('ken', 'a', 'article'),
    word('ori', 'they', 'pronoun'),
    word('esa', 'she', 'pronoun'),
  ],
};

const INDEX = buildLexiconTranslationIndex(LEXICON);
const NOUNS = new Set(['cat', 'dog', 'sword', 'man', 'city']);

function parse(sentence: string): SimpleClauseIr | SimpleTranslationErr {
  return parseEnglishSimpleClause(sentence, INDEX);
}

function isErr(value: SimpleClauseIr | SimpleTranslationErr): value is SimpleTranslationErr {
  return 'ok' in value && value.ok === false;
}

describe('parseEnglishSimpleClause', () => {
  it('parses a transitive clause with articles on both sides', () => {
    expect(parse('the cat sees a dog')).toEqual({
      subject: { definiteness: 'definite', headMeaning: 'cat', number: 'singular' },
      verb: { lemmaMeaning: 'see', tense: 'present' },
      object: { definiteness: 'indefinite', headMeaning: 'dog', number: 'singular' },
    });
  });

  it('parses an intransitive clause', () => {
    expect(parse('the dog runs')).toEqual({
      subject: { definiteness: 'definite', headMeaning: 'dog', number: 'singular' },
      verb: { lemmaMeaning: 'run', tense: 'present' },
    });
  });

  it('reads "an" as an indefinite article', () => {
    const parsed = parse('an cat runs');
    expect(isErr(parsed) ? parsed.message : parsed.subject.definiteness).toBe('indefinite');
  });

  it('leaves a bare noun phrase unspecified for definiteness', () => {
    expect(parse('cats run')).toEqual({
      subject: { definiteness: 'unspecified', headMeaning: 'cat', number: 'plural' },
      verb: { lemmaMeaning: 'run', tense: 'present' },
    });
  });

  it('carries plural and past through to the IR', () => {
    expect(parse('the cats saw the dogs')).toEqual({
      subject: { definiteness: 'definite', headMeaning: 'cat', number: 'plural' },
      verb: { lemmaMeaning: 'see', tense: 'past' },
      object: { definiteness: 'definite', headMeaning: 'dog', number: 'plural' },
    });
  });

  describe('pronouns', () => {
    it('parses a pronoun subject with its number', () => {
      expect(parse('they run')).toEqual({
        subject: { definiteness: 'unspecified', headMeaning: 'they', number: 'plural' },
        verb: { lemmaMeaning: 'run', tense: 'present' },
      });
      expect(parse('she runs')).toEqual({
        subject: { definiteness: 'unspecified', headMeaning: 'she', number: 'singular' },
        verb: { lemmaMeaning: 'run', tense: 'present' },
      });
    });

    it('refuses an article in front of a pronoun', () => {
      const parsed = parse('the they run');
      expect(isErr(parsed)).toBe(true);
    });

    it('parses a pronoun object', () => {
      const parsed = parse('the cat sees they');
      expect(isErr(parsed) ? parsed.message : parsed.object?.headMeaning).toBe('they');
    });
  });

  describe('possessives', () => {
    it('parses a possessor on the subject', () => {
      expect(parse("the man's sword runs")).toEqual({
        subject: {
          definiteness: 'definite',
          headMeaning: 'sword',
          number: 'singular',
          possessor: { nounLemma: 'man', number: 'singular', definiteness: 'definite' },
        },
        verb: { lemmaMeaning: 'run', tense: 'present' },
      });
    });

    it('parses a possessor with no leading article as unspecified', () => {
      const parsed = parse("man's sword runs");
      expect(isErr(parsed) ? parsed.message : parsed.subject.possessor).toEqual({
        nounLemma: 'man',
        number: 'singular',
        definiteness: 'unspecified',
      });
    });

    it('reads a plural possessor', () => {
      /* The parser wants an explicit apostrophe-s, so a plural possessor is written "cities's". */
      const parsed = parse("cities's sword runs");
      expect(isErr(parsed) ? parsed.message : parsed.subject.possessor).toEqual({
        nounLemma: 'city',
        number: 'plural',
        definiteness: 'unspecified',
      });
    });
  });

  describe('rejected input', () => {
    const cases: [label: string, sentence: string, pattern: RegExp][] = [
      ['an empty sentence', '   ', /Empty sentence/],
      ['an unknown subject', 'xyzzy runs', /subject noun phrase/],
      ['an unknown verb', 'the cat xyzzys a dog', /verb/],
      ['an unknown object', 'the cat sees a xyzzy', /object noun phrase/],
      ['tokens after the object', 'the cat sees a dog cat', /Extra tokens/],
      ['an article with nothing after it', 'the', /subject noun phrase/],
      ['a subject with no verb', 'the cat', /verb/],
    ];

    it.each(cases)('rejects %s', (_label, sentence, pattern) => {
      const parsed = parse(sentence);
      expect(isErr(parsed)).toBe(true);
      if (isErr(parsed)) {
        expect(parsed.message).toMatch(pattern);
      }
    });
  });
});

describe('splitEnglishPossessiveNounToken', () => {
  const cases: [token: string, owner: string | null][] = [
    ["cat's", 'cat'],
    ["Cat's", 'Cat'],
    ["cats's", 'cats'],
    ['cat', null],
    ["'s", null],
    ['cats', null],
  ];

  it.each(cases)('%s → %s', (token, owner) => {
    const split = splitEnglishPossessiveNounToken(token);
    expect(split === null ? null : split.ownerSurface).toBe(owner);
  });
});

describe('tryParseEnglishPossessiveNounPhrase', () => {
  it('returns null when the start index is past the end', () => {
    expect(tryParseEnglishPossessiveNounPhrase(["man's", 'sword'], 5, NOUNS, null)).toBeNull();
  });

  it('returns null when the possessive has no following head noun', () => {
    expect(tryParseEnglishPossessiveNounPhrase(["man's"], 0, NOUNS, null)).toBeNull();
  });

  it('returns null when the owner is not a known noun', () => {
    expect(tryParseEnglishPossessiveNounPhrase(["xyzzy's", 'sword'], 0, NOUNS, null)).toBeNull();
  });

  it('returns null when the head is not a known noun', () => {
    expect(tryParseEnglishPossessiveNounPhrase(["man's", 'xyzzy'], 0, NOUNS, null)).toBeNull();
  });

  it('applies the leading article definiteness to both possessor and head', () => {
    const parsed = tryParseEnglishPossessiveNounPhrase(["man's", 'sword'], 0, NOUNS, 'definite');
    expect(parsed).toEqual({
      value: {
        possessor: { nounLemma: 'man', number: 'singular', definiteness: 'definite' },
        headLemma: 'sword',
        headNumber: 'singular',
        headDefiniteness: 'definite',
      },
      nextIndex: 2,
    });
  });

  it('consumes exactly the two tokens it used', () => {
    const parsed = tryParseEnglishPossessiveNounPhrase(
      ['the', "man's", 'sword', 'runs'],
      1,
      NOUNS,
      null,
    );
    expect(parsed?.nextIndex).toBe(3);
  });
});
