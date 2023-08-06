"use strict";

import EncounterGroupTemplate from "./grouptemplate.js";

export default class EncounterTemplate {
  name: string;
  threatLevel: number;
  groupTemplates: EncounterGroupTemplate[];
  tags: string[];
  commonality: number;

  constructor(
    name: string,
    threatLevel: number,
    groupTemplates: EncounterGroupTemplate[],
    tags: string[],
    commonality: number,
  ) {
    this.name = name;
    this.threatLevel = threatLevel;
    this.groupTemplates = groupTemplates;
    this.tags = tags;
    this.commonality = commonality;
  }
}
