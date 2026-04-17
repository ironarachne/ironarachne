/** Map a few high-frequency plural surfaces to singular lemmas used in the lexicon. */
const ENGLISH_NOUN_PLURAL_TO_SINGULAR: Readonly<Record<string, string>> = {
  teeth: 'tooth',
  men: 'man',
  women: 'woman',
  feet: 'foot',
  children: 'child',
  geese: 'goose',
  mice: 'mouse',
};

export function englishPluralNounSurfaceToSingularLemma(surface: string): string {
  const w = surface.toLowerCase();
  return ENGLISH_NOUN_PLURAL_TO_SINGULAR[w] ?? w;
}
