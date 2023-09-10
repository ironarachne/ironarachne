import type Archetype from "./archetype.js";

export const blank: Archetype = {
  name: "",
  abilities: [],
  tags: [],
  threatLevel: 0,
  itemGenerators: [],
};

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
    let totalThreatLevel = getTotalThreatLevel(archetypes[i]);

    if (
      totalThreatLevel >= minThreatLevel && totalThreatLevel <= maxThreatLevel
    ) {
      result.push(archetypes[i]);
    }
  }

  return result;
}

export function getTotalThreatLevel(archetype: Archetype): number {
  let totalThreatLevel = archetype.threatLevel;
  for (let i = 0; i < archetype.abilities.length; i++) {
    totalThreatLevel += archetype.abilities[i].threatLevel;
  }

  return totalThreatLevel;
}
