'use strict';

import LanguageGeneratorConfig from './generatorconfig';
import Language from './language';
import * as RND from '../random';
import PhonemeSet from './phonemeset';
import * as Phonemes from './phonemes';
import * as Words from '../words';
import random from 'random';

export default class LanguageGenerator {
  config: LanguageGeneratorConfig;

  constructor(config: LanguageGeneratorConfig) {
    this.config = config;
  }

  generate(): Language {
    let phonemeSet = RND.item(this.config.phonemeSets);

    let language = new Language('', phonemeSet);
    language.wordOrder = randomWordOrder();
    language.name = Words.capitalize(randomMorpheme(random.int(4, 7), phonemeSet));

    for (let i = 0; i < language.lexicon.words.length; i++) {
      let morphemeLength = random.int(2, 4);
      if (language.lexicon.words[i].speechPart == 'article') {
        morphemeLength = 2;
      }
      language.lexicon.words[i].root = randomMorpheme(morphemeLength, phonemeSet);
    }

    // TODO: add generation of conjugations

    return language;
  }
}

function randomWordOrder(): string {
  let options = [
    {
      value: 'svo',
      commonality: 10,
    },
    {
      value: 'sov',
      commonality: 1,
    },
  ];

  let order = RND.weighted(options);

  return order.value;
}

function randomMorpheme(length: number, phonemeSet: PhonemeSet): string {
  let consonants = Phonemes.getConsonants(phonemeSet.getPhonemes());
  let vowels = Phonemes.getVowels(phonemeSet.getPhonemes());
  let pattern = '';

  for (let i = 0; i < length; i++) {
    if (i == 0 && length == 1) {
      pattern = 'v';
    } else {
      let newPart = RND.item(['v', 'c']);
      if (i > 0) {
        let last = pattern[i - 1];
        if (last == 'v') {
          newPart = 'c';
        } else {
          newPart = 'v';
        }
      }
      pattern += newPart;
    }
  }

  let morpheme = '';

  for (let i = 0; i < pattern.length; i++) {
    if (pattern[i] == 'v') {
      morpheme += RND.item(RND.weighted(vowels).spellings); // TODO: make spellings weighted
    } else {
      morpheme += RND.item(RND.weighted(consonants).spellings); // TODO: make spellings weighted
    }
  }

  return morpheme;
}
