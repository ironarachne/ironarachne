'use strict';

import Phoneme from './phoneme';

export function all(): Phoneme[] {
  return [
    new Phoneme('b', ['b'], ['consonant', 'bilabial', 'plosive', 'voiced'], 5),
    new Phoneme('c', ['c', 'k'], ['consonant', 'palatal', 'plosive', 'voiceless'], 5),
    new Phoneme(
      'ch',
      ['ch'],
      ['affricate', 'consonant', 'palato-alveolar', 'sibilant', 'voiceless'],
      2,
    ),
    new Phoneme('d', ['d'], ['alveolar', 'consonant', 'dental', 'plosive', 'voiced'], 5),
    new Phoneme('f', ['f'], ['consonant', 'voiceless', 'fricative', 'labiodental'], 5),
    new Phoneme('g', ['g'], ['consonant', 'plosive', 'velar', 'voiced'], 5),
    new Phoneme('h', ['h'], ['consonant', 'voiceless', 'fricative', 'glottal', 'transition'], 5),
    new Phoneme('j', ['j'], ['affricate', 'consonant', 'sibilant'], 5),
    new Phoneme('k', ['k'], ['consonant', 'plosive', 'velar', 'voiceless'], 5),
    new Phoneme('l', ['l', 'll'], ['consonant', 'dental', 'lateral', 'liquid'], 5),
    new Phoneme('m', ['m'], ['consonant', 'nasal', 'occlusive'], 5),
    new Phoneme('n', ['n'], ['alveolar', 'consonant', 'dental', 'nasal', 'occlusive'], 5),
    new Phoneme('ŋ', ['ng'], ['consonant', 'nasal', 'velar', 'voiced'], 5),
    new Phoneme('p', ['p'], ['bilabial', 'consonant', 'plosive', 'voiced'], 5),
    new Phoneme('q', ['q'], ['consonant', 'plosive', 'uvular', 'voiceless'], 5),
    new Phoneme('ɹ', ['r'], ['consonant', 'liquid', 'rhotic'], 5),
    new Phoneme('s', ['s'], ['consonant', 'coronal', 'fricative', 'voiceless'], 5),
    new Phoneme('ʃ', ['sh'], ['consonant', 'fricative', 'sibilant'], 5),
    new Phoneme('ʒ', ['si', 'zh'], ['consonant', 'fricative', 'palato-alveolar', 'sibilant'], 5),
    new Phoneme('t', ['t'], ['consonant', 'dental', 'plosive'], 5),
    new Phoneme(
      'ts',
      ['ts', 'tsu'],
      ['affricate', 'alveolar', 'consonant', 'fricative', 'voiceless'],
      2,
    ),
    new Phoneme('θ', ['th'], ['consonant', 'fricative', 'voiceless'], 1),
    new Phoneme('ð', ['th'], ['consonant', 'fricative', 'voiced'], 1),
    new Phoneme('v', ['v'], ['consonant', 'fricative', 'labiodental', 'voiced'], 5),
    new Phoneme('w', ['w'], ['approximant', 'consonant', 'velar', 'voiced'], 5),
    new Phoneme('x', ['ch', 'k'], ['consonant', 'fricative', 'velar', 'voiceless'], 5),
    new Phoneme('y', ['y'], ['approximant', 'consonant', 'palatal', 'voiced'], 5),
    new Phoneme('z', ['z', 'x'], ['aveolar', 'consonant', 'fricative', 'voiced'], 5),
    new Phoneme('ə', ['a'], ['central', 'unrounded', 'vowel'], 5), // e.g., the a in Tina
    new Phoneme('æ', ['a'], ['front', 'unrounded', 'vowel'], 5),
    new Phoneme('ɔ', ['o'], ['back', 'unrounded', 'vowel'], 5),
    new Phoneme('ɛ', ['e'], ['front', 'unrounded', 'vowel'], 5),
    new Phoneme('ɪ', ['i'], ['front', 'unrounded', 'vowel'], 5),
    new Phoneme('ʌ', ['u', 'oo'], ['central', 'vowel'], 5), // e.g., foot
    new Phoneme('ʊ', ['u'], ['near-back', 'rounded', 'vowel'], 5),
    new Phoneme('i', ['i', 'ee'], ['close', 'front', 'unrounded', 'vowel'], 5), // e.g., free
    new Phoneme('u', ['u', 'oo'], ['close', 'back', 'rounded', 'vowel'], 5), // e.g., food
  ];
}

export function byClassification(classification: string, phonemes: Phoneme[]): Phoneme[] {
  return phonemes.filter((phoneme) => phoneme.classifiers.includes(classification));
}

export function bySound(sound: string, phonemes: Phoneme[]): Phoneme {
  return phonemes.filter((phoneme) => phoneme.sound === sound)[0];
}

export function getConsonants(phonemes: Phoneme[]): Phoneme[] {
  let result = byClassification('consonant', phonemes);
  return result;
}

export function getVowels(phonemes: Phoneme[]): Phoneme[] {
  let result = byClassification('vowel', phonemes);
  return result;
}
