import Lexicon from './lexicon/lexicon';
import PhonemeCollection from './phonemes/collection';

export default class Language {
  name: string;
  description: string;
  lexicon: Lexicon;
  phonemes: PhonemeCollection;

  constructor(name: string, description: string, phonemes: PhonemeCollection) {
    this.name = name;
    this.description = description;
    this.phonemes = phonemes;
    this.lexicon = new Lexicon();
  }
}
