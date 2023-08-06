"use strict";

import ItemGenerator from "../equipment/itemgenerator.js";

export default class Archetype {
  name: string;
  abilities: string[];
  tags: string[];
  threatLevel: number;
  itemGenerators: ItemGenerator[];

  constructor(
    name: string,
    abilities: string[],
    tags: string[],
    threatLevel: number,
    itemGenerators: ItemGenerator[],
  ) {
    this.name = name;
    this.abilities = abilities;
    this.tags = tags;
    this.threatLevel = threatLevel;
    this.itemGenerators = itemGenerators;
  }
}
