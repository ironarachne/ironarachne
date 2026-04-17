import type { RNG } from '@ironarachne/rng';

export type Phoneme = {
  sound: string;
  transcriptions: string[];
  classifiers: string[];
  commonality: number;
};

export type Word = {
  root: string;
  pronunciation: string;
  speechPart: string;
  meaning: string;
};

export type Morpheme = {
  phonemes: Phoneme[];
};

export type Lexicon = {
  words: Word[];
};

export type PhonemeSet = {
  name: string;
  phonemes: Record<string, Phoneme>;
};

export type LanguageGeneratorConfig = {
  phonemeSets: PhonemeSet[];
  rng: RNG;
};

export type WordOrder = 'SVO' | 'SOV' | 'VSO' | 'VOS' | 'OVS' | 'OSV';

export type SyllableSegment = 'C' | 'V';

export type SyllableProfile = {
  label: string;
  segments: SyllableSegment[];
};

export type Morphology = {
  pluralAffix: string;
  pastAffix: string;
  pluralPlacement: 'prefix' | 'suffix';
  pastPlacement: 'prefix' | 'suffix';
};

export type ArticleSystem = 'none' | 'definite_and_indefinite' | 'definite_only';

export type PossessionStrategy =
  | { kind: 'none' }
  | { kind: 'juxtapose_possessor_before' }
  | { kind: 'juxtapose_possessor_after' }
  | { kind: 'marker_on_possessed'; affix: string; placement: 'prefix' | 'suffix' };

export type ConstructedLanguage = {
  name: string;
  phonemeSetName: string;
  wordOrder: WordOrder;
  syllableProfile: string;
  syllablePattern: SyllableSegment[];
  morphology: Morphology;
  orthographySummary: string;
  lexicon: Lexicon;
  articleSystem: ArticleSystem;
  possessionStrategy: PossessionStrategy;
};

/** Simple SVO-style clause in semantic keys (English lexicon meanings). */
export type NounNumber = 'singular' | 'plural';

export type Definiteness = 'definite' | 'indefinite' | 'unspecified';

export type SimplePossessorIr = {
  nounLemma: string;
  number: NounNumber;
  definiteness: Definiteness;
};

export type NounPhraseIr = {
  /** Determiner strength on the possessed head (and default for whole NP when there is no possessor). */
  definiteness: Definiteness;
  headMeaning: string;
  number: NounNumber;
  /** Optional possessor (`cat's sword` → possessor cat, head sword). */
  possessor?: SimplePossessorIr;
};

export type VerbTense = 'present' | 'past';

export type VerbIr = {
  lemmaMeaning: string;
  tense: VerbTense;
};

export type SimpleClauseIr = {
  subject: NounPhraseIr;
  verb: VerbIr;
  object?: NounPhraseIr;
};

export type SimpleTranslationOk = {
  ok: true;
  text: string;
};

export type SimpleTranslationErr = {
  ok: false;
  message: string;
};

export type SimpleTranslationResult = SimpleTranslationOk | SimpleTranslationErr;
