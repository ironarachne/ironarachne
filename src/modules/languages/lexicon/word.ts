'use strict';

import Conjugation from "./conjugation";

export default class Word {
  root: string;
  speechPart: string;
  meaning: string;
  conjugations: Conjugation[];

  constructor(root: string, speechPart: string, meaning: string, conjugations: Conjugation[]) {
    this.root = root;
    this.speechPart = speechPart;
    this.meaning = meaning;
    this.conjugations = conjugations;
  }
}
