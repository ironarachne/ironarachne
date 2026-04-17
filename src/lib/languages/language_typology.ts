import type { ArticleSystem, Definiteness, PossessionStrategy } from './language_types.js';

export function shouldEmitArticleForDefiniteness(
  articleSystem: ArticleSystem,
  definiteness: Definiteness,
): boolean {
  if (articleSystem === 'none') {
    return false;
  }
  if (articleSystem === 'definite_and_indefinite') {
    return definiteness === 'definite' || definiteness === 'indefinite';
  }
  return definiteness === 'definite';
}

export function englishArticleMeaningForDefiniteness(
  definiteness: Definiteness,
): 'a' | 'the' | null {
  if (definiteness === 'definite') {
    return 'the';
  }
  if (definiteness === 'indefinite') {
    return 'a';
  }
  return null;
}

export function conlangExpectsArticleToken(articleSystem: ArticleSystem): boolean {
  return articleSystem !== 'none';
}

export function possessionStrategyOmitsPossessorInConlang(strategy: PossessionStrategy): boolean {
  return strategy.kind === 'none';
}
