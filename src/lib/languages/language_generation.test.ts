import { RNG } from '@ironarachne/rng';
import { describe, expect, it } from 'vitest';

import {
  applyMorphologicalAffix,
  generateConstructedLanguage,
  getDefaultLanguageGeneratorConfig,
  getLexiconWordsBySpeechPart,
} from './index.js';
import { getAllPhonemes } from './phonemes.js';

describe('generateConstructedLanguage', () => {
  it('is deterministic for a fixed seed', () => {
    const seed = 'languages-lib-test-seed-001';
    const first = generateConstructedLanguage(getDefaultLanguageGeneratorConfig(new RNG(seed)));
    const second = generateConstructedLanguage(getDefaultLanguageGeneratorConfig(new RNG(seed)));
    expect(second).toEqual(first);
  });

  it('fills lexicon, typology, and morphology', () => {
    const seed = 'languages-lib-test-seed-002';
    const lang = generateConstructedLanguage(getDefaultLanguageGeneratorConfig(new RNG(seed)));
    expect(lang.name.length).toBeGreaterThan(0);
    expect(lang.phonemeSetName).toBe('English');
    expect(['SVO', 'SOV', 'VSO', 'VOS', 'OVS', 'OSV']).toContain(lang.wordOrder);
    expect(lang.syllableProfile.length).toBeGreaterThan(0);
    expect(lang.syllablePattern.length).toBeGreaterThan(0);
    expect(lang.orthographySummary.length).toBeGreaterThan(0);

    const nouns = getLexiconWordsBySpeechPart(lang.lexicon, 'noun');
    expect(nouns.length).toBeGreaterThan(5);
    expect(nouns.every((w) => w.root.length > 0 && w.pronunciation.length > 0)).toBe(true);

    expect(lang.morphology.pluralAffix.length).toBeGreaterThan(0);
    expect(lang.morphology.pastAffix.length).toBeGreaterThan(0);
    expect(['prefix', 'suffix']).toContain(lang.morphology.pluralPlacement);
    expect(['prefix', 'suffix']).toContain(lang.morphology.pastPlacement);

    expect(['none', 'definite_and_indefinite', 'definite_only']).toContain(lang.articleSystem);
    expect(lang.possessionStrategy).toHaveProperty('kind');

    const plural = applyMorphologicalAffix(
      nouns[0].root,
      lang.morphology.pluralAffix,
      lang.morphology.pluralPlacement,
    );
    expect(plural).toContain(lang.morphology.pluralAffix);
  });
});

describe('phoneme inventory', () => {
  it('has a single ʊ entry (no duplicate sound keys)', () => {
    const upsilon = getAllPhonemes().filter((p) => p.sound === 'ʊ');
    expect(upsilon).toHaveLength(1);
    expect(upsilon[0].transcriptions).toContain('u');
    expect(upsilon[0].transcriptions).toContain('oo');
  });
});
