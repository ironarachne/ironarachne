import type { Phoneme } from './language_types.js';

export function getAllPhonemes(): Phoneme[] {
  return [
    {
      sound: 'b',
      transcriptions: ['b'],
      classifiers: ['consonant', 'bilabial', 'plosive', 'voiced'],
      commonality: 1,
    },
    {
      sound: 'c',
      transcriptions: ['c', 'k'],
      classifiers: ['consonant', 'palatal', 'plosive', 'voiceless'],
      commonality: 1,
    },
    {
      sound: 'ch',
      transcriptions: ['ch'],
      classifiers: ['affricate', 'consonant', 'palato-alveolar', 'sibilant', 'voiceless'],
      commonality: 1,
    },
    {
      sound: 'd',
      transcriptions: ['d'],
      classifiers: ['alveolar', 'consonant', 'dental', 'plosive', 'voiced'],
      commonality: 1,
    },
    {
      sound: 'dʒ',
      transcriptions: ['j'],
      classifiers: ['affricate', 'consonant', 'postalveolar', 'voiced'],
      commonality: 1,
    },
    {
      sound: 'tʃ',
      transcriptions: ['ch'],
      classifiers: ['affricate', 'consonant', 'postalveolar', 'voiceless'],
      commonality: 1,
    },
    {
      sound: 'f',
      transcriptions: ['f'],
      classifiers: ['consonant', 'voiceless', 'fricative', 'labiodental'],
      commonality: 1,
    },
    {
      sound: 'g',
      transcriptions: ['g'],
      classifiers: ['consonant', 'plosive', 'velar', 'voiced'],
      commonality: 1,
    },
    {
      sound: 'h',
      transcriptions: ['h'],
      classifiers: ['consonant', 'voiceless', 'fricative', 'glottal', 'transition'],
      commonality: 1,
    },
    {
      sound: 'j',
      transcriptions: ['j'],
      classifiers: ['affricate', 'consonant', 'sibilant'],
      commonality: 1,
    },
    {
      sound: 'k',
      transcriptions: ['k'],
      classifiers: ['consonant', 'plosive', 'velar', 'voiceless'],
      commonality: 1,
    },
    {
      sound: 'l',
      transcriptions: ['l', 'll'],
      classifiers: ['alveolar', 'consonant', 'dental', 'lateral', 'liquid', 'voiced'],
      commonality: 1,
    },
    {
      sound: 'm',
      transcriptions: ['m'],
      classifiers: ['bilabial', 'consonant', 'nasal', 'occlusive', 'voiced'],
      commonality: 1,
    },
    {
      sound: 'n',
      transcriptions: ['n'],
      classifiers: ['alveolar', 'consonant', 'dental', 'nasal', 'occlusive', 'voiced'],
      commonality: 1,
    },
    {
      sound: 'ŋ',
      transcriptions: ['ng'],
      classifiers: ['consonant', 'nasal', 'velar', 'voiced'],
      commonality: 1,
    },
    {
      sound: 'p',
      transcriptions: ['p'],
      classifiers: ['bilabial', 'consonant', 'plosive', 'voiceless'],
      commonality: 1,
    },
    {
      sound: 'q',
      transcriptions: ['q'],
      classifiers: ['consonant', 'plosive', 'uvular', 'voiceless'],
      commonality: 1,
    },
    {
      sound: 'ɹ',
      transcriptions: ['r'],
      classifiers: ['consonant', 'liquid', 'rhotic'],
      commonality: 1,
    },
    {
      sound: 'r',
      transcriptions: ['rr'],
      classifiers: ['alveolar', 'consonant', 'trill', 'voiced'],
      commonality: 1,
    },
    {
      sound: 's',
      transcriptions: ['s', 'c'],
      classifiers: ['consonant', 'coronal', 'fricative', 'voiceless'],
      commonality: 1,
    },
    {
      sound: 'ʃ',
      transcriptions: ['sh'],
      classifiers: ['consonant', 'fricative', 'sibilant'],
      commonality: 1,
    },
    {
      sound: 'ʒ',
      transcriptions: ['si', 'zh'],
      classifiers: ['consonant', 'fricative', 'palato-alveolar', 'sibilant'],
      commonality: 1,
    },
    {
      sound: 'ɾ',
      transcriptions: ['tt'],
      classifiers: ['alveolar', 'consonant', 'voiced', 'tap'],
      commonality: 1,
    },
    {
      sound: 'ɽ',
      transcriptions: ['dd'],
      classifiers: ['alveolar', 'consonant', 'voiced', 'tap'],
      commonality: 1,
    },
    {
      sound: 't',
      transcriptions: ['t'],
      classifiers: ['consonant', 'dental', 'plosive', 'voiceless'],
      commonality: 1,
    },
    {
      sound: 'ts',
      transcriptions: ['ts', 'tsu'],
      classifiers: ['affricate', 'alveolar', 'consonant', 'fricative', 'voiceless'],
      commonality: 1,
    },
    {
      sound: 'θ',
      transcriptions: ['th'],
      classifiers: ['consonant', 'fricative', 'voiceless'],
      commonality: 1,
    },
    {
      sound: 'ð',
      transcriptions: ['th'],
      classifiers: ['consonant', 'fricative', 'voiced'],
      commonality: 1,
    },
    {
      sound: 'v',
      transcriptions: ['v'],
      classifiers: ['consonant', 'fricative', 'labiodental', 'voiced'],
      commonality: 1,
    },
    {
      sound: 'w',
      transcriptions: ['w'],
      classifiers: ['approximant', 'consonant', 'velar', 'voiced'],
      commonality: 1,
    },
    {
      sound: 'x',
      transcriptions: ['ch', 'k'],
      classifiers: ['consonant', 'fricative', 'velar', 'voiceless'],
      commonality: 1,
    },
    {
      sound: 'y',
      transcriptions: ['y'],
      classifiers: ['approximant', 'consonant', 'palatal', 'voiced'],
      commonality: 1,
    },
    {
      sound: 'z',
      transcriptions: ['z', 'x'],
      classifiers: ['aveolar', 'consonant', 'fricative', 'voiced'],
      commonality: 1,
    },
    {
      sound: 'ə',
      transcriptions: ['a'],
      classifiers: ['central', 'unrounded', 'vowel'],
      commonality: 1,
    },
    {
      sound: 'e',
      transcriptions: ['ay', 'e'],
      classifiers: ['close-mid', 'front', 'unrounded', 'vowel'],
      commonality: 1,
    },
    {
      sound: 'aɪ',
      transcriptions: ['ai', 'y', 'ie', 'igh'],
      classifiers: ['vowel'],
      commonality: 1,
    },
    { sound: 'aʊ', transcriptions: ['ou'], classifiers: ['vowel'], commonality: 1 },
    {
      sound: 'æ',
      transcriptions: ['a'],
      classifiers: ['front', 'unrounded', 'vowel'],
      commonality: 1,
    },
    {
      sound: 'ɔ',
      transcriptions: ['o'],
      classifiers: ['back', 'unrounded', 'vowel'],
      commonality: 1,
    },
    {
      sound: 'a',
      transcriptions: ['a'],
      classifiers: ['open', 'front', 'unrounded', 'vowel'],
      commonality: 1,
    },
    {
      sound: 'ɒ',
      transcriptions: ['ough', 'a', 'o'],
      classifiers: ['back', 'open', 'rounded', 'vowel'],
      commonality: 1,
    },
    {
      sound: 'ɛ',
      transcriptions: ['e'],
      classifiers: ['front', 'unrounded', 'vowel'],
      commonality: 1,
    },
    {
      sound: 'o',
      transcriptions: ['aw'],
      classifiers: ['close-mid', 'back', 'unrounded', 'vowel'],
      commonality: 1,
    },
    {
      sound: 'ɪ',
      transcriptions: ['i'],
      classifiers: ['front', 'unrounded', 'vowel'],
      commonality: 1,
    },
    {
      sound: 'ʌ',
      transcriptions: ['u', 'oo'],
      classifiers: ['back', 'open-mid', 'unrounded', 'vowel'],
      commonality: 1,
    },
    {
      sound: 'ʊ',
      transcriptions: ['u', 'oo'],
      classifiers: ['near-close', 'near-back', 'rounded', 'vowel'],
      commonality: 1,
    },
    {
      sound: 'i',
      transcriptions: ['i', 'ee'],
      classifiers: ['close', 'front', 'unrounded', 'vowel'],
      commonality: 1,
    },
    { sound: 'ɔɪ', transcriptions: ['oi', 'oy'], classifiers: ['vowel'], commonality: 1 },
    {
      sound: 'u',
      transcriptions: ['u', 'oo'],
      classifiers: ['close', 'back', 'rounded', 'vowel'],
      commonality: 1,
    },
  ];
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
