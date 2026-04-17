import type { VerbIr } from './language_types.js';
import { ENGLISH_VERB_IRREGULAR_PAST_TO_PRESENT } from './english_verb_surface_to_lemma.js';

const IRREGULAR_PAST_TO_PRESENT_LEMMA: Record<string, string> = {
  ...ENGLISH_VERB_IRREGULAR_PAST_TO_PRESENT,
};

/** Resolves a surface English verb token to a lexicon lemma present in `verbMeanings`. */
export function resolveEnglishVerbToken(token: string, verbMeanings: Set<string>): VerbIr | null {
  const t = token.toLowerCase();
  if (verbMeanings.has(t)) {
    return { lemmaMeaning: t, tense: 'present' };
  }
  if (t === 'is' || t === 'am' || t === 'are') {
    if (verbMeanings.has('be')) {
      return { lemmaMeaning: 'be', tense: 'present' };
    }
  }
  if (t === 'has' || t === 'have') {
    if (verbMeanings.has('have')) {
      return { lemmaMeaning: 'have', tense: 'present' };
    }
  }
  if (t === 'does' || t === 'do') {
    if (verbMeanings.has('do')) {
      return { lemmaMeaning: 'do', tense: 'present' };
    }
  }
  const irregularLemma = IRREGULAR_PAST_TO_PRESENT_LEMMA[t];
  if (irregularLemma && verbMeanings.has(irregularLemma)) {
    return { lemmaMeaning: irregularLemma, tense: 'past' };
  }
  const pastFromEd = tryPresentLemmaFromPastForm(t, verbMeanings);
  if (pastFromEd) {
    return { lemmaMeaning: pastFromEd, tense: 'past' };
  }
  if (t.endsWith('ies') && t.length > 4) {
    const yLemma = `${t.slice(0, -3)}y`;
    if (verbMeanings.has(yLemma)) {
      return { lemmaMeaning: yLemma, tense: 'present' };
    }
  }
  if (t.endsWith('es') && t.length > 3) {
    const stem = t.slice(0, -2);
    if (verbMeanings.has(stem)) {
      return { lemmaMeaning: stem, tense: 'present' };
    }
  }
  if (t.endsWith('s') && !t.endsWith('ss') && t.length > 2) {
    const stem = t.slice(0, -1);
    if (verbMeanings.has(stem)) {
      return { lemmaMeaning: stem, tense: 'present' };
    }
  }
  return null;
}

function tryPresentLemmaFromPastForm(token: string, verbMeanings: Set<string>): string | null {
  if (!token.endsWith('ed') || token.length < 4) {
    return null;
  }
  const withoutEd = token.slice(0, -2);
  if (verbMeanings.has(withoutEd)) {
    return withoutEd;
  }
  if (withoutEd.length > 1) {
    const doubled = withoutEd.slice(0, -1);
    if (verbMeanings.has(doubled)) {
      return doubled;
    }
  }
  const iedStem = token.slice(0, -3);
  if (token.endsWith('ied') && verbMeanings.has(`${iedStem}y`)) {
    return `${iedStem}y`;
  }
  return null;
}
