import { describe, expect, it } from 'vitest';
import { generateEncounter } from './encounter_generation';
import { getAllFantasyEncounterTemplates } from './encounter_templates';

describe('getAllFantasyEncounterTemplates', () => {
  it('returns a non-empty list without throwing', () => {
    const templates = getAllFantasyEncounterTemplates();
    expect(templates.length).toBeGreaterThan(0);
    for (const t of templates) {
      expect(t.name).toBeTruthy();
      expect(t.groupTemplates.length).toBeGreaterThan(0);
      expect(Array.isArray(t.tags)).toBe(true);
    }
  });
});

describe('generateEncounter', () => {
  it('generates each fantasy encounter template without throwing', () => {
    const templates = getAllFantasyEncounterTemplates();
    for (let i = 0; i < templates.length; i++) {
      const template = templates[i];
      const encounter = generateEncounter(`test-enc-${i}`, {
        possibleTemplates: [template],
      });
      expect(encounter.name).toBe(template.name);
      expect(encounter.groups.length).toBe(template.groupTemplates.length);
      for (const group of encounter.groups) {
        expect(group.mobs.length).toBeGreaterThan(0);
      }
    }
  });
});
