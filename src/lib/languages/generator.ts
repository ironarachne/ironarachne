import type { RNG } from '@ironarachne/rng';
import * as Words from '@ironarachne/words';

import { createLexicon } from './lexicon.js';
import type {
  ArticleSystem,
  ConstructedLanguage,
  LanguageGeneratorConfig,
  Morphology,
  Morpheme,
  Phoneme,
  PhonemeSet,
  PossessionStrategy,
  SyllableProfile,
  Word,
  WordOrder,
} from './language_types.js';
import {
  createEmptyMorpheme,
  getMorphemePronunciation,
  getMorphemeTranscription,
} from './morpheme.js';
import { getConsonants, getVowels } from './phonemes.js';
import { listPhonemesInSet } from './phonemeset.js';

const WORD_ORDER_WEIGHTS: { commonality: number; value: WordOrder }[] = [
  { commonality: 41, value: 'SVO' },
  { commonality: 14, value: 'SOV' },
  { commonality: 9, value: 'VSO' },
  { commonality: 2, value: 'VOS' },
  { commonality: 3, value: 'OVS' },
  { commonality: 1, value: 'OSV' },
];

const SYLLABLE_PROFILE_CHOICES: { commonality: number; value: SyllableProfile }[] = [
  { commonality: 35, value: { label: 'CV', segments: ['C', 'V'] } },
  { commonality: 25, value: { label: 'CVC', segments: ['C', 'V', 'C'] } },
  { commonality: 15, value: { label: 'VC', segments: ['V', 'C'] } },
  { commonality: 10, value: { label: 'V', segments: ['V'] } },
  {
    commonality: 15,
    value: { label: '(C)V', segments: ['C', 'V'] },
  },
];

const ORTHOGRAPHY_SUMMARIES = [
  'Favors simple letter-to-sound matches where possible.',
  'Allows common digraphs (sh, th, ch) for fricatives and affricates.',
  'Varies vowel spelling using several grapheme options per phoneme.',
  'Uses mostly one grapheme per segment, reserving digraphs for rarer sounds.',
] as const;

export function generateConstructedLanguage(config: LanguageGeneratorConfig): ConstructedLanguage {
  const { rng } = config;
  const phonemeSet = rng.item(config.phonemeSets);
  const profile = pickSyllableProfile(rng);
  const wordOrder = rng.weighted(WORD_ORDER_WEIGHTS);
  const lexicon = createLexicon();

  for (const word of lexicon.words) {
    fillWordForms(word, phonemeSet, profile, rng);
  }

  const nameSyllables = rng.int(2, 3);
  const nameMorpheme = generatePolysyllabicMorpheme(rng, phonemeSet, profile, nameSyllables);
  const name = Words.capitalize(getMorphemeTranscription(nameMorpheme, rng));
  const articleSystem = generateArticleSystem(rng);
  const possessionStrategy = generatePossessionStrategy(rng, phonemeSet, profile);

  return {
    name,
    phonemeSetName: phonemeSet.name,
    wordOrder,
    syllableProfile: profile.label,
    syllablePattern: [...profile.segments],
    morphology: generateMorphology(rng, phonemeSet, profile),
    orthographySummary: rng.item([...ORTHOGRAPHY_SUMMARIES]),
    lexicon,
    articleSystem,
    possessionStrategy,
  };
}

function generateArticleSystem(rng: RNG): ArticleSystem {
  return rng.weighted([
    { commonality: 22, value: 'definite_and_indefinite' as ArticleSystem },
    { commonality: 8, value: 'definite_only' as ArticleSystem },
    { commonality: 8, value: 'none' as ArticleSystem },
  ]);
}

function generatePossessionStrategy(
  rng: RNG,
  phonemeSet: PhonemeSet,
  profile: SyllableProfile,
): PossessionStrategy {
  const kind = rng.weighted([
    { commonality: 4, value: 'none' as const },
    { commonality: 6, value: 'juxtapose_possessor_before' as const },
    { commonality: 3, value: 'juxtapose_possessor_after' as const },
    { commonality: 5, value: 'marker_on_possessed' as const },
  ]);
  if (kind === 'none') {
    return { kind: 'none' };
  }
  if (kind === 'juxtapose_possessor_before') {
    return { kind: 'juxtapose_possessor_before' };
  }
  if (kind === 'juxtapose_possessor_after') {
    return { kind: 'juxtapose_possessor_after' };
  }
  const affixMorpheme = generatePolysyllabicMorpheme(rng, phonemeSet, profile, 1);
  const affix = getMorphemeTranscription(affixMorpheme, rng);
  const placement = rng.item(['prefix', 'suffix'] as const);
  return { kind: 'marker_on_possessed', affix, placement };
}

export function applyMorphologicalAffix(
  root: string,
  affix: string,
  placement: 'prefix' | 'suffix',
): string {
  if (placement === 'prefix') {
    return affix + root;
  }
  return root + affix;
}

function pickSyllableProfile(rng: RNG): SyllableProfile {
  let profile = rng.weighted(
    SYLLABLE_PROFILE_CHOICES.map((entry) => ({
      commonality: entry.commonality,
      value: entry.value,
    })),
  );
  if (profile.label === '(C)V') {
    profile =
      rng.int(0, 1) === 0 ? { label: 'CV', segments: ['C', 'V'] } : { label: 'V', segments: ['V'] };
  }
  return profile;
}

function generateMorphology(
  rng: RNG,
  phonemeSet: PhonemeSet,
  profile: SyllableProfile,
): Morphology {
  const pluralMorpheme = generatePolysyllabicMorpheme(rng, phonemeSet, profile, 1);
  const pastMorpheme = generatePolysyllabicMorpheme(rng, phonemeSet, profile, 1);
  return {
    pluralAffix: getMorphemeTranscription(pluralMorpheme, rng),
    pastAffix: getMorphemeTranscription(pastMorpheme, rng),
    pluralPlacement: rng.item(['prefix', 'suffix'] as const),
    pastPlacement: rng.item(['prefix', 'suffix'] as const),
  };
}

function fillWordForms(
  word: Word,
  phonemeSet: PhonemeSet,
  profile: SyllableProfile,
  rng: RNG,
): void {
  const syllableCount = syllableCountForSpeechPart(word.speechPart, rng);
  const morpheme = generatePolysyllabicMorpheme(rng, phonemeSet, profile, syllableCount);
  word.root = getMorphemeTranscription(morpheme, rng);
  word.pronunciation = getMorphemePronunciation(morpheme);
}

function syllableCountForSpeechPart(speechPart: string, rng: RNG): number {
  if (speechPart === 'article' || speechPart === 'pronoun') {
    return rng.int(1, 2);
  }
  return rng.int(1, 4);
}

function generatePolysyllabicMorpheme(
  rng: RNG,
  phonemeSet: PhonemeSet,
  profile: SyllableProfile,
  syllableCount: number,
): Morpheme {
  const consonants = getConsonants(listPhonemesInSet(phonemeSet));
  const vowels = getVowels(listPhonemesInSet(phonemeSet));
  const phonemes: Phoneme[] = [];

  for (let s = 0; s < syllableCount; s++) {
    const syllable = buildSyllable(rng, profile, consonants, vowels);
    if (phonemes.length > 0) {
      const last = phonemes[phonemes.length - 1];
      const first = syllable[0];
      if (isVowelPhoneme(last) && isVowelPhoneme(first)) {
        phonemes.push(pickWeightedPhoneme(rng, consonants));
      }
    }
    phonemes.push(...syllable);
  }

  return phonemes.length === 0 ? createEmptyMorpheme() : { phonemes };
}

function buildSyllable(
  rng: RNG,
  profile: SyllableProfile,
  consonants: Phoneme[],
  vowels: Phoneme[],
): Phoneme[] {
  const syllable: Phoneme[] = [];
  for (const segment of profile.segments) {
    syllable.push(
      segment === 'C' ? pickWeightedPhoneme(rng, consonants) : pickWeightedPhoneme(rng, vowels),
    );
  }
  return syllable;
}

function isVowelPhoneme(phoneme: Phoneme): boolean {
  return phoneme.classifiers.includes('vowel');
}

function pickWeightedPhoneme(rng: RNG, list: Phoneme[]): Phoneme {
  if (list.length === 0) {
    throw new Error('No phonemes available for weighted pick.');
  }
  return rng.weighted(list.map((p) => ({ commonality: Math.max(1, p.commonality), value: p })));
}
