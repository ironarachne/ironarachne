import type { Lexicon, Word } from './language_types.js';

export type LexiconTranslationIndex = {
  meaningKeyToWord: Map<string, Word>;
  nounWords: Word[];
  verbWords: Word[];
  articleWords: Word[];
  pronounWords: Word[];
};

export function buildLexiconTranslationIndex(lexicon: Lexicon): LexiconTranslationIndex {
  const meaningKeyToWord = new Map<string, Word>();
  const nounWords: Word[] = [];
  const verbWords: Word[] = [];
  const articleWords: Word[] = [];
  const pronounWords: Word[] = [];

  for (const word of lexicon.words) {
    const key = meaningKey(word.speechPart, word.meaning);
    if (!meaningKeyToWord.has(key)) {
      meaningKeyToWord.set(key, word);
    }
    if (word.speechPart === 'noun') {
      nounWords.push(word);
    } else if (word.speechPart === 'verb') {
      verbWords.push(word);
    } else if (word.speechPart === 'article') {
      articleWords.push(word);
    } else if (word.speechPart === 'pronoun') {
      pronounWords.push(word);
    }
  }

  return { meaningKeyToWord, nounWords, verbWords, articleWords, pronounWords };
}

export function lookupWordByMeaning(
  index: LexiconTranslationIndex,
  speechPart: string,
  meaning: string,
): Word | undefined {
  return index.meaningKeyToWord.get(meaningKey(speechPart, meaning));
}

export function meaningKey(speechPart: string, meaning: string): string {
  return `${speechPart.toLowerCase()}:${meaning.toLowerCase()}`;
}
