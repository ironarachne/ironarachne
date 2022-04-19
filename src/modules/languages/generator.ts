'use strict';

import LanguageGeneratorConfig from "./generatorconfig";
import Language from "./language";
import * as RND from '../random';
import * as Phonemes from './phonemes/phonemes';
import * as Words from '../words';
import PhonemeCollection from "./phonemes/collection";

export default class LanguageGenerator {
  config: LanguageGeneratorConfig;

  constructor(config: LanguageGeneratorConfig) {
    this.config = config;
  }

  generate(): Language {
    const phonemes = this.config.phonemes;

    const name = Words.capitalize(randomWordRoot(phonemes));

    const language = new Language(name, "", phonemes);

    for (let i = 0; i < language.lexicon.words.length; i++) {
      language.lexicon.words[i].root = randomWordRoot(phonemes);
    }

    return language;
  }
}

function randomMatchingSound(part: string, phonemes: PhonemeCollection) {
  let options = phonemes.consonants;

  if (part === 'V') {
    options = phonemes.vowels;
  } else if (part === 'S') {
    options = phonemes.sibilants;
  } else if (part === 'F') {
    options = phonemes.fricatives;
  } else if (part === 'L') {
    options = phonemes.liquids;
  }

  return RND.item(options);
}

function randomWordRoot(phonemes: PhonemeCollection) {
  const wordPattern = randomWordPattern();
  let word = '';

  for (let i = 0; i < wordPattern.length; i++) {
    word += Phonemes.soundToSpelling(randomMatchingSound(wordPattern[i], phonemes));
  }

  return word;
}

function randomWordPattern() {
  return RND.item(['CVC', 'VCC', 'VCCV', 'CVVC', 'CVCV', 'CVS', 'CVF', 'CVCS', 'CVCF']);
}
