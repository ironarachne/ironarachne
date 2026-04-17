import { applyMorphologicalAffix } from './generator.js';
import type { LexiconTranslationIndex } from './lexicon_translation_index.js';
import { lookupWordByMeaning } from './lexicon_translation_index.js';
import {
  possessionStrategyOmitsPossessorInConlang,
  shouldEmitArticleForDefiniteness,
} from './language_typology.js';
import type {
  ConstructedLanguage,
  Definiteness,
  NounPhraseIr,
  PossessionStrategy,
  SimplePossessorIr,
  SimpleClauseIr,
  VerbIr,
} from './language_types.js';
import type { ClauseConstituent } from './word_order_constituents.js';
import { getClauseConstituentOrderForWordOrder } from './word_order_constituents.js';

export function linearizeSimpleClauseIrToConlang(
  language: ConstructedLanguage,
  clause: SimpleClauseIr,
  index: LexiconTranslationIndex,
): string {
  const order = getClauseConstituentOrderForWordOrder(language.wordOrder);
  const parts: string[] = [];
  for (const slot of order) {
    if (slot === 'object' && !clause.object) {
      continue;
    }
    parts.push(...linearizeClauseSlotToConlangTokens(language, clause, slot, index));
  }
  return parts.join(' ');
}

function linearizeClauseSlotToConlangTokens(
  language: ConstructedLanguage,
  clause: SimpleClauseIr,
  slot: ClauseConstituent,
  index: LexiconTranslationIndex,
): string[] {
  if (slot === 'subject') {
    return linearizeNounPhraseToConlangTokens(language, clause.subject, index);
  }
  if (slot === 'object') {
    if (!clause.object) {
      return [];
    }
    return linearizeNounPhraseToConlangTokens(language, clause.object, index);
  }
  return [linearizeVerbToConlangSurface(language, clause.verb, index)];
}

function englishArticleMeaningForDefiniteness(definiteness: Definiteness): 'a' | 'the' | null {
  if (definiteness === 'definite') {
    return 'the';
  }
  if (definiteness === 'indefinite') {
    return 'a';
  }
  return null;
}

function linearizeNounPhraseToConlangTokens(
  language: ConstructedLanguage,
  np: NounPhraseIr,
  index: LexiconTranslationIndex,
): string[] {
  const pronounWord = lookupWordByMeaning(index, 'pronoun', np.headMeaning);
  if (pronounWord) {
    if (np.possessor) {
      throw new Error('Possessor is not supported with pronoun heads in this model.');
    }
    if (np.definiteness !== 'unspecified') {
      throw new Error('Determiner on a pronoun is not supported in this model.');
    }
    return [pronounWord.root];
  }

  const tokens: string[] = [];
  const articleMeaning = englishArticleMeaningForDefiniteness(np.definiteness);
  if (
    articleMeaning !== null &&
    shouldEmitArticleForDefiniteness(language.articleSystem, np.definiteness)
  ) {
    const article = lookupWordByMeaning(index, 'article', articleMeaning);
    if (!article) {
      throw new Error(`Missing article "${articleMeaning}".`);
    }
    tokens.push(article.root);
  }

  const strategy = language.possessionStrategy;
  const omitPossessor = Boolean(
    np.possessor && possessionStrategyOmitsPossessorInConlang(strategy),
  );
  const possessorTokens =
    np.possessor && !omitPossessor ? conlangPossessorRoots(language, np.possessor, index) : [];

  const headSurface = conlangPossessedHeadSurface(language, np, strategy, index);

  if (np.possessor && !omitPossessor && strategy.kind === 'juxtapose_possessor_after') {
    tokens.push(headSurface, ...possessorTokens);
    return tokens;
  }

  if (np.possessor && !omitPossessor) {
    tokens.push(...possessorTokens);
  }
  tokens.push(headSurface);
  return tokens;
}

function conlangPossessorRoots(
  language: ConstructedLanguage,
  possessor: SimplePossessorIr,
  index: LexiconTranslationIndex,
): string[] {
  const possessorNoun = lookupWordByMeaning(index, 'noun', possessor.nounLemma);
  if (!possessorNoun) {
    throw new Error(`Missing possessor noun "${possessor.nounLemma}".`);
  }
  const root =
    possessor.number === 'plural'
      ? applyMorphologicalAffix(
          possessorNoun.root,
          language.morphology.pluralAffix,
          language.morphology.pluralPlacement,
        )
      : possessorNoun.root;
  return [root];
}

function conlangPossessedHeadSurface(
  language: ConstructedLanguage,
  np: NounPhraseIr,
  strategy: PossessionStrategy,
  index: LexiconTranslationIndex,
): string {
  const nounWord = lookupWordByMeaning(index, 'noun', np.headMeaning);
  if (!nounWord) {
    throw new Error(`Missing noun for "${np.headMeaning}".`);
  }
  let surface =
    np.number === 'plural'
      ? applyMorphologicalAffix(
          nounWord.root,
          language.morphology.pluralAffix,
          language.morphology.pluralPlacement,
        )
      : nounWord.root;

  if (np.possessor && strategy.kind === 'marker_on_possessed') {
    surface = applyMorphologicalAffix(surface, strategy.affix, strategy.placement);
  }
  return surface;
}

function linearizeVerbToConlangSurface(
  language: ConstructedLanguage,
  verb: VerbIr,
  index: LexiconTranslationIndex,
): string {
  const w = lookupWordByMeaning(index, 'verb', verb.lemmaMeaning);
  if (!w) {
    throw new Error(`Missing verb lemma "${verb.lemmaMeaning}".`);
  }
  if (verb.tense === 'past') {
    return applyMorphologicalAffix(
      w.root,
      language.morphology.pastAffix,
      language.morphology.pastPlacement,
    );
  }
  return w.root;
}
