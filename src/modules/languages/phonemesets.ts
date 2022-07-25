'use strict';

import PhonemeSet from './phonemeset';

export function all(): PhonemeSet[] {
  return [getEnglishSet()];
}

function getEnglishSet(): PhonemeSet {
  let set = new PhonemeSet('English');
  // TODO: set the rarity of phonemes, remove phonemes that don't belong in English
  return set;
}
