'use strict';

import * as Invented from './invented';
import * as RND from '../random';
import GenericNameGenerator from './generators/generic';
import GeneratorSet from './generatorset';
import GermanicSet from './cultures/germanic';
import FantasySet from './cultures/fantasy';

export function allGenSets(): GeneratorSet[] {
  return [new GermanicSet(), new FantasySet()];
}

export function randomGenSet(): GeneratorSet {
  let all = allGenSets();

  return RND.item(all);
}

export function generate(): string {
  return Invented.generate(patterns());
}

export function getNameGenerator(gender: string, patterns: string[]): GenericNameGenerator {
  let femalePatterns = [];
  let familyPatterns = [];
  let malePatterns = [];
  let namePatterns: string[] = [];

  for (let i = 0; i < patterns.length; i++) {
    femalePatterns.push(patterns[i] + RND.item(['A', 'I']));
    malePatterns.push(patterns[i]);
    familyPatterns.push(patterns[i] + RND.item(['cv', 'vcv']));
  }

  if (gender === 'male') {
    namePatterns = malePatterns;
  } else if (gender === 'female') {
    namePatterns = femalePatterns;
  } else if (gender === 'family') {
    namePatterns = familyPatterns;
  }

  let nameGenerator = new GenericNameGenerator();
  nameGenerator.patterns = namePatterns;

  return nameGenerator;
}

// Generates a set of similar patterns
export function randomNameRoots(): string[] {
  const prefixes = ['cvc', 'cvd', 'vcv', 'cvc'];
  const suffixes = ['vc', 'vcv', 'vn', 'sv', 'vs'];

  const patterns = [];

  for (let i = 0; i < 2; i++) {
    patterns.push(RND.item(prefixes) + RND.item(suffixes));
  }

  return patterns;
}

function patterns(): string[] {
  return ['cvdv', 'vccvc', 'pvcvc', 'cvMANI', 'cvcDARI', 'cAdERI', 'cvcAcI'];
}
