"use strict";

export default class PersonalityTrait {
  name: string;
  score: number;
  descriptor: string;
  positiveDescriptor: string;
  negativeDescriptor: string;

  constructor(name: string, negativeDescriptor: string, positiveDescriptor: string) {
    this.name = name;
    this.score = 0;
    this.descriptor = "";
    this.negativeDescriptor = negativeDescriptor;
    this.positiveDescriptor = positiveDescriptor;
  }
}
