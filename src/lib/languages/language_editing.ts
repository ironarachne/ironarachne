/**
 * Editing a stored constructed language, one field at a time.
 *
 * Every function here takes a snapshot and returns a new one, changing nothing in place. That is
 * requirement 4.4 of docs/workshop.md satisfied by construction — renaming the language must not
 * disturb its lexicon, and rewriting one gloss must not touch its neighbours — and it is what lets
 * the editing framework compare what is on screen against what was read to decide whether anything
 * needs saving.
 *
 * **Nothing here recomputes anything.** Changing the syllable template does not rebuild the words
 * that were built from it, and changing the plural affix does not re-inflect the lexicon. That is
 * requirement 4.2 taken seriously rather than a gap: a conlanger who has rewritten a word has made
 * a decision, and a form that regenerated the lexicon whenever a rule changed would throw away
 * every one of those decisions at a keystroke. Rebuilding a language from its rules is the
 * destructive re-roll, and it lives in `language_roll.ts`.
 */

import type { LanguageSnapshot } from './language_snapshot.js';
import type {
  ArticleSystem,
  PossessionStrategy,
  SyllableSegment,
  Word,
  WordOrder,
} from './language_types.js';

/** The identity and description fields a user may rewrite. */
export const LANGUAGE_TEXT_FIELDS = [
  'name',
  'phonemeSetName',
  'syllableProfile',
  'orthographySummary',
] as const;

export type LanguageTextField = (typeof LANGUAGE_TEXT_FIELDS)[number];

/** The six word orders the generator draws from, and what the editor offers. */
export const WORD_ORDER_CHOICES: WordOrder[] = ['SVO', 'SOV', 'VSO', 'VOS', 'OVS', 'OSV'];

/** The three article systems. */
export const ARTICLE_SYSTEM_CHOICES: ArticleSystem[] = [
  'none',
  'definite_and_indefinite',
  'definite_only',
];

/** The four ways a language may mark possession. */
export const POSSESSION_KIND_CHOICES: PossessionStrategy['kind'][] = [
  'none',
  'juxtapose_possessor_before',
  'juxtapose_possessor_after',
  'marker_on_possessed',
];

/** The four morphology fields: two affixes and where each one attaches. */
export const MORPHOLOGY_AFFIX_FIELDS = ['pluralAffix', 'pastAffix'] as const;

export type MorphologyAffixField = (typeof MORPHOLOGY_AFFIX_FIELDS)[number];

export const MORPHOLOGY_PLACEMENT_FIELDS = ['pluralPlacement', 'pastPlacement'] as const;

export type MorphologyPlacementField = (typeof MORPHOLOGY_PLACEMENT_FIELDS)[number];

/** The three fields of one lexicon entry a conlanger rewrites. */
export const WORD_FIELDS = ['root', 'pronunciation', 'meaning'] as const;

export type WordField = (typeof WORD_FIELDS)[number];

export function setLanguageText(
  snapshot: LanguageSnapshot,
  field: LanguageTextField,
  value: string,
): LanguageSnapshot {
  return { ...snapshot, [field]: value };
}

export function setLanguageWordOrder(
  snapshot: LanguageSnapshot,
  wordOrder: WordOrder,
): LanguageSnapshot {
  return { ...snapshot, wordOrder };
}

export function setLanguageArticleSystem(
  snapshot: LanguageSnapshot,
  articleSystem: ArticleSystem,
): LanguageSnapshot {
  return { ...snapshot, articleSystem };
}

/**
 * The syllable template, typed as the `CVC` string a conlanger writes rather than picked slot by
 * slot.
 *
 * Anything that is not a C or a V is dropped rather than rejected: a user part-way through typing
 * `CVC` has typed `CV` and then a keystroke that is not yet a letter, and a field that refused
 * would fight them. The label keeps whatever they typed, so the two do not have to agree — which is
 * the honest arrangement, `syllableProfile` being a name for the pattern rather than a derivation
 * of it.
 */
export function setLanguageSyllablePattern(
  snapshot: LanguageSnapshot,
  value: string,
): LanguageSnapshot {
  const segments = value
    .toUpperCase()
    .split('')
    .filter((character): character is SyllableSegment => character === 'C' || character === 'V');
  return { ...snapshot, syllablePattern: segments };
}

/** The syllable pattern as the string the editor shows and `setLanguageSyllablePattern` parses. */
export function languageSyllablePatternText(snapshot: LanguageSnapshot): string {
  return snapshot.syllablePattern.join('');
}

export function setLanguageMorphologyAffix(
  snapshot: LanguageSnapshot,
  field: MorphologyAffixField,
  value: string,
): LanguageSnapshot {
  return { ...snapshot, morphology: { ...snapshot.morphology, [field]: value } };
}

export function setLanguageMorphologyPlacement(
  snapshot: LanguageSnapshot,
  field: MorphologyPlacementField,
  value: 'prefix' | 'suffix',
): LanguageSnapshot {
  return { ...snapshot, morphology: { ...snapshot.morphology, [field]: value } };
}

/**
 * Change which of the four possession strategies the language uses.
 *
 * Switching *to* `marker_on_possessed` needs an affix and a placement the variant did not carry
 * before, so it starts with the plural affix and a suffix — a plausible marker the user then
 * edits, rather than an empty one the translator would silently emit as nothing. Switching away
 * discards them, which is what the union says: the other three variants have no affix to keep.
 */
export function setLanguagePossessionKind(
  snapshot: LanguageSnapshot,
  kind: PossessionStrategy['kind'],
): LanguageSnapshot {
  if (kind !== 'marker_on_possessed') {
    return { ...snapshot, possessionStrategy: { kind } as PossessionStrategy };
  }
  if (snapshot.possessionStrategy.kind === 'marker_on_possessed') {
    return snapshot;
  }
  return {
    ...snapshot,
    possessionStrategy: {
      kind: 'marker_on_possessed',
      affix: snapshot.morphology.pluralAffix,
      placement: 'suffix',
    },
  };
}

/** The possession marker's own affix and placement, when the language has one. */
export function setLanguagePossessionMarker(
  snapshot: LanguageSnapshot,
  change: { affix?: string; placement?: 'prefix' | 'suffix' },
): LanguageSnapshot {
  if (snapshot.possessionStrategy.kind !== 'marker_on_possessed') {
    return snapshot;
  }
  return {
    ...snapshot,
    possessionStrategy: { ...snapshot.possessionStrategy, ...change },
  };
}

function updateWord(
  snapshot: LanguageSnapshot,
  index: number,
  change: (word: Word) => Word,
): LanguageSnapshot {
  if (index < 0 || index >= snapshot.lexicon.words.length) {
    return snapshot;
  }
  return {
    ...snapshot,
    lexicon: {
      words: snapshot.lexicon.words.map((word, at) => (at === index ? change(word) : word)),
    },
  };
}

/**
 * One field of one word.
 *
 * The index is into the whole lexicon rather than into a filtered view, so a searchable editor has
 * to carry the real index alongside what it shows. That is deliberate: an index into a filtered
 * list changes as the user types in the search box, and a handler holding one would rewrite the
 * wrong word the moment the filter moved.
 */
export function setLexiconWordField(
  snapshot: LanguageSnapshot,
  index: number,
  field: WordField,
  value: string,
): LanguageSnapshot {
  return updateWord(snapshot, index, (word) => ({ ...word, [field]: value }));
}

/** Take one word out of the language. A conlanger pruning a lexicon is editing it. */
export function removeLexiconWord(snapshot: LanguageSnapshot, index: number): LanguageSnapshot {
  if (index < 0 || index >= snapshot.lexicon.words.length) {
    return snapshot;
  }
  return {
    ...snapshot,
    lexicon: { words: snapshot.lexicon.words.filter((_word, at) => at !== index) },
  };
}

/** Add a word of a given part of speech, for the coinage the generator did not think of. */
export function addLexiconWord(snapshot: LanguageSnapshot, speechPart: string): LanguageSnapshot {
  return {
    ...snapshot,
    lexicon: {
      words: [...snapshot.lexicon.words, { root: '', pronunciation: '', speechPart, meaning: '' }],
    },
  };
}

/** One lexicon entry, with the index into the unfiltered lexicon that identifies it. */
export type IndexedWord = { word: Word; index: number };

/**
 * The lexicon narrowed to what a user is looking for, each entry keeping its real index.
 *
 * A lexicon is 1,760 words, so a searchable view is the only editing view that is usable at all —
 * which is why this is not a `SnapshotFieldEditor` case, as the design says. The match is on the
 * gloss and the form both, because a conlanger looks a word up from either side of the glossary,
 * and it is case-insensitive because nobody searching a dictionary is thinking about case.
 */
export function filterLexicon(
  snapshot: LanguageSnapshot,
  query: string,
  speechPart = '',
): IndexedWord[] {
  const needle = query.trim().toLowerCase();
  return snapshot.lexicon.words
    .map((word, index) => ({ word, index }))
    .filter(({ word }) => speechPart === '' || word.speechPart === speechPart)
    .filter(
      ({ word }) =>
        needle === '' ||
        word.meaning.toLowerCase().includes(needle) ||
        word.root.toLowerCase().includes(needle),
    );
}

/** Every part of speech the lexicon actually uses, in the order a glossary prints them. */
export function lexiconSpeechParts(snapshot: LanguageSnapshot): string[] {
  return [...new Set(snapshot.lexicon.words.map((word) => word.speechPart))].sort();
}
