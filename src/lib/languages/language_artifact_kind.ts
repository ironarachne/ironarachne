import scroll from '$lib/assets/icons/set2/scroll.svg?raw';
import {
  acceptedPayload,
  asRecord,
  defineArtifactKind,
  rejectedPayload,
  type PayloadResult,
} from '$lib/artifact_kinds';

import type { ConstructedLanguage, SyllableSegment, Word } from './language_types';
import type { LanguageSnapshot } from './language_snapshot';

/**
 * Stable artifact kind id.
 *
 * Unqualified: a constructed language is neither a game system's nor a setting's. Genre-neutral
 * too, so every project sees it — one of the few tools on the site that is.
 *
 * **This is the kind [#28](https://github.com/ironarachne/ironarachne/issues/28) declined to
 * mint, and it is worth saying why minting it now is not a reversal.** #28 asked whether the
 * artifact should be a `NameGeneratorSet` — the six naming patterns a culture consumes — or a
 * language, and warned that "naming the kind after the larger thing and storing only the smaller
 * one is expensive to undo once artifacts exist in users' browsers". It closed on *neither*,
 * because the generator behind the name was unfinished and nothing consumed it.
 *
 * What this kind stores is the larger thing, whole: phonology, morphology, typology and the entire
 * lexicon. So the mismatch #28 warned about is the one thing that cannot arise here. What #28 left
 * open stays open — culture still owns its `NameGeneratorSet` outright, there is no
 * `payloadVersion` step for culture, and whether a *name-generator set* deserves a kind of its own
 * is still the smaller and more honest question to ask if settlement, region, family and character
 * ever justify it.
 */
export const LANGUAGE_ARTIFACT_KIND = 'language' as const;

/** Version 1. The first shape a language has been stored in. */
export const LANGUAGE_PAYLOAD_VERSION = 1 as const;

const WORD_ORDERS = ['SVO', 'SOV', 'VSO', 'VOS', 'OVS', 'OSV'];

const ARTICLE_SYSTEMS = ['none', 'definite_and_indefinite', 'definite_only'];

const POSSESSION_KINDS = [
  'none',
  'juxtapose_possessor_before',
  'juxtapose_possessor_after',
  'marker_on_possessed',
];

const AFFIX_PLACEMENTS = ['prefix', 'suffix'];

function readText(value: unknown, fallback = ''): string {
  return typeof value === 'string' ? value : fallback;
}

function readChoice(value: unknown, allowed: string[], fallback: string): string {
  return typeof value === 'string' && allowed.includes(value) ? value : fallback;
}

/**
 * One word of the lexicon, normalised.
 *
 * A word with no meaning is dropped: the meaning is the English side of the glossary and what the
 * translation index keys on, so a word without one cannot be looked up and would print as a form
 * glossing nothing. Everything else degrades, because a glossary line missing a pronunciation is
 * still a glossary line.
 */
function readWord(value: unknown): Word | undefined {
  const record = asRecord(value);
  if (record === null || typeof record.meaning !== 'string' || record.meaning === '') {
    return undefined;
  }
  return {
    root: readText(record.root),
    pronunciation: readText(record.pronunciation),
    speechPart: readText(record.speechPart),
    meaning: record.meaning,
  };
}

/**
 * The lexicon, which is the bulk of the payload and the half a user edits.
 *
 * A lexicon that is not a list at all becomes an empty one rather than a refusal. That is
 * requirement 3.3: a language whose words a user has deleted down to nothing is still a language —
 * it has a phonology, a word order and a morphology — and refusing to open it would strip them of
 * all three to punish them for the fourth.
 */
function readLexicon(value: unknown): { words: Word[] } {
  const record = asRecord(value);
  if (record === null || !Array.isArray(record.words)) {
    return { words: [] };
  }
  return {
    words: record.words.map(readWord).filter((word): word is Word => word !== undefined),
  };
}

/** The four affixes and placements a language inflects with. */
function readMorphology(value: unknown): LanguageSnapshot['morphology'] {
  const record = asRecord(value) ?? {};
  return {
    pluralAffix: readText(record.pluralAffix),
    pastAffix: readText(record.pastAffix),
    pluralPlacement: readChoice(record.pluralPlacement, AFFIX_PLACEMENTS, 'suffix') as
      | 'prefix'
      | 'suffix',
    pastPlacement: readChoice(record.pastPlacement, AFFIX_PLACEMENTS, 'suffix') as
      | 'prefix'
      | 'suffix',
  };
}

/**
 * How the language marks possession — a discriminated union, and the one field where an
 * unrecognised value cannot simply be kept.
 *
 * A `marker_on_possessed` needs an affix and a placement for the translator to use, so a payload
 * claiming that kind without them is read as the variant it actually is: `none`. Falling back to
 * `none` rather than refusing keeps 3.3 — a language that has lost its possession rule still has
 * every other rule.
 */
function readPossessionStrategy(value: unknown): LanguageSnapshot['possessionStrategy'] {
  const record = asRecord(value);
  if (record === null) {
    return { kind: 'none' };
  }
  const kind = readChoice(record.kind, POSSESSION_KINDS, 'none');
  if (kind !== 'marker_on_possessed') {
    return { kind } as LanguageSnapshot['possessionStrategy'];
  }
  if (typeof record.affix !== 'string') {
    return { kind: 'none' };
  }
  return {
    kind: 'marker_on_possessed',
    affix: record.affix,
    placement: readChoice(record.placement, AFFIX_PLACEMENTS, 'suffix') as 'prefix' | 'suffix',
  };
}

/** The syllable template, as the list of consonant and vowel slots a word is built from. */
function readSyllablePattern(value: unknown): SyllableSegment[] {
  if (!Array.isArray(value)) {
    return [];
  }
  return value.filter((entry): entry is SyllableSegment => entry === 'C' || entry === 'V');
}

/**
 * Reads a stored language, normalising rather than refusing wherever it honestly can.
 *
 * The one hard requirement is a name, because that is what a vault listing shows and what every
 * heading in the exports is written under. Everything below it degrades to a well-defined default,
 * which is what 3.3 asks for — and it matters more here than for most kinds, because this payload
 * is the biggest on the site and a refusal would strip a user of the most work.
 */
export function validateLanguageSnapshot(payload: unknown): PayloadResult<LanguageSnapshot> {
  const record = asRecord(payload);
  if (record === null) {
    return rejectedPayload('invalid-payload', 'Language payload is not an object');
  }
  if (typeof record.name !== 'string' || record.name.trim() === '') {
    return rejectedPayload('invalid-payload', 'Language payload has no name');
  }

  return acceptedPayload({
    name: record.name,
    phonemeSetName: readText(record.phonemeSetName),
    wordOrder: readChoice(record.wordOrder, WORD_ORDERS, 'SVO') as LanguageSnapshot['wordOrder'],
    syllableProfile: readText(record.syllableProfile),
    syllablePattern: readSyllablePattern(record.syllablePattern),
    morphology: readMorphology(record.morphology),
    orthographySummary: readText(record.orthographySummary),
    lexicon: readLexicon(record.lexicon),
    articleSystem: readChoice(
      record.articleSystem,
      ARTICLE_SYSTEMS,
      'none',
    ) as LanguageSnapshot['articleSystem'],
    possessionStrategy: readPossessionStrategy(record.possessionStrategy),
  });
}

/**
 * There has only ever been version 1, so this rejects rather than pretending otherwise.
 *
 * It is here because the contract requires it, and it is where the first real step goes the day the
 * shape changes. A kind without one looks complete right up until it silently drops someone's work
 * — and local-only means there is no server-side migration to fall back on.
 */
export function migrateLanguageSnapshot(
  _payload: unknown,
  from: number,
): PayloadResult<LanguageSnapshot> {
  return rejectedPayload(
    'unsupported-version',
    `Languages have no migration from payload version ${from}; version ${LANGUAGE_PAYLOAD_VERSION} is the only shape there has been`,
  );
}

/** What to call a saved language: its name, which the generator always gives it. */
export function languageName(snapshot: LanguageSnapshot): string {
  const given = snapshot.name.trim();
  return given === '' ? 'Language' : given;
}

/**
 * A constructed language as an artifact.
 *
 * The codec is cheap on both sides — the snapshot is the language, and reading one back copies it —
 * so unlike settlement or heraldry there is no expensive half to keep out of the chunk that merely
 * lists a project. It is still loaded on demand, because the contract is the same for every kind
 * and a codec that happens to be cheap today is not a reason to wire it differently from its
 * neighbours.
 */
export const languageArtifactKind = defineArtifactKind<ConstructedLanguage, LanguageSnapshot>({
  kind: LANGUAGE_ARTIFACT_KIND,
  displayName: 'Language',
  icon: scroll,
  payloadVersion: LANGUAGE_PAYLOAD_VERSION,
  loadCodec: async () => {
    const { languageFromSnapshotWithRng, toLanguageSnapshot } =
      await import('./language_snapshot.js');
    return {
      toSnapshot: toLanguageSnapshot,
      fromSnapshot: languageFromSnapshotWithRng,
    };
  },
  nameOf: languageName,
  validate: validateLanguageSnapshot,
  migrate: migrateLanguageSnapshot,
});
