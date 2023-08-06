"use strict";

import MobGroup from "../mobs/group.js";

export default class Encounter {
  groups: MobGroup[];
  totalThreatLevel: number;

  constructor(groups: MobGroup[]) {
    this.groups = groups;

    this.totalThreatLevel = 0;

    for (let i = 0; i < this.groups.length; i++) {
      for (let j = 0; j < this.groups[i].mobs.length; j++) {
        this.totalThreatLevel += this.groups[i].mobs[j].threatLevel;
      }
    }
  }
}
