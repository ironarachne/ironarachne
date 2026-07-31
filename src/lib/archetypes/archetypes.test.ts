import { expect, describe, it } from 'vitest';
import { getArchetypeByName } from './archetypes';
import {
  getAllFantasyArchetypes,
  getFantasyCombatArchetypes,
  getFantasyNonCombatArchetypes,
} from './fantasy_archetypes';
import type { Archetype } from './archetype_types';

function makeArchetype(name: string, overrides: Partial<Archetype> = {}): Archetype {
  return {
    name,
    description: `${name} description`,
    basePowerModifier: 0,
    abilities: [],
    actions: [],
    equipmentGenerationConfigs: [],
    tags: [],
    ...overrides,
  };
}

describe('getArchetypeByName', () => {
  const archetypes = [
    makeArchetype('Knight'),
    makeArchetype('Ranger', { basePowerModifier: 2 }),
    makeArchetype('Sage'),
  ];

  it('returns the archetype matching the name', () => {
    expect(getArchetypeByName('Ranger', archetypes)).toBe(archetypes[1]);
  });

  it('matches names case-sensitively', () => {
    expect(() => getArchetypeByName('ranger', archetypes)).toThrow(
      'Archetype with name "ranger" not found.',
    );
  });

  it('throws when no archetype matches', () => {
    expect(() => getArchetypeByName('Bard', archetypes)).toThrow(
      'Archetype with name "Bard" not found.',
    );
  });

  it('throws when the archetype list is empty', () => {
    expect(() => getArchetypeByName('Knight', [])).toThrow(
      'Archetype with name "Knight" not found.',
    );
  });

  it('returns the first match when names are duplicated', () => {
    const duplicated = [
      makeArchetype('Knight', { description: 'first' }),
      makeArchetype('Knight', { description: 'second' }),
    ];

    expect(getArchetypeByName('Knight', duplicated).description).toBe('first');
  });

  it('finds every archetype in the fantasy set by its own name', () => {
    const all = getAllFantasyArchetypes();

    for (const archetype of all) {
      expect(getArchetypeByName(archetype.name, all)).toBe(archetype);
    }
  });
});

describe('getAllFantasyArchetypes', () => {
  it('is the concatenation of the combat and non-combat sets', () => {
    expect(getAllFantasyArchetypes().map((archetype) => archetype.name)).toEqual([
      ...getFantasyCombatArchetypes().map((archetype) => archetype.name),
      ...getFantasyNonCombatArchetypes().map((archetype) => archetype.name),
    ]);
  });

  it('returns archetypes with unique names', () => {
    const names = getAllFantasyArchetypes().map((archetype) => archetype.name);

    expect(new Set(names).size).toBe(names.length);
  });

  it('gives every archetype a name, description and tags', () => {
    for (const archetype of getAllFantasyArchetypes()) {
      expect(archetype.name).toBeTruthy();
      expect(archetype.description).toBeTruthy();
      expect(Array.isArray(archetype.tags)).toBe(true);
    }
  });

  it('returns a fresh array each call so callers cannot mutate the source', () => {
    const first = getAllFantasyArchetypes();
    const originalName = first[0].name;
    first.splice(0, 1);

    expect(getAllFantasyArchetypes()[0].name).toBe(originalName);
  });
});

describe('getFantasyCombatArchetypes', () => {
  it('returns a non-empty set', () => {
    expect(getFantasyCombatArchetypes().length).toBeGreaterThan(0);
  });

  it('equips every archetype, since a combatant needs gear', () => {
    for (const archetype of getFantasyCombatArchetypes()) {
      expect(archetype.equipmentGenerationConfigs.length).toBeGreaterThan(0);
    }
  });

  it('gives every archetype a higher base power modifier than any non-combat one', () => {
    const strongestNonCombat = Math.max(
      ...getFantasyNonCombatArchetypes().map((archetype) => archetype.basePowerModifier),
    );

    for (const archetype of getFantasyCombatArchetypes()) {
      expect(archetype.basePowerModifier).toBeGreaterThan(strongestNonCombat);
    }
  });

  it('gives a caster profile only to archetypes tagged for magic', () => {
    for (const archetype of getFantasyCombatArchetypes()) {
      if (archetype.casterProfile) {
        expect(archetype.abilities.some((ability) => ability.tags.includes('magic'))).toBe(true);
      }
    }
  });
});

describe('getFantasyNonCombatArchetypes', () => {
  it('returns a non-empty set', () => {
    expect(getFantasyNonCombatArchetypes().length).toBeGreaterThan(0);
  });

  it('leaves every archetype without combat actions or equipment', () => {
    for (const archetype of getFantasyNonCombatArchetypes()) {
      expect(archetype.actions).toEqual([]);
      expect(archetype.equipmentGenerationConfigs).toEqual([]);
    }
  });

  it('shares no names with the combat set', () => {
    const combatNames = new Set(getFantasyCombatArchetypes().map((archetype) => archetype.name));

    for (const archetype of getFantasyNonCombatArchetypes()) {
      expect(combatNames.has(archetype.name)).toBe(false);
    }
  });
});
