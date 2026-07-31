import { describe, expect, it } from 'vitest';
import type { Character } from '$lib/characters';
import type { Mob } from '$lib/mobs';
import { generateEncounter, generateEncounterGroup } from './encounter_generation';
import { getAllFantasyEncounterTemplates } from './encounter_templates';
import { getGroupTemplateByName } from './encounter_group_templates';
import type { EncounterGenerationConfig } from './encounter_types';

// These templates are all isSentient, so every mob is a Character. Mob itself does not carry a
// species; the concrete Character and Creature types do.
const speciesOf = (mob: Mob) => (mob as Character).species;

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

describe('generateEncounter with forceUniformSpecies', () => {
  const sentientTemplates = getAllFantasyEncounterTemplates().filter((template) =>
    template.groupTemplates.every((group) => group.isSentient),
  );

  it('has at least one all-sentient template to work with', () => {
    expect(sentientTemplates.length).toBeGreaterThan(0);
  });

  it('generates without throwing when uniform species is forced', () => {
    for (let i = 0; i < sentientTemplates.length; i++) {
      const encounter = generateEncounter(`uniform-${i}`, {
        possibleTemplates: [sentientTemplates[i]],
        forceUniformSpecies: true,
      });

      expect(encounter.groups.length).toBe(sentientTemplates[i].groupTemplates.length);
      for (const group of encounter.groups) {
        expect(group.mobs.length).toBeGreaterThan(0);
      }
    }
  });

  // Uniform means one species *family*, not one species name. Sub-species carry the base name as
  // a tag — "deep gnome" is tagged both "deep gnome" and "gnome" — so an override of "gnome"
  // legitimately admits both. Species mutators then rename members again ("skeletal leonin"), so
  // the family tag is the only thing that survives the whole pipeline.
  it('draws every mob from a single species family', () => {
    for (let i = 0; i < sentientTemplates.length; i++) {
      const config: EncounterGenerationConfig = {
        possibleTemplates: [sentientTemplates[i]],
        forceUniformSpecies: true,
      };
      const encounter = generateEncounter(`uniform-species-${i}`, config);
      const family = config.speciesOverride!.name;

      for (const group of encounter.groups) {
        for (const mob of group.mobs) {
          expect(speciesOf(mob).tags).toContain(family);
        }
      }
    }
  });

  it('admits a sub-species under its parent’s name', () => {
    const config: EncounterGenerationConfig = {
      possibleTemplates: [sentientTemplates[0]],
      forceUniformSpecies: true,
    };

    generateEncounter('subspecies', config);

    expect(config.speciesOverride).toBeDefined();
  });

  it('records the chosen species back onto the config', () => {
    const config: EncounterGenerationConfig = {
      possibleTemplates: [sentientTemplates[0]],
      forceUniformSpecies: true,
    };

    generateEncounter('uniform-writeback', config);

    expect(config).toHaveProperty('speciesOverride');
  });

  it('leaves an explicit species override in place', () => {
    const first = generateEncounter('override-source', {
      possibleTemplates: [sentientTemplates[0]],
      forceUniformSpecies: true,
    });
    const chosen = speciesOf(first.groups[0].mobs[0]);

    const encounter = generateEncounter('override-applied', {
      possibleTemplates: [sentientTemplates[0]],
      forceUniformSpecies: true,
      speciesOverride: chosen,
    });

    for (const group of encounter.groups) {
      for (const mob of group.mobs) {
        expect(speciesOf(mob).name).toBe(chosen.name);
      }
    }
  });

  it('is reproducible from a seed', () => {
    const build = () =>
      generateEncounter('uniform-determinism', {
        possibleTemplates: [sentientTemplates[0]],
        forceUniformSpecies: true,
      });

    expect(JSON.parse(JSON.stringify(build()))).toEqual(JSON.parse(JSON.stringify(build())));
  });
});

describe('generateEncounterGroup', () => {
  it('honours the template’s count range', () => {
    const template = getAllFantasyEncounterTemplates()[0].groupTemplates[0];

    for (let i = 0; i < 20; i++) {
      const group = generateEncounterGroup(`count-${i}`, template);

      expect(group.mobs.length).toBeGreaterThanOrEqual(template.minCount);
      expect(group.mobs.length).toBeLessThanOrEqual(template.maxCount);
    }
  });

  it('tags the group from its species and archetype', () => {
    const template = getAllFantasyEncounterTemplates()[0].groupTemplates[0];
    const group = generateEncounterGroup('tags', template);

    expect(Array.isArray(group.tags)).toBe(true);
    expect(group.tags.length).toBeGreaterThan(0);
  });
});

describe('getGroupTemplateByName', () => {
  it('finds a template by name', () => {
    const template = getAllFantasyEncounterTemplates()[0].groupTemplates[0];

    expect(getGroupTemplateByName(template.name).name).toBe(template.name);
  });

  it('throws for a name that does not exist', () => {
    expect(() => getGroupTemplateByName('no-such-group-template')).toThrow(/not found/);
  });
});
