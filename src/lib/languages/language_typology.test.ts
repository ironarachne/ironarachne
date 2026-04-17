import { describe, expect, it } from 'vitest';

import {
  conlangExpectsArticleToken,
  shouldEmitArticleForDefiniteness,
} from './language_typology.js';

describe('shouldEmitArticleForDefiniteness', () => {
  it('never emits for article-less languages', () => {
    expect(shouldEmitArticleForDefiniteness('none', 'definite')).toBe(false);
    expect(shouldEmitArticleForDefiniteness('none', 'indefinite')).toBe(false);
  });

  it('emits definite and indefinite for two-way systems', () => {
    expect(shouldEmitArticleForDefiniteness('definite_and_indefinite', 'definite')).toBe(true);
    expect(shouldEmitArticleForDefiniteness('definite_and_indefinite', 'indefinite')).toBe(true);
    expect(shouldEmitArticleForDefiniteness('definite_and_indefinite', 'unspecified')).toBe(false);
  });

  it('only emits for definite in definite-only systems', () => {
    expect(shouldEmitArticleForDefiniteness('definite_only', 'definite')).toBe(true);
    expect(shouldEmitArticleForDefiniteness('definite_only', 'indefinite')).toBe(false);
  });
});

describe('conlangExpectsArticleToken', () => {
  it('is false only for article-less systems', () => {
    expect(conlangExpectsArticleToken('none')).toBe(false);
    expect(conlangExpectsArticleToken('definite_only')).toBe(true);
  });
});
