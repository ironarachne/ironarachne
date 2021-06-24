"use strict";

import * as RND from "../random";

export class Relationship {
  strength: number;
  target: string;

  constructor(strength: number, target: string) {
    this.strength = strength;
    this.target = target;
  }
}

export function getRandomVerbForStrength(strength: number) {
  let verbs = [
    ["hates", "despises", "loathes", "can't stand", "fears"],
    ["dislikes", "distrusts", "mistrusts", "is suspicious of", "envies"],
    ["likes", "enjoys", "is entertained by"],
    ["loves", "adores", "is enamored of"],
  ];

  return RND.item(verbs[strength]);
}
