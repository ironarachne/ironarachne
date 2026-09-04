/**
 * Writing a constructed language snapshot, and reading one back.
 *
 * **The conversion is very nearly the identity function, and that is worth stating rather than
 * leaving a reader to wonder what was missed.** `src/lib/languages` is the largest library behind
 * any single tool — twenty-nine modules of phonology, morphology, lexicon, typology and two-way
 * translation — but a `ConstructedLanguage` is not proportional to that. It is ten fields of plain
 * data: strings, a string union, a four-field `Morphology`, a discriminated `PossessionStrategy`,
 * and a `Lexicon` that is a list of four-field `Word`s. The `Map`s and `Set`s this library uses
 * live in the translation machinery, which builds them from a language rather than storing them in
 * one. A search here for a function-typed field on a language returns nothing, so there is no
 * closure to strip and nothing to resolve by name on the way back.
 *
 * **The lexicon is stored whole.** #74 asks whether to store it or regenerate it from the seed, and
 * the answer is store. A user who renames one word has edited the language, and requirement 4.2
 * says a seed may not overrule that. Regeneration is a re-roll, and a re-roll is the destructive
 * command — which is exactly the distinction `language_roll.ts` implements.
 *
 * The size is measured rather than feared: a generated language is 1,760 words and about 144 KB of
 * JSON. That is the largest payload any tool here stores, and it is still two orders of magnitude
 * below the point at which `$lib/storage_status` says anything — it warns at 80% of what
 * `navigator.storage.estimate()` reports, and a user would need thousands of languages to reach it.
 */

import type { RNG } from '@ironarachne/rng';

import type { ConstructedLanguage, Lexicon, Word } from './language_types.js';

/**
 * A constructed language as it is stored.
 *
 * An alias rather than a mapped type, because there is nothing to map: the stored shape and the
 * live shape are the same shape. Named all the same, so the kind, the validator and the editor
 * speak in snapshots like every other kind, and so the day the two shapes diverge there is a name
 * to diverge.
 */
export type LanguageSnapshot = ConstructedLanguage;

/** One word, copied, so an editor cannot write through into a language the page is rendering. */
function copyWord(word: Word): Word {
  return { ...word };
}

/** The lexicon, copied one level deeper than the rest: it is the half an editor rewrites. */
function copyLexicon(lexicon: Lexicon): Lexicon {
  return { words: lexicon.words.map(copyWord) };
}

/**
 * A fresh language, deep enough that nothing shared reaches the store.
 *
 * The lexicon's words are copied individually because they are what the editor rewrites; the
 * syllable pattern is copied because it is an array; `morphology` and `possessionStrategy` are
 * copied because they are records the editor replaces wholesale. Nothing below that needs copying,
 * every remaining field being a string.
 */
export function toLanguageSnapshot(language: ConstructedLanguage): LanguageSnapshot {
  return {
    ...language,
    syllablePattern: [...language.syllablePattern],
    morphology: { ...language.morphology },
    possessionStrategy: { ...language.possessionStrategy },
    lexicon: copyLexicon(language.lexicon),
  };
}

/**
 * A stored language back into the live one the library works with.
 *
 * Nothing is recomputed and nothing is re-rolled. In particular the lexicon is not regenerated: the
 * words in a stored language are the words the user kept, and re-running `createLexicon` over them
 * would be the re-roll wearing a read's clothing.
 */
export function languageFromSnapshot(snapshot: LanguageSnapshot): ConstructedLanguage {
  return toLanguageSnapshot(snapshot);
}

/**
 * The codec's reading half, with the signature the registry hands it.
 *
 * The RNG is unused, and that is the correct amount of use for it. It exists for kinds that rebuild
 * name generators; a language is finished when it is stored, and drawing anything from a seed on
 * the way back would be regenerating over the user's edits.
 */
export function languageFromSnapshotWithRng(
  snapshot: LanguageSnapshot,
  _rng: RNG,
): ConstructedLanguage {
  return languageFromSnapshot(snapshot);
}
