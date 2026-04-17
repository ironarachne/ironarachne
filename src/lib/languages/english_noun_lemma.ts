import type { NounNumber } from './language_types.js';

export type EnglishNounParse = {
  lemma: string;
  number: NounNumber;
};

/** Parses a surface English noun token using an allowed lemma set from the lexicon. */
export function resolveEnglishNounToken(
  token: string,
  nounMeanings: Set<string>,
): EnglishNounParse | null {
  const t = token.toLowerCase();
  if (nounMeanings.has(t)) {
    return { lemma: t, number: 'singular' };
  }
  if (t.endsWith('ies') && t.length > 4) {
    const yLemma = `${t.slice(0, -3)}y`;
    if (nounMeanings.has(yLemma)) {
      return { lemma: yLemma, number: 'plural' };
    }
  }
  if (t.endsWith('es') && t.length > 3) {
    const stem = t.slice(0, -2);
    if (nounMeanings.has(stem)) {
      return { lemma: stem, number: 'plural' };
    }
  }
  if (t.endsWith('s') && !t.endsWith('ss') && t.length > 2) {
    const stem = t.slice(0, -1);
    if (nounMeanings.has(stem)) {
      return { lemma: stem, number: 'plural' };
    }
  }
  return null;
}
