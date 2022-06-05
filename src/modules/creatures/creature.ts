'use strict';

import type StatBlock from '../statblock';

export default class Creature {
  name: string;
  pluralName: string;
  description: string;
  summary: string;
  abilities: string[];
  statBlock: StatBlock;
  environments: string[];
  behaviors: string[];
  tags: string[];
  // TODO: Add threat level

  constructor(
    name: string,
    pluralName: string,
    description: string,
    abilities: string[],
    environments: string[],
    behaviors: string[],
    tags: string[],
  ) {
    this.name = name;
    this.pluralName = pluralName;
    this.description = description;
    this.summary = '';
    this.abilities = abilities;
    this.environments = environments;
    this.behaviors = behaviors;
    this.tags = tags;
  }
}