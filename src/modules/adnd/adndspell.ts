'use strict';

export default class ADNDSpell {
  name: string;
  casterClass: string;
  level: number;
  tags: string[];

  constructor(name: string, casterClass: string, level: number, tags: string[]) {
    this.name = name;
    this.casterClass = casterClass;
    this.level = level;
    this.tags = tags;
  }
}
