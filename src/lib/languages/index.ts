export { linearizeSimpleClauseIrToConlang } from './clause_ir_linearize_to_conlang.js';
export { linearizeSimpleClauseIrToEnglish } from './clause_ir_linearize_to_english.js';
export { parseConlangSimpleClauseToIr } from './conlang_simple_clause_parse.js';
export { parseEnglishSimpleClause } from './english_simple_clause_parse.js';
export {
  getAllPhonemes,
  getConsonants,
  getFirstPhonemeBySound,
  getPhonemesByClassifier,
  getVowels,
} from './phonemes.js';
export { getDefaultLanguageGeneratorConfig } from './generatorconfig.js';
export { applyMorphologicalAffix, generateConstructedLanguage } from './generator.js';
export { createLexicon, getLexiconWordsBySpeechPart } from './lexicon.js';
export {
  buildLexiconTranslationIndex,
  lookupWordByMeaning,
  meaningKey,
  type LexiconTranslationIndex,
} from './lexicon_translation_index.js';
export type {
  ArticleSystem,
  ConstructedLanguage,
  Definiteness,
  LanguageGeneratorConfig,
  Lexicon,
  Morphology,
  Morpheme,
  NounNumber,
  NounPhraseIr,
  Phoneme,
  PhonemeSet,
  PossessionStrategy,
  SimpleClauseIr,
  SimplePossessorIr,
  SimpleTranslationErr,
  SimpleTranslationOk,
  SimpleTranslationResult,
  SyllableProfile,
  SyllableSegment,
  VerbIr,
  VerbTense,
  Word,
  WordOrder,
} from './language_types.js';
export {
  conlangExpectsArticleToken,
  englishArticleMeaningForDefiniteness,
  possessionStrategyOmitsPossessorInConlang,
  shouldEmitArticleForDefiniteness,
} from './language_typology.js';
export {
  createEmptyMorpheme,
  getMorphemePronunciation,
  getMorphemeTranscription,
} from './morpheme.js';
export { createPhonemeSet, listPhonemesInSet } from './phonemeset.js';
export { getAllPhonemeSets } from './phonemesets.js';
export { tokenizeSimpleSentence } from './simple_sentence_tokenize.js';
export { translateConstructedLanguageSentenceToEnglish } from './translate_constructed_language_to_english.js';
export { translateEnglishSentenceToConstructedLanguage } from './translate_english_to_constructed_language.js';
export { createWord } from './word.js';
export {
  getClauseConstituentOrderForWordOrder,
  type ClauseConstituent,
} from './word_order_constituents.js';
