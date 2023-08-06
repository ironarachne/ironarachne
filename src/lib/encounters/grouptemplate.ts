"use strict";

import Archetype from "../archetypes/archetype.js";
import MobFilter from "../mobs/filter.js";

export default class EncounterGroupTemplate {
  name: string;
  threatLevel: number;
  isSentient: boolean;
  archetypes: Archetype[];
  filter: MobFilter;
  minNumber: number;
  maxNumber: number;

  constructor(
    name: string,
    threatLevel: number,
    isSentient: boolean,
    archetypes: Archetype[],
    filter: MobFilter,
    minNumber: number,
    maxNumber: number,
  ) {
    this.name = name;
    this.threatLevel = threatLevel;
    this.isSentient = isSentient;
    this.archetypes = archetypes;
    this.filter = filter;
    this.minNumber = minNumber;
    this.maxNumber = maxNumber;
  }
}
