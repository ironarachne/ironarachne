import type EncounterTemplate from "../encounter_template.js";

export function belowThreatLevel(
  level: number,
  templates: EncounterTemplate[],
): EncounterTemplate[] {
  return inThreatLevelRange(0, level, templates);
}

export function inThreatLevelRange(
  minLevel: number,
  maxLevel: number,
  templates: EncounterTemplate[],
): EncounterTemplate[] {
  let result = [];

  for (let i = 0; i < templates.length; i++) {
    if (templates[i].threatLevel >= minLevel && templates[i].threatLevel <= maxLevel) {
      result.push(templates[i]);
    }
  }

  return result;
}

export function withThreatLevel(
  level: number,
  templates: EncounterTemplate[],
): EncounterTemplate[] {
  return inThreatLevelRange(level, level, templates);
}

export function withTag(tag: string, templates: EncounterTemplate[]): EncounterTemplate[] {
  let result = [];

  for (let i = 0; i < templates.length; i++) {
    if (templates[i].tags.includes(tag)) {
      result.push(templates[i]);
    }
  }

  return result;
}

export function withoutTag(tag: string, templates: EncounterTemplate[]): EncounterTemplate[] {
  let result = [];

  for (let i = 0; i < templates.length; i++) {
    if (!templates[i].tags.includes(tag)) {
      result.push(templates[i]);
    }
  }

  return result;
}
