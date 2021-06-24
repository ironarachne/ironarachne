import * as PC from "@/modules/languages/phoneme";
import * as RND from "@/modules/random";
import * as Lexicon from "@/modules/languages/lexicon";

export class Language {
  name: string;
  lexicon: Lexicon.Lexicon;
  phonemes: PC.PhonemeCollection;

  constructor(name: string, phonemes: PC.PhonemeCollection) {
    this.name = name;
    this.phonemes = phonemes;
    this.lexicon = new Lexicon.Lexicon();
  }
}

export function generate() {
  let phonemes = PC.random();

  let name = randomWordRoot(phonemes);

  let language = new Language(name, phonemes);

  for (let i=0;i<language.lexicon.words.length;i++) {
    language.lexicon.words[i].root = randomWordRoot(phonemes);
  }

  return language;
}

function randomMatchingSound(part: string, phonemes: PC.PhonemeCollection) {
  let options = phonemes.consonants;

  if (part === "V") {
    options = phonemes.vowels;
  } else if (part === "S") {
    options = phonemes.sibilants;
  } else if (part === "F") {
    options = phonemes.fricatives;
  } else if (part === "L") {
    options = phonemes.liquids;
  }

  return RND.item(options);
}

function randomWordRoot(phonemes: PC.PhonemeCollection) {
  let wordPattern = randomWordPattern();
  let word = "";

  for (let i=0;i<wordPattern.length;i++) {
    word += PC.soundToSpelling(randomMatchingSound(wordPattern[i], phonemes));
  }

  return word;
}

function randomWordPattern() {
  return RND.item([
    "CVC",
    "VCC",
    "VCCV",
    "CVVC",
    "CVCV",
    "CVS",
    "CVF",
    "CVCS",
    "CVCF",
  ]);
}
