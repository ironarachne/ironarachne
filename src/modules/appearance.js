"use strict";

export class AppearanceTrait {
  constructor(phrase, bodyPart, tags) {
    this.phrase = phrase;
    this.bodyPart = bodyPart;
    this.tags = tags;
  }
}

export function getAllTraitsWithTag(traits, tag) {
  let results = [];

  for (let i = 0; i < traits.length; i++) {
    if (traits[i].tags.includes(tag)) {
      results.push(traits[i]);
    }
  }

  return results;
}


