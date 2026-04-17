import { RNG } from '@ironarachne/rng';
import { describe, expect, it } from 'vitest';

import { buildLexiconTranslationIndex } from './lexicon_translation_index.js';
import { generateConstructedLanguage } from './generator.js';
import { getDefaultLanguageGeneratorConfig } from './generatorconfig.js';
import { getLexiconWordsBySpeechPart } from './lexicon.js';
import { parseEnglishSimpleClause } from './english_simple_clause_parse.js';
import type { SimpleTranslationErr } from './language_types.js';
import { translateConstructedLanguageSentenceToEnglish } from './translate_constructed_language_to_english.js';
import { translateEnglishSentenceToConstructedLanguage } from './translate_english_to_constructed_language.js';

describe('simple sentence translation', () => {
  it('round-trips English → conlang → English for a fixed seed', () => {
    const seed = 'translation-roundtrip-seed-01';
    const language = generateConstructedLanguage(getDefaultLanguageGeneratorConfig(new RNG(seed)));
    const english = 'the cat sees a dog';
    const toConlang = translateEnglishSentenceToConstructedLanguage(english, language);
    expect(toConlang.ok).toBe(true);
    if (!toConlang.ok) {
      return;
    }
    const back = translateConstructedLanguageSentenceToEnglish(toConlang.text, language);
    expect(back.ok).toBe(true);
    if (!back.ok) {
      return;
    }
    expect(back.text.toLowerCase()).toContain('cat');
    expect(back.text.toLowerCase()).toContain('dog');
    expect(back.text.toLowerCase()).toMatch(/see|saw/);
  });

  it('translates intransitive English', () => {
    const seed = 'translation-intrans-seed-02';
    const language = generateConstructedLanguage(getDefaultLanguageGeneratorConfig(new RNG(seed)));
    const result = translateEnglishSentenceToConstructedLanguage('the dog runs', language);
    expect(result.ok).toBe(true);
    if (!result.ok) {
      return;
    }
    expect(result.text.trim().length).toBeGreaterThan(0);
    const back = translateConstructedLanguageSentenceToEnglish(result.text, language);
    expect(back.ok).toBe(true);
  });

  it('parses English genitive possessor on the subject', () => {
    const language = generateConstructedLanguage(
      getDefaultLanguageGeneratorConfig(new RNG('translation-possessive-parse-01')),
    );
    const index = buildLexiconTranslationIndex(language.lexicon);
    const parsed = parseEnglishSimpleClause("the man's sword falls", index);
    if ('ok' in parsed) {
      throw new Error((parsed as SimpleTranslationErr).message);
    }
    expect(parsed.subject.possessor?.nounLemma).toBe('man');
    expect(parsed.subject.headMeaning).toBe('sword');
  });

  it('does not emit article roots when articleSystem is none', () => {
    const base = generateConstructedLanguage(
      getDefaultLanguageGeneratorConfig(new RNG('translation-no-articles-01')),
    );
    const language = { ...base, articleSystem: 'none' as const };
    const articleRoots = getLexiconWordsBySpeechPart(language.lexicon, 'article').map(
      (w) => w.root,
    );
    const result = translateEnglishSentenceToConstructedLanguage('the cat sees a dog', language);
    expect(result.ok).toBe(true);
    if (!result.ok) {
      return;
    }
    for (const root of articleRoots) {
      expect(result.text).not.toContain(root);
    }
  });

  it('omits possessor roots in conlang when possession strategy is none', () => {
    const base = generateConstructedLanguage(
      getDefaultLanguageGeneratorConfig(new RNG('translation-no-poss-01')),
    );
    const language = { ...base, possessionStrategy: { kind: 'none' as const } };
    const manWord = getLexiconWordsBySpeechPart(language.lexicon, 'noun').find(
      (w) => w.meaning === 'man',
    );
    const result = translateEnglishSentenceToConstructedLanguage("the man's sword falls", language);
    expect(result.ok).toBe(true);
    if (!result.ok || !manWord) {
      return;
    }
    expect(result.text).not.toContain(manWord.root);
  });

  it('rejects unknown vocabulary in English input', () => {
    const seed = 'translation-unknown-seed-03';
    const language = generateConstructedLanguage(getDefaultLanguageGeneratorConfig(new RNG(seed)));
    const result = translateEnglishSentenceToConstructedLanguage('the cat xyzzys a dog', language);
    expect(result.ok).toBe(false);
    if (result.ok) {
      return;
    }
    expect(result.message.length).toBeGreaterThan(0);
  });
});
