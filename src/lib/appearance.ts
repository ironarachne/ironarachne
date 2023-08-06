"use strict";

export class AppearanceTrait {
  phrase: string;
  bodyPart: string;
  tags: string[];

  constructor(phrase: string, bodyPart: string, tags: string[]) {
    this.phrase = phrase;
    this.bodyPart = bodyPart;
    this.tags = tags;
  }
}

export function getAllTraitsWithTag(traits: AppearanceTrait[], tag: string) {
  const results = [];

  for (let i = 0; i < traits.length; i++) {
    if (traits[i].tags.includes(tag)) {
      results.push(traits[i]);
    }
  }

  return results;
}
