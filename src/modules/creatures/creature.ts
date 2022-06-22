'use strict';

import type Item from '../equipment/item';
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
  carried: Item[];
  creatureTypes: string[];
  tags: string[];
  threatLevel: number;

  constructor(
    name: string,
    pluralName: string,
    description: string,
    abilities: string[],
    environments: string[],
    behaviors: string[],
    creatureTypes: string[],
    tags: string[],
    threatLevel: number,
  ) {
    this.name = name;
    this.pluralName = pluralName;
    this.description = description;
    this.summary = '';
    this.abilities = abilities;
    this.environments = environments;
    this.behaviors = behaviors;
    this.creatureTypes = creatureTypes;
    this.carried = [];
    this.tags = tags;
    this.threatLevel = threatLevel;
  }
}
