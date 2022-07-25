'use strict';

export default class Word {
  root: string;
  speechPart: string;
  meaning: string;

  constructor(root: string, speechPart: string, meaning: string) {
    this.root = root;
    this.speechPart = speechPart;
    this.meaning = meaning;
  }
}
