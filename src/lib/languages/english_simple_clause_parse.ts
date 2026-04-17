import type { LexiconTranslationIndex } from './lexicon_translation_index.js';
import { tryParseEnglishPossessiveNounPhrase } from './english_possessive_parse.js';
import { resolveEnglishNounToken } from './english_noun_lemma.js';
import { resolveEnglishVerbToken } from './english_verb_lemma.js';
import type {
  Definiteness,
  NounPhraseIr,
  SimpleClauseIr,
  SimpleTranslationErr,
  VerbIr,
} from './language_types.js';
import { tokenizeSimpleSentence } from './simple_sentence_tokenize.js';

export function parseEnglishSimpleClause(
  sentence: string,
  index: LexiconTranslationIndex,
): SimpleClauseIr | SimpleTranslationErr {
  const tokens = tokenizeSimpleSentence(sentence);
  if (tokens.length === 0) {
    return { ok: false, message: 'Empty sentence.' };
  }

  const nounMeanings = meaningSetFromWords(index.nounWords);
  const verbMeanings = meaningSetFromWords(index.verbWords);

  const subjectParse = parseEnglishNounPhrase(tokens, 0, index, nounMeanings);
  if (!subjectParse) {
    return { ok: false, message: 'Could not parse subject noun phrase.' };
  }

  const verbParse = parseEnglishVerb(tokens, subjectParse.nextIndex, verbMeanings);
  if (!verbParse) {
    return { ok: false, message: 'Could not parse verb.' };
  }

  if (verbParse.nextIndex >= tokens.length) {
    return {
      subject: subjectParse.np,
      verb: verbParse.verb,
    };
  }

  const objectParse = parseEnglishNounPhrase(tokens, verbParse.nextIndex, index, nounMeanings);
  if (!objectParse) {
    return { ok: false, message: 'Could not parse object noun phrase.' };
  }
  if (objectParse.nextIndex !== tokens.length) {
    return { ok: false, message: 'Extra tokens after object.' };
  }

  return {
    subject: subjectParse.np,
    verb: verbParse.verb,
    object: objectParse.np,
  };
}

function meaningSetFromWords(words: { meaning: string }[]): Set<string> {
  return new Set(words.map((w) => w.meaning.toLowerCase()));
}

type NpParse = { np: NounPhraseIr; nextIndex: number };

function parseEnglishNounPhrase(
  tokens: string[],
  start: number,
  index: LexiconTranslationIndex,
  nounMeanings: Set<string>,
): NpParse | null {
  if (start >= tokens.length) {
    return null;
  }
  let i = start;
  let leadArticleDefiniteness: Definiteness | null = null;
  const first = tokens[i].toLowerCase();
  if (first === 'a' || first === 'an') {
    leadArticleDefiniteness = 'indefinite';
    i += 1;
  } else if (first === 'the') {
    leadArticleDefiniteness = 'definite';
    i += 1;
  }
  if (i >= tokens.length) {
    return null;
  }

  const pronounMeaning = findPronounCanonicalMeaning(tokens[i], index);
  if (pronounMeaning) {
    if (leadArticleDefiniteness !== null) {
      return null;
    }
    return {
      np: {
        definiteness: 'unspecified',
        headMeaning: pronounMeaning,
        number: pronounNumber(pronounMeaning.toLowerCase()),
      },
      nextIndex: i + 1,
    };
  }

  const possessive = tryParseEnglishPossessiveNounPhrase(
    tokens,
    i,
    nounMeanings,
    leadArticleDefiniteness,
  );
  if (possessive) {
    return {
      np: {
        definiteness: possessive.value.headDefiniteness,
        headMeaning: possessive.value.headLemma,
        number: possessive.value.headNumber,
        possessor: possessive.value.possessor,
      },
      nextIndex: possessive.nextIndex,
    };
  }

  if (leadArticleDefiniteness !== null) {
    const noun = resolveEnglishNounToken(tokens[i], nounMeanings);
    if (!noun) {
      return null;
    }
    return {
      np: {
        definiteness: leadArticleDefiniteness,
        headMeaning: noun.lemma,
        number: noun.number,
      },
      nextIndex: i + 1,
    };
  }

  const nounOnly = resolveEnglishNounToken(tokens[i], nounMeanings);
  if (!nounOnly) {
    return null;
  }
  return {
    np: {
      definiteness: 'unspecified',
      headMeaning: nounOnly.lemma,
      number: nounOnly.number,
    },
    nextIndex: i + 1,
  };
}

function findPronounCanonicalMeaning(token: string, index: LexiconTranslationIndex): string | null {
  const t = token.toLowerCase();
  for (const w of index.pronounWords) {
    if (w.meaning.toLowerCase() === t) {
      return w.meaning;
    }
  }
  return null;
}

function pronounNumber(meaningLower: string): 'singular' | 'plural' {
  if (meaningLower === 'they' || meaningLower === 'we') {
    return 'plural';
  }
  return 'singular';
}

type VerbParse = { verb: VerbIr; nextIndex: number };

function parseEnglishVerb(
  tokens: string[],
  start: number,
  verbMeanings: Set<string>,
): VerbParse | null {
  if (start >= tokens.length) {
    return null;
  }
  const resolved = resolveEnglishVerbToken(tokens[start], verbMeanings);
  if (!resolved) {
    return null;
  }
  return { verb: resolved, nextIndex: start + 1 };
}
