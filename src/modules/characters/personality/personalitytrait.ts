"use strict";

export default class PersonalityTrait {
  name: string;
  opposingTags: string[];
  tags: string[];

  constructor(name: string, opposingTags: string[], tags: string[]) {
    this.name = name;
    this.opposingTags = opposingTags;
    this.tags = tags;
  }
}
