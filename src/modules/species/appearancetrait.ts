"use strict";

export default class SpeciesAppearanceTrait {
  name: string;
  descriptionTemplate: string;
  options: string[];
  description: string;

  constructor(name: string, descriptionTemplate: string, options: string[]) {
    this.name = name;
    this.descriptionTemplate = descriptionTemplate;
    this.options = options;
    this.description = "";
  }
}
