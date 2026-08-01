import { describe, expect, it } from 'vitest';
import { resolveEnglishVerbToken } from './english_verb_lemma';

const VERBS = new Set(['be', 'have', 'do', 'see', 'walk', 'carry', 'push', 'stop', 'like', 'pass']);

describe('resolveEnglishVerbToken', () => {
  const cases: [token: string, lemma: string | null, tense?: 'present' | 'past'][] = [
    ['walk', 'walk', 'present'],
    ['Walk', 'walk', 'present'],
    /* Copula and auxiliary surfaces map onto their lemma. */
    ['is', 'be', 'present'],
    ['am', 'be', 'present'],
    ['are', 'be', 'present'],
    ['has', 'have', 'present'],
    ['have', 'have', 'present'],
    ['does', 'do', 'present'],
    ['do', 'do', 'present'],
    /* Irregular past forms come from the surface-to-lemma table. */
    ['saw', 'see', 'past'],
    /* Regular -ed past, including the doubled consonant and -ied spellings. */
    ['walked', 'walk', 'past'],
    ['liked', 'like', 'past'],
    ['stopped', 'stop', 'past'],
    ['carried', 'carry', 'past'],
    /* Third-person singular present. */
    ['walks', 'walk', 'present'],
    ['carries', 'carry', 'present'],
    ['pushes', 'push', 'present'],
    ['runs', null],
    ['xyzzy', null],
  ];

  it.each(cases)('reads %s as %s', (token, lemma, tense) => {
    const parsed = resolveEnglishVerbToken(token, VERBS);
    if (lemma === null) {
      expect(parsed).toBeNull();
      return;
    }
    expect(parsed).toEqual({ lemmaMeaning: lemma, tense });
  });

  it('only maps an auxiliary surface when its lemma is in the lexicon', () => {
    expect(resolveEnglishVerbToken('is', new Set(['walk']))).toBeNull();
    expect(resolveEnglishVerbToken('has', new Set(['walk']))).toBeNull();
    expect(resolveEnglishVerbToken('does', new Set(['walk']))).toBeNull();
  });

  it('only maps an irregular past when its present lemma is in the lexicon', () => {
    expect(resolveEnglishVerbToken('saw', new Set(['walk']))).toBeNull();
  });

  it('leaves a double-s ending alone rather than reading it as third person', () => {
    expect(resolveEnglishVerbToken('pass', VERBS)).toEqual({
      lemmaMeaning: 'pass',
      tense: 'present',
    });
  });

  it('does not treat a short -ed token as a past form', () => {
    expect(resolveEnglishVerbToken('bed', new Set(['b']))).toBeNull();
  });
});
