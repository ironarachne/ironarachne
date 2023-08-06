"use strict";

import Archetype from "./archetype.js";

export function byName(name: string, archetypes: Archetype[]): Archetype {
  for (let i = 0; i < archetypes.length; i++) {
    if (archetypes[i].name == name) {
      return archetypes[i];
    }
  }

  throw new Error(`Failed to find archetype "${name}"`);
}

export function byTag(tag: string, archetypes: Archetype[]): Archetype[] {
  let result = [];

  for (let i = 0; i < archetypes.length; i++) {
    if (archetypes[i].tags.includes(tag)) {
      result.push(archetypes[i]);
    }
  }

  return result;
}

export function byThreatRange(
  minThreatLevel: number,
  maxThreatLevel: number,
  archetypes: Archetype[],
): Archetype[] {
  let result = [];

  for (let i = 0; i < archetypes.length; i++) {
    if (
      archetypes[i].threatLevel >= minThreatLevel
      && archetypes[i].threatLevel <= maxThreatLevel
    ) {
      result.push(archetypes[i]);
    }
  }

  return result;
}
