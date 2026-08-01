import { describe, expect, it } from 'vitest';
import { linearizeSimpleClauseIrToConlang } from './clause_ir_linearize_to_conlang';
import { parseConlangSimpleClauseToIr } from './conlang_simple_clause_parse';
import type {
  ArticleSystem,
  ConstructedLanguage,
  Lexicon,
  PossessionStrategy,
  SimpleClauseIr,
  SimpleTranslationErr,
  Word,
  WordOrder,
} from './language_types';
import { buildLexiconTranslationIndex } from './lexicon_translation_index';
import { translateConstructedLanguageSentenceToEnglish } from './translate_constructed_language_to_english';

function word(root: string, meaning: string, speechPart: string): Word {
  return { root, pronunciation: root, speechPart, meaning };
}

/** A hand-built lexicon, so every conlang surface in these tests is predictable. */
const LEXICON: Lexicon = {
  words: [
    word('mika', 'cat', 'noun'),
    word('doru', 'dog', 'noun'),
    word('vasu', 'sword', 'noun'),
    word('nolu', 'man', 'noun'),
    word('teshi', 'see', 'verb'),
    word('kanu', 'run', 'verb'),
    word('zel', 'the', 'article'),
    word('ken', 'a', 'article'),
    word('ori', 'they', 'pronoun'),
    word('esa', 'she', 'pronoun'),
  ],
};

function testLanguage(overrides: Partial<ConstructedLanguage> = {}): ConstructedLanguage {
  return {
    name: 'Testish',
    phonemeSetName: 'test',
    wordOrder: 'SVO',
    syllableProfile: 'CV',
    syllablePattern: ['C', 'V'],
    morphology: {
      pluralAffix: 'ni',
      pastAffix: 'ta',
      pluralPlacement: 'suffix',
      pastPlacement: 'suffix',
    },
    orthographySummary: 'test orthography',
    lexicon: LEXICON,
    articleSystem: 'definite_and_indefinite',
    possessionStrategy: { kind: 'juxtapose_possessor_before' },
    ...overrides,
  };
}

function render(clause: SimpleClauseIr, language: ConstructedLanguage): string {
  return linearizeSimpleClauseIrToConlang(
    language,
    clause,
    buildLexiconTranslationIndex(language.lexicon),
  );
}

function parse(text: string, language: ConstructedLanguage) {
  return parseConlangSimpleClauseToIr(
    text,
    language,
    buildLexiconTranslationIndex(language.lexicon),
  );
}

function isErr(value: SimpleClauseIr | SimpleTranslationErr): value is SimpleTranslationErr {
  return 'ok' in value && value.ok === false;
}

const TRANSITIVE: SimpleClauseIr = {
  subject: { definiteness: 'definite', headMeaning: 'cat', number: 'singular' },
  verb: { lemmaMeaning: 'see', tense: 'present' },
  object: { definiteness: 'indefinite', headMeaning: 'dog', number: 'singular' },
};

describe('linearizing a clause to conlang', () => {
  it('places constituents in the language’s word order', () => {
    const orders: [WordOrder, string][] = [
      ['SVO', 'zel mika teshi ken doru'],
      ['SOV', 'zel mika ken doru teshi'],
      ['VSO', 'teshi zel mika ken doru'],
      ['VOS', 'teshi ken doru zel mika'],
      ['OVS', 'ken doru teshi zel mika'],
      ['OSV', 'ken doru zel mika teshi'],
    ];
    for (const [wordOrder, expected] of orders) {
      expect(render(TRANSITIVE, testLanguage({ wordOrder }))).toBe(expected);
    }
  });

  it('omits the object slot entirely for an intransitive clause', () => {
    const intransitive: SimpleClauseIr = {
      subject: { definiteness: 'definite', headMeaning: 'dog', number: 'singular' },
      verb: { lemmaMeaning: 'run', tense: 'present' },
    };
    expect(render(intransitive, testLanguage({ wordOrder: 'SOV' }))).toBe('zel doru kanu');
  });

  it('affixes plural and past markers', () => {
    const clause: SimpleClauseIr = {
      subject: { definiteness: 'unspecified', headMeaning: 'cat', number: 'plural' },
      verb: { lemmaMeaning: 'see', tense: 'past' },
      object: { definiteness: 'unspecified', headMeaning: 'dog', number: 'plural' },
    };
    expect(render(clause, testLanguage())).toBe('mikani teshita doruni');
  });

  it('honours prefix placement for those affixes', () => {
    const clause: SimpleClauseIr = {
      subject: { definiteness: 'unspecified', headMeaning: 'cat', number: 'plural' },
      verb: { lemmaMeaning: 'see', tense: 'past' },
    };
    const language = testLanguage({
      morphology: {
        pluralAffix: 'ni',
        pastAffix: 'ta',
        pluralPlacement: 'prefix',
        pastPlacement: 'prefix',
      },
    });
    expect(render(clause, language)).toBe('nimika tateshi');
  });

  describe('article systems', () => {
    const cases: [ArticleSystem, string][] = [
      ['definite_and_indefinite', 'zel mika teshi ken doru'],
      /* Only the definite article surfaces; the indefinite object loses its marker. */
      ['definite_only', 'zel mika teshi doru'],
      ['none', 'mika teshi doru'],
    ];

    it.each(cases)('%s → %s', (articleSystem, expected) => {
      expect(render(TRANSITIVE, testLanguage({ articleSystem }))).toBe(expected);
    });
  });

  describe('possession strategies', () => {
    const possessed: SimpleClauseIr = {
      subject: {
        definiteness: 'unspecified',
        headMeaning: 'sword',
        number: 'singular',
        possessor: { nounLemma: 'man', number: 'singular', definiteness: 'unspecified' },
      },
      verb: { lemmaMeaning: 'run', tense: 'present' },
    };

    const cases: [PossessionStrategy, string][] = [
      [{ kind: 'juxtapose_possessor_before' }, 'nolu vasu kanu'],
      [{ kind: 'juxtapose_possessor_after' }, 'vasu nolu kanu'],
      [{ kind: 'marker_on_possessed', affix: 'ka', placement: 'suffix' }, 'nolu vasuka kanu'],
      [{ kind: 'marker_on_possessed', affix: 'ka', placement: 'prefix' }, 'nolu kavasu kanu'],
      /* With no possession strategy the possessor is simply dropped. */
      [{ kind: 'none' }, 'vasu kanu'],
    ];

    it.each(cases)('%o → %s', (possessionStrategy, expected) => {
      expect(render(possessed, testLanguage({ possessionStrategy }))).toBe(expected);
    });

    it('pluralizes the possessor as well as the head', () => {
      const clause: SimpleClauseIr = {
        subject: {
          definiteness: 'unspecified',
          headMeaning: 'sword',
          number: 'plural',
          possessor: { nounLemma: 'man', number: 'plural', definiteness: 'unspecified' },
        },
        verb: { lemmaMeaning: 'run', tense: 'present' },
      };
      expect(render(clause, testLanguage())).toBe('noluni vasuni kanu');
    });
  });

  describe('rejected clauses', () => {
    it('refuses a determiner on a pronoun', () => {
      const clause: SimpleClauseIr = {
        subject: { definiteness: 'definite', headMeaning: 'they', number: 'plural' },
        verb: { lemmaMeaning: 'run', tense: 'present' },
      };
      expect(() => render(clause, testLanguage())).toThrow(/Determiner on a pronoun/);
    });

    it('refuses a possessor on a pronoun', () => {
      const clause: SimpleClauseIr = {
        subject: {
          definiteness: 'unspecified',
          headMeaning: 'they',
          number: 'plural',
          possessor: { nounLemma: 'man', number: 'singular', definiteness: 'unspecified' },
        },
        verb: { lemmaMeaning: 'run', tense: 'present' },
      };
      expect(() => render(clause, testLanguage())).toThrow(/Possessor is not supported/);
    });

    it('reports vocabulary the lexicon does not have', () => {
      const missingNoun: SimpleClauseIr = {
        subject: { definiteness: 'unspecified', headMeaning: 'wolf', number: 'singular' },
        verb: { lemmaMeaning: 'run', tense: 'present' },
      };
      expect(() => render(missingNoun, testLanguage())).toThrow(/Missing noun for "wolf"/);

      const missingVerb: SimpleClauseIr = {
        subject: { definiteness: 'unspecified', headMeaning: 'cat', number: 'singular' },
        verb: { lemmaMeaning: 'sing', tense: 'present' },
      };
      expect(() => render(missingVerb, testLanguage())).toThrow(/Missing verb lemma "sing"/);

      const missingPossessor: SimpleClauseIr = {
        subject: {
          definiteness: 'unspecified',
          headMeaning: 'sword',
          number: 'singular',
          possessor: { nounLemma: 'wolf', number: 'singular', definiteness: 'unspecified' },
        },
        verb: { lemmaMeaning: 'run', tense: 'present' },
      };
      expect(() => render(missingPossessor, testLanguage())).toThrow(
        /Missing possessor noun "wolf"/,
      );
    });

    it('reports an article the lexicon does not have', () => {
      const withoutArticles = testLanguage({
        lexicon: { words: LEXICON.words.filter((w) => w.speechPart !== 'article') },
      });
      expect(() => render(TRANSITIVE, withoutArticles)).toThrow(/Missing article "the"/);
    });
  });
});

describe('parsing a conlang clause back to IR', () => {
  it('round-trips a transitive clause in every word order', () => {
    for (const wordOrder of ['SVO', 'SOV', 'VSO', 'VOS', 'OVS', 'OSV'] as WordOrder[]) {
      const language = testLanguage({ wordOrder });
      const parsed = parse(render(TRANSITIVE, language), language);
      expect(isErr(parsed) ? parsed.message : parsed).toEqual(TRANSITIVE);
    }
  });

  it('round-trips an intransitive clause, inferring the missing object', () => {
    const intransitive: SimpleClauseIr = {
      subject: { definiteness: 'definite', headMeaning: 'dog', number: 'plural' },
      verb: { lemmaMeaning: 'run', tense: 'past' },
    };
    const language = testLanguage({ wordOrder: 'VSO' });
    expect(parse(render(intransitive, language), language)).toEqual(intransitive);
  });

  it('round-trips a possessed noun phrase under each juxtaposition order', () => {
    const possessed: SimpleClauseIr = {
      subject: {
        definiteness: 'unspecified',
        headMeaning: 'sword',
        number: 'singular',
        possessor: { nounLemma: 'man', number: 'plural', definiteness: 'unspecified' },
      },
      verb: { lemmaMeaning: 'run', tense: 'present' },
    };
    for (const possessionStrategy of [
      { kind: 'juxtapose_possessor_before' },
      { kind: 'juxtapose_possessor_after' },
      { kind: 'marker_on_possessed', affix: 'ka', placement: 'suffix' },
    ] as PossessionStrategy[]) {
      const language = testLanguage({ possessionStrategy, articleSystem: 'none' });
      expect(parse(render(possessed, language), language)).toEqual(possessed);
    }
  });

  it('reads a pronoun subject and its number', () => {
    const language = testLanguage({ articleSystem: 'none' });
    expect(parse('ori kanu', language)).toEqual({
      subject: { definiteness: 'unspecified', headMeaning: 'they', number: 'plural' },
      verb: { lemmaMeaning: 'run', tense: 'present' },
    });
    expect(parse('esa kanu', language)).toEqual({
      subject: { definiteness: 'unspecified', headMeaning: 'she', number: 'singular' },
      verb: { lemmaMeaning: 'run', tense: 'present' },
    });
  });

  describe('rejected input', () => {
    const cases: [label: string, sentence: string, pattern: RegExp][] = [
      ['an empty sentence', '   ', /Empty sentence/],
      ['unknown vocabulary', 'xyzzy teshi doru', /Could not parse/],
      ['a missing verb', 'mika doru', /Could not parse/],
      /* A trailing verb cannot be absorbed as a possessor, so the clause is left with extra tokens. */
      ['trailing tokens', 'zel mika teshi ken doru teshi', /Could not parse/],
    ];

    it.each(cases)('rejects %s', (_label, sentence, pattern) => {
      const result = parse(sentence, testLanguage());
      expect(isErr(result)).toBe(true);
      if (isErr(result)) {
        expect(result.message).toMatch(pattern);
      }
    });

    it('rejects an article stacked on a pronoun', () => {
      const result = parse('zel ori kanu', testLanguage());
      expect(isErr(result)).toBe(true);
    });
  });
});

describe('translateConstructedLanguageSentenceToEnglish', () => {
  it('renders a parsed clause as English', () => {
    const language = testLanguage();
    const result = translateConstructedLanguageSentenceToEnglish(
      render(TRANSITIVE, language),
      language,
    );
    expect(result).toEqual({ ok: true, text: 'The cat sees a dog' });
  });

  it('passes a parse failure through as an error result', () => {
    const result = translateConstructedLanguageSentenceToEnglish('xyzzy', testLanguage());
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.message.length).toBeGreaterThan(0);
    }
  });
});
