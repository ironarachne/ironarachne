'use strict';

import Archetype from '../archetypes/archetype';

export default class EncounterGroupTemplate {
  name: string;
  threatLevel: number;
  isSentient: boolean;
  archetypes: Archetype[];
  tags: string[];
  excludeTags: string[];
  minNumber: number;
  maxNumber: number;

  constructor(
    name: string,
    threatLevel: number,
    isSentient: boolean,
    archetypes: Archetype[],
    tags: string[],
    excludeTags: string[],
    minNumber: number,
    maxNumber: number,
  ) {
    this.name = name;
    this.threatLevel = threatLevel;
    this.isSentient = isSentient;
    this.archetypes = archetypes;
    this.tags = tags;
    this.excludeTags = excludeTags;
    this.minNumber = minNumber;
    this.maxNumber = maxNumber;
  }
}
