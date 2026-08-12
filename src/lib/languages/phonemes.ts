import type { Phoneme } from './language_types.js';

import { ALL_PHONEMES } from './phoneme_data.js';

/**
 * Every phoneme. The returned array is shared and must not be mutated. See `ALL_PHONEMES`.
 */
export function getAllPhonemes(): Phoneme[] {
  return ALL_PHONEMES;
}

export function getPhonemesByClassifier(classification: string, phonemes: Phoneme[]): Phoneme[] {
  return phonemes.filter((phoneme) => phoneme.classifiers.includes(classification));
}

export function getFirstPhonemeBySound(sound: string, phonemes: Phoneme[]): Phoneme | undefined {
  return phonemes.find((phoneme) => phoneme.sound === sound);
}

export function getConsonants(phonemes: Phoneme[]): Phoneme[] {
  return getPhonemesByClassifier('consonant', phonemes);
}

export function getVowels(phonemes: Phoneme[]): Phoneme[] {
  return getPhonemesByClassifier('vowel', phonemes);
}
