import { linearizeSimpleClauseIrToConlang } from './clause_ir_linearize_to_conlang.js';
import { parseEnglishSimpleClause } from './english_simple_clause_parse.js';
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

/** Translates a simple English SVO clause into the conlang using its word order and lexicon. */
export function translateEnglishSentenceToConstructedLanguage(
  sentence: string,
  language: ConstructedLanguage,
): SimpleTranslationResult {
  const index = buildLexiconTranslationIndex(language.lexicon);
  const parsed = parseEnglishSimpleClause(sentence, index);
  if (isSimpleTranslationErr(parsed)) {
    return parsed;
  }
  try {
    const text = linearizeSimpleClauseIrToConlang(language, parsed, index);
    return { ok: true, text };
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    return { ok: false, message };
  }
}
