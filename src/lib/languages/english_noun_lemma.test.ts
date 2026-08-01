import { describe, expect, it } from 'vitest';
import { resolveEnglishNounToken } from './english_noun_lemma';

const NOUNS = new Set(['cat', 'city', 'box', 'glass', 'man', 'bus']);

describe('resolveEnglishNounToken', () => {
  const cases: [token: string, lemma: string | null, number?: 'singular' | 'plural'][] = [
    ['cat', 'cat', 'singular'],
    ['Cat', 'cat', 'singular'],
    ['CAT', 'cat', 'singular'],
    ['cats', 'cat', 'plural'],
    ['cities', 'city', 'plural'],
    ['boxes', 'box', 'plural'],
    ['buses', 'bus', 'plural'],
    /* "glass" is itself a lemma, so it stays singular rather than being read as a plural of "glas". */
    ['glass', 'glass', 'singular'],
    ['dog', null],
    ['dogs', null],
    /* A bare "s" plural is never taken off a double-s ending. */
    ['glasss', null],
  ];

  it.each(cases)('reads %s as %s', (token, lemma, number) => {
    const parsed = resolveEnglishNounToken(token, NOUNS);
    if (lemma === null) {
      expect(parsed).toBeNull();
      return;
    }
    expect(parsed).toEqual({ lemma, number });
  });

  it('prefers an exact lemma over any plural reading', () => {
    const nouns = new Set(['glasses', 'glass']);
    expect(resolveEnglishNounToken('glasses', nouns)).toEqual({
      lemma: 'glasses',
      number: 'singular',
    });
  });

  it('does not strip endings off tokens too short to carry them', () => {
    expect(resolveEnglishNounToken('is', new Set(['i']))).toBeNull();
    expect(resolveEnglishNounToken('ies', new Set(['y']))).toBeNull();
  });

  it('returns null against an empty lexicon', () => {
    expect(resolveEnglishNounToken('cat', new Set())).toBeNull();
  });
});
