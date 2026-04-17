import type { Word } from './language_types.js';

export function createWord(speechPart: string, meaning: string): Word {
  return {
    root: '',
    pronunciation: '',
    speechPart,
    meaning,
  };
}
