"use strict";

import {Gender} from "../gender";

export class Species {
  name: string;
  pluralName: string;
  adjective: string;
  commonality: number;
  traits: AppearanceTrait[];
  genders: Gender[];
  constructor(name: string, pluralName: string, adjective: string, commonality: number, traits: AppearanceTrait[], genders: Gender[]) {
    this.name = name;
    this.pluralName = pluralName;
    this.adjective = adjective;
    this.commonality = commonality;
    this.traits = traits;
    this.genders = genders;
  }
}

export class AppearanceTrait {
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
