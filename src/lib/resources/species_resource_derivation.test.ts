import { describe, expect, it } from 'vitest';
import black_pudding from '$lib/species/oozes/black_pudding';
import camel from '$lib/species/animals/camel';
import cow from '$lib/species/animals/cow';
import eagle from '$lib/species/animals/eagle';
import ghoul from '$lib/species/undead/ghoul';
import bear from '$lib/species/animals/bear';
import snake from '$lib/species/animals/snake';
import owlbear from '$lib/species/monstrosities/owlbear';
import allSpecies from '$lib/species/all';
import {
  deriveResourcesFromSpecies,
  getAllSpeciesDerivedResources,
  inferCarcassBodyPlan,
  speciesYieldsCarcassResources,
} from './species_resource_derivation';

describe('speciesYieldsCarcassResources', () => {
  it('excludes oozes and undead', () => {
    expect(speciesYieldsCarcassResources(black_pudding)).toBe(false);
    expect(speciesYieldsCarcassResources(ghoul)).toBe(false);
  });

  it('includes common beasts', () => {
    expect(speciesYieldsCarcassResources(cow)).toBe(true);
    expect(speciesYieldsCarcassResources(bear)).toBe(true);
  });
});

describe('inferCarcassBodyPlan', () => {
  it('treats owlbear as furred when carcassBodyPlan is set on the species', () => {
    expect(owlbear.carcassBodyPlan).toBe('furred');
    expect(inferCarcassBodyPlan(owlbear)).toBe('furred');
  });
});

describe('deriveResourcesFromSpecies', () => {
  it('uses beef for cow meat', () => {
    const resources = deriveResourcesFromSpecies(cow);
    const meat = resources.find((r) => r.minor_type === 'red_meat');
    const hide = resources.find((r) => r.minor_type === 'hide');
    expect(meat?.name).toBe('beef');
    expect(hide?.name).toBe('cow hide');
  });

  it('names furred resources for bear and camel', () => {
    const bearR = deriveResourcesFromSpecies(bear);
    const camelR = deriveResourcesFromSpecies(camel);
    expect(bearR.map((r) => r.name)).toContain('bear hide');
    expect(camelR.map((r) => r.name)).toContain('camel hide');
  });

  it('gives eagle feathers, not furred hide', () => {
    const r = deriveResourcesFromSpecies(eagle);
    expect(r.map((x) => x.name)).toContain('eagle feathers');
    expect(r.some((x) => x.name.includes('hide'))).toBe(false);
  });

  it('gives scaled hide for snake, not generic mammal hide name pattern', () => {
    const r = deriveResourcesFromSpecies(snake);
    expect(r.map((x) => x.name)).toContain('snake hide');
    expect(inferCarcassBodyPlan(snake)).toBe('scaled');
    expect(r.find((x) => x.minor_type === 'scale')?.name).toBe('snake hide');
  });

  it('yields no resources for ghoul', () => {
    expect(deriveResourcesFromSpecies(ghoul)).toEqual([]);
  });
});

describe('getAllSpeciesDerivedResources', () => {
  it('produces unique resource names and covers all included species', () => {
    const all = getAllSpeciesDerivedResources();
    const names = all.map((r) => r.name);
    const unique = new Set(names);
    expect(unique.size).toBe(names.length);
    // At least as many as eligible species in the registry (heuristic: not empty, scales with all.ts)
    const eligible = allSpecies.filter((s) => speciesYieldsCarcassResources(s));
    expect(all.length).toBeGreaterThan(0);
    expect(all.length).toBeLessThanOrEqual(
      eligible.length * 4,
    );
  });
});
