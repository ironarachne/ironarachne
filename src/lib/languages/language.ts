import Conjugation from "./conjugation.js";
import Lexicon from "./lexicon.js";
import PhonemeSet from "./phonemeset.js";

export default class Language {
  name: string;
  lexicon: Lexicon;
  phonemeSet: PhonemeSet;
  conjugations: Conjugation[];
  wordOrder: string;

  constructor(name: string, phonemeSet: PhonemeSet) {
    this.name = name;
    this.phonemeSet = phonemeSet;
    this.conjugations = [];
    this.lexicon = new Lexicon();
    this.wordOrder = "";
  }
}
