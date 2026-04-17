import type { Phoneme, PhonemeSet } from './language_types.js';
import { getAllPhonemes } from './phonemes.js';

export function createPhonemeSet(name: string): PhonemeSet {
  const phonemes: Record<string, Phoneme> = {};
  for (const phoneme of getAllPhonemes()) {
    phonemes[phoneme.sound] = { ...phoneme };
  }
  return { name, phonemes };
}

export function listPhonemesInSet(set: PhonemeSet): Phoneme[] {
  return Object.values(set.phonemes);
}
