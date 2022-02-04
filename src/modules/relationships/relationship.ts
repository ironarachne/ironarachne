'use strict';

export default class Relationship {
  noun: string;
  target: number;
  verb: string;
  strength: number;

  constructor(noun: string, verb: string, target: number, strength: number) {
    this.noun = noun;
    this.verb = verb;
    this.target = target;
    this.strength = strength;
  }
}
