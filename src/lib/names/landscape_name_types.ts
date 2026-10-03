import type { StoredNameGeneratorPatternSet } from './name_generator_patterns';

export type LandscapeDirection =
  | 'north'
  | 'northeast'
  | 'east'
  | 'southeast'
  | 'south'
  | 'southwest'
  | 'west'
  | 'northwest'
  | 'central';
export type LandscapeNameStyle = 'descriptive' | 'geographic' | 'cultural';
export type LandscapeNameInput = {
  id: string;
  nouns: string[];
  directions: LandscapeDirection[];
  culturePatterns?: StoredNameGeneratorPatternSet;
};
export type LandscapeNameContext = {
  usedNames: string[];
  recentStyles: LandscapeNameStyle[];
};
export type LandscapeNameResult = {
  name: string;
  style: LandscapeNameStyle;
  nextContext: LandscapeNameContext;
};
