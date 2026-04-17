import type { PhonemeSet } from './language_types.js';

import { createPhonemeSet } from './phonemeset.js';

export function getAllPhonemeSets(): PhonemeSet[] {
  return [getEnglishPhonemeSet()];
}

function getEnglishPhonemeSet(): PhonemeSet {
  const set = createPhonemeSet('English');
  set.phonemes['ə'].commonality = 114;
  set.phonemes['n'].commonality = 71;
  set.phonemes['ɾ'].commonality = 69;
  set.phonemes['t'].commonality = 69;
  set.phonemes['ɪ'].commonality = 63;
  set.phonemes['s'].commonality = 47;
  set.phonemes['d'].commonality = 42;
  set.phonemes['l'].commonality = 39;
  set.phonemes['i'].commonality = 36;
  set.phonemes['k'].commonality = 31;
  set.phonemes['ð'].commonality = 29;
  set.phonemes['ɛ'].commonality = 28;
  set.phonemes['m'].commonality = 27;
  set.phonemes['z'].commonality = 27;
  set.phonemes['p'].commonality = 21;
  set.phonemes['æ'].commonality = 21;
  set.phonemes['v'].commonality = 20;
  set.phonemes['w'].commonality = 19;
  set.phonemes['u'].commonality = 19;
  set.phonemes['b'].commonality = 18;
  set.phonemes['e'].commonality = 17;
  set.phonemes['ʌ'].commonality = 17;
  set.phonemes['f'].commonality = 17;
  set.phonemes['aɪ'].commonality = 15;
  set.phonemes['a'].commonality = 14;
  set.phonemes['h'].commonality = 15;
  set.phonemes['o'].commonality = 12;
  set.phonemes['ɒ'].commonality = 11;
  set.phonemes['ŋ'].commonality = 9;
  set.phonemes['ʃ'].commonality = 8;
  set.phonemes['j'].commonality = 8;
  set.phonemes['g'].commonality = 8;
  set.phonemes['dʒ'].commonality = 5;
  set.phonemes['tʃ'].commonality = 5;
  set.phonemes['aʊ'].commonality = 5;
  set.phonemes['ʊ'].commonality = 4;
  set.phonemes['θ'].commonality = 4;
  set.phonemes['ɔɪ'].commonality = 1;
  set.phonemes['ʒ'].commonality = 1;

  return set;
}
