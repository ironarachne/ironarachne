"use strict";

export default class PhysicalTrait {
  name: string;
  description: string;
  category: string;
  tags: string[];

  constructor(name: string, description: string, category: string, tags: string[]) {
    this.name = name;
    this.description = description;
    this.category = category;
    this.tags = tags;
  }
}
