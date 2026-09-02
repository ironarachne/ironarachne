import { describe, expect, it } from 'vitest';

import { homePlanetRegionOf, homeSystemRegionOf } from './star_nation';
import {
  readStarNationGeneratorConfig,
  rollStarNation,
  rollStarNationSnapshot,
  STAR_NATION_MAX_PLANET_COUNT,
  starNationPreviewSeed,
} from './star_nation_roll';

describe('readStarNationGeneratorConfig', () => {
  it('reads a planet count the page offers', () => {
    expect(readStarNationGeneratorConfig({ planetCount: 4 })).toEqual({ planetCount: 4 });
    expect(readStarNationGeneratorConfig({ planetCount: STAR_NATION_MAX_PLANET_COUNT })).toEqual({
      planetCount: STAR_NATION_MAX_PLANET_COUNT,
    });
  });

  it('drops a planet count it does not recognise rather than coercing it', () => {
    expect(readStarNationGeneratorConfig({})).toEqual({});
    expect(readStarNationGeneratorConfig({ planetCount: '4' })).toEqual({});
    expect(readStarNationGeneratorConfig({ planetCount: 0 })).toEqual({});
    expect(readStarNationGeneratorConfig({ planetCount: 2.5 })).toEqual({});
    expect(
      readStarNationGeneratorConfig({ planetCount: STAR_NATION_MAX_PLANET_COUNT + 1 }),
    ).toEqual({});
  });
});

describe('rollStarNation', () => {
  /** Requirement 2.2. */
  it('gives the same nation for the same seed and settings', () => {
    expect(rollStarNation('a-fixed-seed', { planetCount: 5 })).toEqual(
      rollStarNation('a-fixed-seed', { planetCount: 5 }),
    );
    expect(rollStarNation('a-fixed-seed')).toEqual(rollStarNation('a-fixed-seed'));
  });

  it('gives a different nation for a different seed', () => {
    const seeds = ['one', 'two', 'three', 'four', 'five'].map((seed) =>
      JSON.stringify(rollStarNation(seed)),
    );

    expect(new Set(seeds).size).toBeGreaterThan(1);
  });

  it('honours the planet count', () => {
    expect(rollStarNation('count', { planetCount: 1 }).homeSystem.planets).toHaveLength(1);
    expect(rollStarNation('count', { planetCount: 12 }).homeSystem.planets).toHaveLength(12);
  });

  it('lets the seed choose a planet count between one and twelve', () => {
    for (const seed of ['a', 'b', 'c', 'd', 'e', 'f']) {
      const count = rollStarNation(seed).homeSystem.planets.length;
      expect(count).toBeGreaterThanOrEqual(1);
      expect(count).toBeLessThanOrEqual(12);
    }
  });

  it('rolls a spacefaring civilization', () => {
    for (const seed of ['a', 'b', 'c', 'd', 'e', 'f']) {
      const level = rollStarNation(seed).civilization.technology_level;
      expect(level).toBeGreaterThanOrEqual(7);
      expect(level).toBeLessThanOrEqual(9);
    }
  });

  it('names the regions after the home system and the home planet, held by the nation', () => {
    const nation = rollStarNation('regions', { planetCount: 3 });
    const system = homeSystemRegionOf(nation);
    const planet = homePlanetRegionOf(nation);

    expect(system?.name).toBe(nation.homeSystem.name);
    expect(planet?.name).toBe(nation.homeSystem.planets[nation.homePlanetIndex].name);
    expect(system?.controlling_civilization).toBe(nation.civilization.name);
    expect(planet?.controlling_civilization).toBe(nation.civilization.name);
  });

  it('picks a home planet inside the system and a populated count within it', () => {
    for (const seed of ['a', 'b', 'c', 'd', 'e', 'f']) {
      const nation = rollStarNation(seed);
      expect(nation.homePlanetIndex).toBeGreaterThanOrEqual(0);
      expect(nation.homePlanetIndex).toBeLessThan(nation.homeSystem.planets.length);
      expect(nation.homeSystemPopulatedPlanets).toBeGreaterThanOrEqual(1);
      expect(nation.homeSystemPopulatedPlanets).toBeLessThanOrEqual(
        nation.homeSystem.planets.length,
      );
    }
  });

  it('gives a nation beyond technology level 7 more systems than its home, and no others fewer', () => {
    const seeds = Array.from({ length: 40 }, (_, index) => `territory-${index}`);
    const nations = seeds.map((seed) => rollStarNation(seed));
    const expansive = nations.filter((nation) => nation.civilization.technology_level > 7);
    const homebound = nations.filter((nation) => nation.civilization.technology_level <= 7);

    expect(expansive.length).toBeGreaterThan(0);
    expect(homebound.length).toBeGreaterThan(0);
    for (const nation of expansive) {
      expect(nation.systemsControlled).toBeGreaterThan(1);
      expect(nation.populatedPlanets).toBeGreaterThanOrEqual(nation.homeSystemPopulatedPlanets);
    }
    for (const nation of homebound) {
      expect(nation.systemsControlled).toBe(1);
      expect(nation.populatedPlanets).toBe(nation.homeSystemPopulatedPlanets);
    }
  });

  it('describes the civilization from its final population', () => {
    const nation = rollStarNation('described');

    expect(nation.civilization.description).toContain(nation.civilization.name);
    expect(homePlanetRegionOf(nation)?.population).toBe(
      Math.round(nation.civilization.population / nation.populatedPlanets),
    );
  });

  it('rolls a snapshot from the same seed', () => {
    expect(rollStarNationSnapshot('reroll-seed', { planetCount: 2 }).name).toBe(
      rollStarNation('reroll-seed', { planetCount: 2 }).civilization.name,
    );
  });

  it('derives the preview seed from the page seed', () => {
    expect(starNationPreviewSeed('abc')).toBe(starNationPreviewSeed('abc'));
    expect(starNationPreviewSeed('abc')).not.toBe(starNationPreviewSeed('abd'));
  });
});
