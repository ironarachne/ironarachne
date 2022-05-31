'use strict';

import type StatBlock from '../statblock';

export default class Creature {
  name: string;
  pluralName: string;
  description: string;
  abilities: string[];
  statBlock: StatBlock;
  tags: string[];

  constructor(
    name: string,
    pluralName: string,
    description: string,
    abilities: string[],
    tags: string[],
  ) {
    this.name = name;
    this.pluralName = pluralName;
    this.description = description;
    this.abilities = abilities;
    this.tags = tags;
  }
}
