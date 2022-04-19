'use strict';

export default class PhonemeCollection {
  consonants: string[];
  vowels: string[];
  sibilants: string[];
  liquids: string[];
  fricatives: string[];

  constructor(c: string[], v: string[], s: string[], l: string[], f: string[]) {
    this.consonants = c;
    this.vowels = v;
    this.sibilants = s;
    this.liquids = l;
    this.fricatives = f;
  }
}
