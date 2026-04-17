import type { RNG } from '@ironarachne/rng';

import type { Morpheme, Phoneme } from './language_types.js';

export function createEmptyMorpheme(): Morpheme {
  return { phonemes: [] };
}

export function getMorphemePronunciation(morpheme: Morpheme): string {
  return morpheme.phonemes.map((p) => p.sound).join('');
}

export function getMorphemeTranscription(morpheme: Morpheme, rng: RNG): string {
  return morpheme.phonemes.map((p) => pickTranscriptionForPhoneme(p, rng)).join('');
}

function pickTranscriptionForPhoneme(phoneme: Phoneme, rng: RNG): string {
  if (phoneme.transcriptions.length === 0) {
    return '';
  }
  if (phoneme.transcriptions.length === 1) {
    return phoneme.transcriptions[0];
  }
  const weights = phoneme.transcriptions.map((_, index) => ({
    commonality: Math.max(1, phoneme.commonality + phoneme.transcriptions.length - index),
    value: index,
  }));
  const index = rng.weighted(weights);
  return phoneme.transcriptions[index];
}
