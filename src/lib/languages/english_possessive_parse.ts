import { resolveEnglishNounToken } from './english_noun_lemma.js';
import type { Definiteness, NounNumber, SimplePossessorIr } from './language_types.js';

export type EnglishPossessiveNounParse = {
  possessor: SimplePossessorIr;
  headLemma: string;
  headNumber: NounNumber;
  headDefiniteness: Definiteness;
};

/**
 * Parses `owner's head` where `owner` is a lexicon noun (possibly plural surface on `owner`),
 * and `head` is the following token as a noun.
 */
export function tryParseEnglishPossessiveNounPhrase(
  tokens: string[],
  start: number,
  nounMeanings: Set<string>,
  leadingArticleDefiniteness: Definiteness | null,
): { value: EnglishPossessiveNounParse; nextIndex: number } | null {
  if (start >= tokens.length) {
    return null;
  }
  const possessive = splitEnglishPossessiveNounToken(tokens[start]);
  if (!possessive) {
    return null;
  }
  const possessorNoun = resolveEnglishNounToken(possessive.ownerSurface, nounMeanings);
  if (!possessorNoun) {
    return null;
  }
  if (start + 1 >= tokens.length) {
    return null;
  }
  const headNoun = resolveEnglishNounToken(tokens[start + 1], nounMeanings);
  if (!headNoun) {
    return null;
  }
  const possessorDefiniteness = leadingArticleDefiniteness ?? 'unspecified';
  const headDefiniteness: Definiteness =
    leadingArticleDefiniteness !== null ? leadingArticleDefiniteness : 'unspecified';
  return {
    value: {
      possessor: {
        nounLemma: possessorNoun.lemma,
        number: possessorNoun.number,
        definiteness: possessorDefiniteness,
      },
      headLemma: headNoun.lemma,
      headNumber: headNoun.number,
      headDefiniteness,
    },
    nextIndex: start + 2,
  };
}

/** Recognizes `cat's` style possessive on a single token (ASCII apostrophe + s). */
export function splitEnglishPossessiveNounToken(token: string): { ownerSurface: string } | null {
  const lower = token.toLowerCase();
  if (!lower.endsWith("'s")) {
    return null;
  }
  const ownerSurface = token.slice(0, -2);
  if (ownerSurface.length === 0) {
    return null;
  }
  return { ownerSurface };
}
