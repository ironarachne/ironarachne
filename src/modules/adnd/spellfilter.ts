'use strict';

export default class SpellFilter {
  name: string;
  level: number;
  casterClass: string;
  requiredTags: string[];
  bannedTags: string[];

  constructor(
    name: string = '',
    level: number = -1,
    casterClass: string = '',
    requiredTags: string[] = [],
    bannedTags: string[] = [],
  ) {
    this.name = name;
    this.level = level;
    this.casterClass = casterClass;
    this.requiredTags = requiredTags;
    this.bannedTags = bannedTags;
  }
}
