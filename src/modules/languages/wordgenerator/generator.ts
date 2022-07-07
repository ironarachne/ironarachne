'use strict';

import * as RND from '../../random';
import * as Elements from './elements';

export default class WordGenerator {
  patterns: string[];

  constructor() {
    this.patterns = [];
  }

  generate(): string {
    let pattern = RND.item(this.patterns);

    let word = '';
    let phonemes = [];

    for (let i = 0; i < pattern.length; i++) {
      let phoneme = pattern[i];
      if (pattern[i] === '+') {
        phoneme = phonemes[i - 1];
      } else {
        phoneme = parsePatternElement(pattern[i]);
      }
      word += phoneme;
      phonemes.push(phoneme);
    }

    return word;
  }
}

function parsePatternElement(element: string): string {
  let elements = Elements.all();

  for (let i = 0; i < elements.length; i++) {
    if (element === elements[i].symbol) {
      return RND.item(elements[i].elements);
    }
  }

  return element.toLowerCase();
}
