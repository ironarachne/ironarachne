'use strict';

import LexiconGeneratorConfig from "./generatorconfig";
import Lexicon from "./lexicon";
import Word from "./word";
import adjectives from "./words/adjectives";
import adverbs from "./words/adverbs";
import articles from "./words/articles";
import interjections from "./words/interjections";
import nouns from "./words/nouns";
import numbers from "./words/numbers";
import prepositions from "./words/prepositions";
import pronouns from "./words/pronouns";
import questions from "./words/questions";
import verbs from "./words/verbs";

export default class LexiconGenerator {
  config: LexiconGeneratorConfig;

  constructor(config: LexiconGeneratorConfig) {
    this.config = config;
  }

  generate(): Lexicon {
    let lexicon = new Lexicon();

    const adj: string[] = adjectives;

    for (let i = 0; i < adj.length; i++) {
      const word = new Word('', 'adjective', adj[i], []);
      lexicon.words.push(word);
    }

    const adv: string[] = adverbs;

    for (let i = 0; i < adv.length; i++) {
      const word = new Word('', 'adverb', adv[i], []);
      lexicon.words.push(word);
    }

    const art: string[] = articles;

    for (let i = 0; i < art.length; i++) {
      const word = new Word('', 'article', art[i], []);
      lexicon.words.push(word);
    }

    const inter: string[] = interjections;

    for (let i = 0; i < inter.length; i++) {
      const word = new Word('', 'interjection', inter[i], []);
      lexicon.words.push(word);
    }

    const prep: string[] = prepositions;

    for (let i = 0; i < prep.length; i++) {
      const word = new Word('', 'preposition', prep[i], []);
      lexicon.words.push(word);
    }

    const que: string[] = questions;

    for (let i = 0; i < que.length; i++) {
      const word = new Word('', 'question', que[i], []);
      lexicon.words.push(word);
    }

    const ver: string[] = verbs;

    for (let i = 0; i < ver.length; i++) {
      const word = new Word('', 'verb', ver[i], []);
      lexicon.words.push(word);
    }

    const nou: string[] = nouns;

    for (let i = 0; i < nou.length; i++) {
      const word = new Word('', 'noun', nou[i], []);
      lexicon.words.push(word);
    }

    const nm: string[] = numbers;

    for (let i = 0; i < nm.length; i++) {
      const word = new Word('', 'number', nm[i], []);
      lexicon.words.push(word);
    }

    const pro: string[] = pronouns;

    for (let i = 0; i < pro.length; i++) {
      const word = new Word('', 'pronoun', pro[i], []);
      lexicon.words.push(word);
    }

    return lexicon;
  }
}
