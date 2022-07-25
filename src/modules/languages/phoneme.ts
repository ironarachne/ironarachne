'use strict';

export default class Phoneme {
  sound: string;
  spellings: string[];
  classifiers: string[];
  commonality: number;

  constructor(sound: string, spellings: string[], classifiers: string[], commonality: number) {
    this.sound = sound;
    this.spellings = spellings;
    this.classifiers = classifiers;
    this.commonality = commonality;
  }
}
