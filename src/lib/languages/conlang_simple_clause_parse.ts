import { applyMorphologicalAffix } from './generator.js';
import type { LexiconTranslationIndex } from './lexicon_translation_index.js';
import {
  conlangExpectsArticleToken,
  possessionStrategyOmitsPossessorInConlang,
} from './language_typology.js';
import type {
  ConstructedLanguage,
  Definiteness,
  Morphology,
  NounPhraseIr,
  PossessionStrategy,
  SimpleClauseIr,
  SimplePossessorIr,
  SimpleTranslationErr,
  VerbIr,
} from './language_types.js';
import { getClauseConstituentOrderForWordOrder } from './word_order_constituents.js';
import { tokenizeSimpleSentence } from './simple_sentence_tokenize.js';

export function parseConlangSimpleClauseToIr(
  sentence: string,
  language: ConstructedLanguage,
  index: LexiconTranslationIndex,
): SimpleClauseIr | SimpleTranslationErr {
  const tokens = tokenizeSimpleSentence(sentence);
  if (tokens.length === 0) {
    return { ok: false, message: 'Empty sentence.' };
  }

  const transitive = tryParseConlangClauseWithObjectFlag(language, index, tokens, true);
  if (!isSimpleTranslationErr(transitive)) {
    return transitive;
  }
  const intransitive = tryParseConlangClauseWithObjectFlag(language, index, tokens, false);
  if (!isSimpleTranslationErr(intransitive)) {
    return intransitive;
  }
  return {
    ok: false,
    message: `Could not parse clause (tried with and without object). ${transitive.message}`,
  };
}

function isSimpleTranslationErr(
  value: SimpleClauseIr | SimpleTranslationErr,
): value is SimpleTranslationErr {
  return (value as SimpleTranslationErr).ok === false;
}

function tryParseConlangClauseWithObjectFlag(
  language: ConstructedLanguage,
  index: LexiconTranslationIndex,
  tokens: string[],
  hasObject: boolean,
): SimpleClauseIr | SimpleTranslationErr {
  const order = getClauseConstituentOrderForWordOrder(language.wordOrder);
  let pos = 0;
  let subject: NounPhraseIr | undefined;
  let object: NounPhraseIr | undefined;
  let verb: VerbIr | undefined;

  for (const slot of order) {
    if (slot === 'object' && !hasObject) {
      continue;
    }
    if (pos >= tokens.length) {
      return { ok: false, message: 'Unexpected end of sentence for this word order.' };
    }
    if (slot === 'subject') {
      const parsed = consumeConlangNounPhrase(tokens, pos, language, index);
      if (!parsed) {
        return { ok: false, message: 'Could not parse subject noun phrase in conlang.' };
      }
      subject = parsed.np;
      pos = parsed.nextIndex;
      continue;
    }
    if (slot === 'object') {
      const parsed = consumeConlangNounPhrase(tokens, pos, language, index);
      if (!parsed) {
        return { ok: false, message: 'Could not parse object noun phrase in conlang.' };
      }
      object = parsed.np;
      pos = parsed.nextIndex;
      continue;
    }
    const parsedVerb = consumeConlangVerb(tokens, pos, language.morphology, index);
    if (!parsedVerb) {
      return { ok: false, message: 'Could not parse verb in conlang.' };
    }
    verb = parsedVerb.verb;
    pos = parsedVerb.nextIndex;
  }

  if (pos !== tokens.length) {
    return { ok: false, message: 'Extra tokens after parsing clause.' };
  }
  if (!subject || !verb) {
    return { ok: false, message: 'Incomplete clause.' };
  }
  if (hasObject && !object) {
    return { ok: false, message: 'Missing object.' };
  }
  if (!hasObject && object) {
    return { ok: false, message: 'Unexpected object.' };
  }

  if (hasObject && object) {
    return { subject, verb, object };
  }
  return { subject, verb };
}

type NpConsumed = { np: NounPhraseIr; nextIndex: number };

function consumeConlangNounPhrase(
  tokens: string[],
  start: number,
  language: ConstructedLanguage,
  index: LexiconTranslationIndex,
): NpConsumed | null {
  const morphology = language.morphology;
  const strategy = language.possessionStrategy;
  let pos = start;

  let headDefiniteness: Definiteness = 'unspecified';
  if (conlangExpectsArticleToken(language.articleSystem)) {
    const articleWord = index.articleWords.find((w) => w.root === tokens[pos]);
    if (articleWord) {
      headDefiniteness = articleWord.meaning.toLowerCase() === 'the' ? 'definite' : 'indefinite';
      pos += 1;
    }
  }

  if (pos >= tokens.length) {
    return null;
  }

  const pronoun = index.pronounWords.find((w) => w.root === tokens[pos]);
  if (pronoun) {
    if (headDefiniteness !== 'unspecified') {
      return null;
    }
    return {
      np: {
        definiteness: 'unspecified',
        headMeaning: pronoun.meaning,
        number: pronounPluralNumber(pronoun.meaning),
      },
      nextIndex: pos + 1,
    };
  }

  const possessive = tryConsumePossessiveTwoNounPhrase(
    tokens,
    pos,
    language,
    index,
    headDefiniteness,
  );
  if (possessive) {
    return possessive;
  }

  const singleMarked = matchNounSurfaceTokenAllowingMarker(
    tokens[pos],
    morphology,
    strategy,
    index,
  );
  if (singleMarked) {
    return {
      np: {
        definiteness: headDefiniteness,
        headMeaning: singleMarked.lemma,
        number: singleMarked.number,
      },
      nextIndex: pos + 1,
    };
  }

  return null;
}

function tryConsumePossessiveTwoNounPhrase(
  tokens: string[],
  pos: number,
  language: ConstructedLanguage,
  index: LexiconTranslationIndex,
  headDefiniteness: Definiteness,
): NpConsumed | null {
  const morphology = language.morphology;
  const strategy = language.possessionStrategy;
  if (possessionStrategyOmitsPossessorInConlang(strategy)) {
    return null;
  }
  if (pos + 1 >= tokens.length) {
    return null;
  }

  if (strategy.kind === 'juxtapose_possessor_after') {
    const headMatch = matchNounSurfaceTokenAllowingMarker(tokens[pos], morphology, strategy, index);
    const possessorMatch = matchNounSurfaceToken(tokens[pos + 1], morphology, index);
    if (!headMatch || !possessorMatch) {
      return null;
    }
    return {
      np: nounPhraseFromPossessorParts(headDefiniteness, headMatch, possessorMatch),
      nextIndex: pos + 2,
    };
  }

  const possessorMatch = matchNounSurfaceToken(tokens[pos], morphology, index);
  if (!possessorMatch) {
    return null;
  }
  const headMatch = matchNounSurfaceTokenAllowingMarker(
    tokens[pos + 1],
    morphology,
    strategy,
    index,
  );
  if (!headMatch) {
    return null;
  }
  return {
    np: nounPhraseFromPossessorParts(headDefiniteness, headMatch, possessorMatch),
    nextIndex: pos + 2,
  };
}

type NounMatch = { lemma: string; number: 'singular' | 'plural' };

function nounPhraseFromPossessorParts(
  headDefiniteness: Definiteness,
  head: NounMatch,
  possessor: NounMatch,
): NounPhraseIr {
  const possessorIr: SimplePossessorIr = {
    nounLemma: possessor.lemma,
    number: possessor.number,
    definiteness: 'unspecified',
  };
  return {
    definiteness: headDefiniteness,
    headMeaning: head.lemma,
    number: head.number,
    possessor: possessorIr,
  };
}

function pronounPluralNumber(meaning: string): 'singular' | 'plural' {
  const lower = meaning.toLowerCase();
  if (lower === 'they' || lower === 'we') {
    return 'plural';
  }
  return 'singular';
}

function matchNounSurfaceToken(
  token: string,
  morphology: Morphology,
  index: LexiconTranslationIndex,
): NounMatch | null {
  for (const noun of index.nounWords) {
    if (noun.root === token) {
      return { lemma: noun.meaning, number: 'singular' };
    }
    const plural = applyMorphologicalAffix(
      noun.root,
      morphology.pluralAffix,
      morphology.pluralPlacement,
    );
    if (plural === token) {
      return { lemma: noun.meaning, number: 'plural' };
    }
  }
  return null;
}

function matchNounSurfaceTokenAllowingMarker(
  token: string,
  morphology: Morphology,
  strategy: PossessionStrategy,
  index: LexiconTranslationIndex,
): NounMatch | null {
  const plain = matchNounSurfaceToken(token, morphology, index);
  if (plain) {
    return plain;
  }
  if (strategy.kind !== 'marker_on_possessed') {
    return null;
  }
  for (const noun of index.nounWords) {
    for (const number of ['singular', 'plural'] as const) {
      let surface = noun.root;
      if (number === 'plural') {
        surface = applyMorphologicalAffix(
          surface,
          morphology.pluralAffix,
          morphology.pluralPlacement,
        );
      }
      const marked = applyMorphologicalAffix(surface, strategy.affix, strategy.placement);
      if (marked === token) {
        return { lemma: noun.meaning, number };
      }
    }
  }
  return null;
}

type VerbConsumed = { verb: VerbIr; nextIndex: number };

function consumeConlangVerb(
  tokens: string[],
  start: number,
  morphology: Morphology,
  index: LexiconTranslationIndex,
): VerbConsumed | null {
  if (start >= tokens.length) {
    return null;
  }
  const token = tokens[start];
  for (const v of index.verbWords) {
    if (v.root === token) {
      return { verb: { lemmaMeaning: v.meaning, tense: 'present' }, nextIndex: start + 1 };
    }
    const past = applyMorphologicalAffix(v.root, morphology.pastAffix, morphology.pastPlacement);
    if (past === token) {
      return { verb: { lemmaMeaning: v.meaning, tense: 'past' }, nextIndex: start + 1 };
    }
  }
  return null;
}
