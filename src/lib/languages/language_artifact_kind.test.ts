import { RNG } from '@ironarachne/rng';
import { describe, expect, it } from 'vitest';

import {
  languageArtifactKind,
  languageName,
  migrateLanguageSnapshot,
  validateLanguageSnapshot,
  LANGUAGE_ARTIFACT_KIND,
  LANGUAGE_PAYLOAD_VERSION,
} from './language_artifact_kind';
import { rollLanguageSnapshot } from './language_roll';
import type { LanguageSnapshot } from './language_snapshot';

const SNAPSHOT = rollLanguageSnapshot('kind-seed');

/** The payload as it comes out of the store: plain JSON, with nothing typed about it. */
function stored(snapshot: LanguageSnapshot): Record<string, unknown> {
  return JSON.parse(JSON.stringify(snapshot)) as Record<string, unknown>;
}

describe('the kind', () => {
  it('is unqualified: a language is neither a system nor a setting', () => {
    expect(LANGUAGE_ARTIFACT_KIND).toBe('language');
    expect(languageArtifactKind.payloadVersion).toBe(LANGUAGE_PAYLOAD_VERSION);
  });

  it('stores the larger thing, which is what keeps it clear of what #28 warned about', () => {
    // #28 warned that naming a kind after a language and storing only a `NameGeneratorSet` would be
    // expensive to undo. This payload is the whole language, lexicon included.
    const result = validateLanguageSnapshot(stored(SNAPSHOT));

    expect(result.ok && result.value.lexicon.words.length).toBeGreaterThan(1000);
    expect(result.ok && result.value.phonemeSetName).toBe(SNAPSHOT.phonemeSetName);
    expect(result.ok && result.value.morphology.pluralAffix).toBe(SNAPSHOT.morphology.pluralAffix);
  });

  it('round-trips through its own codec', async () => {
    const codec = await languageArtifactKind.loadCodec();
    const language = codec.fromSnapshot(
      stored(SNAPSHOT) as unknown as LanguageSnapshot,
      new RNG('unused'),
    );

    expect(codec.toSnapshot(language)).toEqual(SNAPSHOT);
  });
});

describe('validateLanguageSnapshot', () => {
  it('accepts what the roller produces', () => {
    expect(validateLanguageSnapshot(stored(SNAPSHOT))).toMatchObject({ ok: true });
  });

  it('refuses something that is not an object', () => {
    expect(validateLanguageSnapshot('a language').ok).toBe(false);
    expect(validateLanguageSnapshot(null).ok).toBe(false);
  });

  it('refuses a payload with no name, that being what a vault listing shows', () => {
    const result = validateLanguageSnapshot({ ...stored(SNAPSHOT), name: '   ' });

    expect(result.ok).toBe(false);
    expect(result.ok === false && result.reason).toBe('invalid-payload');
  });

  it('reads a language with no lexicon as one with an empty lexicon', () => {
    // Requirement 3.3. A language whose words a user deleted still has a phonology, a word order
    // and a morphology, and refusing to open it would strip them of all three.
    const result = validateLanguageSnapshot({ ...stored(SNAPSHOT), lexicon: 'gone' });

    expect(result.ok).toBe(true);
    expect(result.ok && result.value.lexicon.words).toEqual([]);
    expect(result.ok && result.value.wordOrder).toBe(SNAPSHOT.wordOrder);
  });

  it('drops a word with no meaning rather than taking the language with it', () => {
    const result = validateLanguageSnapshot({
      ...stored(SNAPSHOT),
      lexicon: {
        words: [
          { root: 'ven', pronunciation: 'vɛn', speechPart: 'noun', meaning: 'stone' },
          { root: 'orphan', speechPart: 'noun' },
          42,
        ],
      },
    });

    expect(result.ok).toBe(true);
    expect(result.ok && result.value.lexicon.words.map((word) => word.meaning)).toEqual(['stone']);
  });

  it('falls back on an unrecognised word order or article system', () => {
    const result = validateLanguageSnapshot({
      ...stored(SNAPSHOT),
      wordOrder: 'XYZ',
      articleSystem: 'sometimes',
    });

    expect(result.ok && result.value.wordOrder).toBe('SVO');
    expect(result.ok && result.value.articleSystem).toBe('none');
  });

  it('reads a possession marker that lost its affix as an unmarked language', () => {
    // The one field where keeping an unrecognised value is not an option: a `marker_on_possessed`
    // with no affix is a variant the translator cannot use.
    const result = validateLanguageSnapshot({
      ...stored(SNAPSHOT),
      possessionStrategy: { kind: 'marker_on_possessed' },
    });

    expect(result.ok && result.value.possessionStrategy).toEqual({ kind: 'none' });
  });

  it('keeps a possession marker that has one', () => {
    const result = validateLanguageSnapshot({
      ...stored(SNAPSHOT),
      possessionStrategy: { kind: 'marker_on_possessed', affix: 'ka', placement: 'prefix' },
    });

    expect(result.ok && result.value.possessionStrategy).toEqual({
      kind: 'marker_on_possessed',
      affix: 'ka',
      placement: 'prefix',
    });
  });

  it('keeps only C and V in a syllable pattern', () => {
    const result = validateLanguageSnapshot({
      ...stored(SNAPSHOT),
      syllablePattern: ['C', 'V', 'X', 7, 'C'],
    });

    expect(result.ok && result.value.syllablePattern).toEqual(['C', 'V', 'C']);
  });

  it('gives a missing morphology a usable default', () => {
    const result = validateLanguageSnapshot({ ...stored(SNAPSHOT), morphology: undefined });

    expect(result.ok && result.value.morphology).toEqual({
      pluralAffix: '',
      pastAffix: '',
      pluralPlacement: 'suffix',
      pastPlacement: 'suffix',
    });
  });
});

describe('migrateLanguageSnapshot', () => {
  it('refuses every version, there having only ever been one', () => {
    // Requirement 7.3 with one payload version: the step that does not exist is asserted as not
    // existing, so the day a second shape lands there is a test to fill in rather than write.
    for (const from of [0, 2, 99]) {
      const result = migrateLanguageSnapshot(stored(SNAPSHOT), from);

      expect(result.ok).toBe(false);
      expect(result.ok === false && result.reason).toBe('unsupported-version');
      expect(result.ok === false && result.message).toContain(`version ${from}`);
    }
  });
});

describe('languageName', () => {
  it('is the language name', () => {
    expect(languageName(SNAPSHOT)).toBe(SNAPSHOT.name);
  });

  it('has something to call a language with no name', () => {
    expect(languageName({ ...SNAPSHOT, name: '  ' })).toBe('Language');
  });
});
