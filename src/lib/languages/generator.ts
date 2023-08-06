"use strict";

import * as RND from "@ironarachne/rng";
import * as Words from "@ironarachne/words";
import random from "random";
import LanguageGeneratorConfig from "./generatorconfig.js";
import Language from "./language.js";
import Morpheme from "./morpheme.js";
import * as Phonemes from "./phonemes.js";
import PhonemeSet from "./phonemeset.js";

export default class LanguageGenerator {
  config: LanguageGeneratorConfig;

  constructor(config: LanguageGeneratorConfig) {
    this.config = config;
  }

  generate(): Language {
    let phonemeSet = RND.item(this.config.phonemeSets);

    let language = new Language("", phonemeSet);
    language.wordOrder = randomWordOrder();
    language.name = Words.capitalize(
      randomMorpheme(random.int(4, 7), phonemeSet).getTranscription(),
    );

    for (let i = 0; i < language.lexicon.words.length; i++) {
      let morphemeLength = random.int(2, 7);
      if (["article", "pronoun"].includes(language.lexicon.words[i].speechPart)) {
        morphemeLength = random.int(2, 3);
      }
      let morpheme = randomMorpheme(morphemeLength, phonemeSet);
      language.lexicon.words[i].root = morpheme.getTranscription();
      language.lexicon.words[i].pronunciation = morpheme.getPronunciation();
    }

    // TODO: add generation of conjugations

    return language;
  }
}

function randomWordOrder(): string {
  let options = [
    {
      value: "svo",
      commonality: 10,
    },
    {
      value: "sov",
      commonality: 1,
    },
  ];

  let order = RND.weighted(options);

  return order.value;
}

function randomMorpheme(length: number, phonemeSet: PhonemeSet): Morpheme {
  let consonants = Phonemes.getConsonants(phonemeSet.getPhonemes());
  let vowels = Phonemes.getVowels(phonemeSet.getPhonemes());
  let pattern = "";

  for (let i = 0; i < length; i++) {
    if (i == 0 && length == 1) {
      pattern = "v";
    } else {
      let newPart = RND.item(["v", "c"]);
      if (i > 0) {
        let last = pattern[i - 1];
        if (last == "v") {
          newPart = "c";
        } else {
          newPart = "v";
        }
      }
      pattern += newPart;
    }
  }

  let morpheme = new Morpheme();

  for (let i = 0; i < pattern.length; i++) {
    if (pattern[i] == "v") {
      morpheme.phonemes.push(RND.weighted(vowels)); // TODO: make spellings weighted
    } else {
      morpheme.phonemes.push(RND.weighted(consonants)); // TODO: make spellings weighted
    }
  }

  return morpheme;
}
