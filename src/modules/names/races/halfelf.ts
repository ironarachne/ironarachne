'use strict';

import NameGenerator from '../generator';
import GenericNameGenerator from '../generators/generic';
import GeneratorSet from '../generatorset';

export default class HalfElfSet extends GeneratorSet {
  constructor() {
    super();
    this.family = family();
    this.female = female();
    this.male = male();
  }
}

function family(): NameGenerator {
  let gen = new GenericNameGenerator();

  gen.patterns = [
    'Apvlnvn',
    'vpvcnvn',
    'vSHlvnp',
    'SnvTH',
    'pvvLOR',
    'pv+PER',
    'sLvTCHER',
    'svRRIER',
    'pvnDElSON',
    'pvnDElS',
    'vvpSBURG',
    'vvpSBERG',
    'vlnvTHION',
    'vpRvHAM',
    'vcpLAND',
    'vcpLvND',
    'vcfFORD',
    'vcnFvRD',
  ];

  let prefixes = [
    'WHITE',
    'GREEN',
    'BLUE',
    'WILD',
    'SUMMER',
    'WINTER',
    'WIND',
    'BEACH',
    'DAWN',
    'DUSK',
    'SKY',
    'NIGHT',
  ];

  let suffixes = [
    'FLOWER',
    'WALKER',
    'SONG',
    'RUNNER',
    'CROWN',
    'BLOSSOM',
    'BELL',
    'WATCHER',
    'GUARD',
    'STAR',
    'GROVE',
  ];

  for (let i = 0; i < prefixes.length; i++) {
    for (let j = 0; j < suffixes.length; j++) {
      gen.patterns.push(prefixes[i] + suffixes[j]);
    }
  }

  return gen;
}

function female(): NameGenerator {
  let gen = new GenericNameGenerator();

  gen.patterns = ['vnvlA', 'vnv', 'vdvlvN', 'vlvnA', 'vcnvA', 'cvlvNIA', 'cvlvNA', 'pvSSvpa'];

  return gen;
}

function male(): NameGenerator {
  let gen = new GenericNameGenerator();

  gen.patterns = [
    'vFFlvn',
    'cvclvn',
    'vpvlvn',
    'cvLLvvn',
    'cvlvpul',
    'vppvl',
    'pvspvn',
    'pv+lvn',
    'pvlsvp',
    'pvDRvC',
  ];

  return gen;
}
