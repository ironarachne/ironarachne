import { linearizeSimpleClauseIrToEnglish } from './clause_ir_linearize_to_english.js';
import { parseConlangSimpleClauseToIr } from './conlang_simple_clause_parse.js';
import { buildLexiconTranslationIndex } from './lexicon_translation_index.js';
import type {
  ConstructedLanguage,
  SimpleClauseIr,
  SimpleTranslationErr,
  SimpleTranslationResult,
} from './language_types.js';

function isSimpleTranslationErr(
  value: SimpleClauseIr | SimpleTranslationErr,
): value is SimpleTranslationErr {
  return 'ok' in value && value.ok === false;
}

/** Parses a simple conlang sentence (matching the language's word order) and renders English SVO. */
export function translateConstructedLanguageSentenceToEnglish(
  sentence: string,
  language: ConstructedLanguage,
): SimpleTranslationResult {
  const index = buildLexiconTranslationIndex(language.lexicon);
  const parsed = parseConlangSimpleClauseToIr(sentence, language, index);
  if (isSimpleTranslationErr(parsed)) {
    return parsed;
  }
  try {
    const text = linearizeSimpleClauseIrToEnglish(parsed);
    return { ok: true, text };
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    return { ok: false, message };
  }
}
