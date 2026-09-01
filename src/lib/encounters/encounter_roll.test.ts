import { describe, expect, it } from 'vitest';

import type { Creature } from '$lib/creatures';

import { getAllFantasyEncounterTemplates } from './encounter_templates.js';
import {
  readEncounterGeneratorConfig,
  resolveEncounterTemplates,
  rollEncounter,
  rollEncounterSnapshot,
} from './encounter_roll.js';

describe('rollEncounter', () => {
  /** Requirement 2.2. */
  it('gives the same encounter for the same seed and settings', () => {
    expect(rollEncounter('a-fixed-seed', {})).toEqual(rollEncounter('a-fixed-seed', {}));
    expect(rollEncounter('a-fixed-seed', { forceUniformSpecies: true })).toEqual(
      rollEncounter('a-fixed-seed', { forceUniformSpecies: true }),
    );
  });

  it('gives a different encounter for a different seed', () => {
    const seeds = ['one', 'two', 'three', 'four', 'five'].map((seed) =>
      JSON.stringify(rollEncounter(seed, {})),
    );

    expect(new Set(seeds).size).toBeGreaterThan(1);
  });

  it('draws from the named template when one is given', () => {
    for (let i = 0; i < 5; i += 1) {
      expect(rollEncounter(`named-${i}`, { templateName: 'group of bandits' }).name).toBe(
        'group of bandits',
      );
    }
  });

  it('makes every group share a species when asked to', () => {
    const encounter = rollEncounter('uniform', {
      templateName: 'group of bandits',
      forceUniformSpecies: true,
    });
    const names = new Set(
      encounter.groups.flatMap((group) => group.mobs.map((mob) => (mob as Creature).species.name)),
    );

    expect(names.size).toBe(1);
  });

  it('rolls a snapshot from the same seed', () => {
    const snapshot = rollEncounterSnapshot('reroll-seed', { templateName: 'pack of ghouls' });

    expect(snapshot.name).toBe('pack of ghouls');
    expect(snapshot.groups.length).toBeGreaterThan(0);
    expect(snapshot.groups[0].mobs[0].mobKind).toBeDefined();
  });
});

describe('resolveEncounterTemplates', () => {
  it('returns the whole table when nothing was named', () => {
    expect(resolveEncounterTemplates(undefined)).toEqual(getAllFantasyEncounterTemplates());
  });

  it('returns the one named', () => {
    const templates = resolveEncounterTemplates('lone mage');

    expect(templates).toHaveLength(1);
    expect(templates[0].name).toBe('lone mage');
  });

  /** A template this build no longer has is the page's own "any", not a throw. */
  it('falls back to the whole table for a name this build does not have', () => {
    expect(resolveEncounterTemplates('a template that never was')).toEqual(
      getAllFantasyEncounterTemplates(),
    );
  });
});

describe('readEncounterGeneratorConfig', () => {
  it('reads the two settings the page has', () => {
    expect(
      readEncounterGeneratorConfig({ templateName: 'lone mage', forceUniformSpecies: true }),
    ).toEqual({ templateName: 'lone mage', forceUniformSpecies: true });
  });

  it('drops what it does not recognise rather than coercing it', () => {
    expect(
      readEncounterGeneratorConfig({ templateName: 3, forceUniformSpecies: 'yes', other: 1 }),
    ).toEqual({});
    expect(readEncounterGeneratorConfig({ templateName: '' })).toEqual({});
  });
});
