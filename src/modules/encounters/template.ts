'use strict';

import EncounterGroupTemplate from './grouptemplate';

export default class EncounterTemplate {
  name: string;
  threatLevel: number;
  groupTemplates: EncounterGroupTemplate[];
  tags: string[];

  constructor(
    name: string,
    threatLevel: number,
    groupTemplates: EncounterGroupTemplate[],
    tags: string[],
  ) {
    this.name = name;
    this.threatLevel = threatLevel;
    this.groupTemplates = groupTemplates;
    this.tags = tags;
  }
}
