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
export type LandscapeNameScope = 'region' | 'zone';
export type LandscapeNameStyle =
  | 'descriptive'
  | 'geographic'
  | 'cultural'
  | 'compound'
  | 'metaphor'
  | 'toponym'
  | 'of_phrase';
export type LandscapeRootPalette = 'soft' | 'balanced' | 'rugged';
export type LandscapeNameIdentity = {
  motifKey?: string;
  rootKey?: string;
};
export type LandscapeNameInput = {
  id: string;
  nouns: string[];
  directions: LandscapeDirection[];
  scope?: LandscapeNameScope;
  culturePatterns?: StoredNameGeneratorPatternSet;
};
export type LandscapeNameContext = {
  usedNames: string[];
  recentStyles: LandscapeNameStyle[];
  recentIdentities?: LandscapeNameIdentity[];
};

/** Internal reviewed vocabulary; forms substitute only {noun} and {root}. */
export type LandscapeNameTemplate = {
  id: string;
  style: LandscapeNameStyle;
  scopes: LandscapeNameScope[];
  eligibleNouns: string[];
  forms: string[];
  motifKey?: string;
  rootPalette?: LandscapeRootPalette;
};
export type LandscapeNameCandidate = {
  name: string;
  style: LandscapeNameStyle;
  identity: LandscapeNameIdentity;
  weight: number;
};
export type LandscapeNameResult = {
  name: string;
  style: LandscapeNameStyle;
  nextContext: LandscapeNameContext;
};
