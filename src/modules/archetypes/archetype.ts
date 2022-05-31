'use strict';

export default class Archetype {
  name: string;
  abilities: string[];
  tags: string[];

  constructor(name: string, abilities: string[], tags: string[]) {
    this.name = name;
    this.abilities = abilities;
    this.tags = tags;
  }
}
