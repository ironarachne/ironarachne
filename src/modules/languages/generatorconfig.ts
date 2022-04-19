'use strict';

import * as RND from '../random';
import PhonemeCollection from './phonemes/collection';
import * as Phonemes from './phonemes/phonemes';

export default class LanguageGeneratorConfig {
  phonemes: PhonemeCollection;

  constructor() {
    this.phonemes = RND.item(Phonemes.all());
  }
}
