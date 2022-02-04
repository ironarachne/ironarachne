'use strict';

import NameGenerator from '../generator';
import GenericNameGenerator from '../generators/generic';
import GeneratorSet from '../generatorset';

export default class HalflingSet extends GeneratorSet {
  constructor() {
    super();
    this.family = family();
    this.female = female();
    this.male = male();
  }
}

function family(): NameGenerator {
  let gen = new GenericNameGenerator();

  gen.patterns = ['BvdvnS', 'pvMpu'];

  const prefixes = [
    'BRANDY',
    'FEATHER',
    'HAIRY',
    'HOG',
    'HORN',
    'LITTLE',
    'LONG',
    'OAK',
    'OLD',
    'PROUD',
    'PUDDI',
    'SWIFT',
    'UNDER',
    'WANDER',
    'WHIT',
  ];

  const suffixes = ['BELLY', 'BOTTOM', 'DALE', 'FOOT', 'HOUSE', 'PEN', 'WOOD', 'WORT'];

  for (let i = 0; i < prefixes.length; i++) {
    for (let j = 0; j < suffixes.length; j++) {
      gen.patterns.push(prefixes[i] + suffixes[j]);
    }
  }

  return gen;
}

function female(): NameGenerator {
  let gen = new GenericNameGenerator();

  gen.patterns = ['oEOnY', 'oEARL', 'pELInDA', 'mvlvnoA', 'plvSovn', 'Mvovlpvlo', 'pvfvnA'];

  return gen;
}

function male(): NameGenerator {
  let gen = new GenericNameGenerator();

  gen.patterns = ['BvlBv', 'svnwvsE', 'pvPPvn', 'pvlvplvn', 'wvnflvo', 'pvlnO', 'vovlpvRT'];

  return gen;
}
