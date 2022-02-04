"use strict";

export default class Realm {
  name: string;
  description: string;
  personalityTraits: string[];
  appearanceTraits: string[];

  constructor(name: string, description: string, personalityTraits: string[], appearanceTraits: any[]) {
    this.name = name;
    this.description = description;
    this.personalityTraits = personalityTraits;
    this.appearanceTraits = appearanceTraits;
  }
}
