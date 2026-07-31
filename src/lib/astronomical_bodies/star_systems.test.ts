import { expect, describe, it } from 'vitest';
import { RNG } from '@ironarachne/rng';
import { generateStarSystem, getDefaultStarSystemGeneratorConfig } from './star_systems';
import { getPlanetClassifications } from './planet/planet_classifications';
import { getStarClassifications } from './star/star_classifications';

function configFor(seed: string, overrides: Record<string, unknown> = {}) {
  return {
    star_count: 1,
    planet_count: 3,
    star_classifications: getStarClassifications(),
    planet_classifications: getPlanetClassifications(),
    rng: new RNG(seed),
    ...overrides,
  };
}

describe('getDefaultStarSystemGeneratorConfig', () => {
  it('defaults to a single star', () => {
    expect(getDefaultStarSystemGeneratorConfig().star_count).toBe(1);
  });

  it('defaults to between one and twelve planets', () => {
    for (let index = 0; index < 20; index++) {
      const config = getDefaultStarSystemGeneratorConfig();

      expect(config.planet_count).toBeGreaterThanOrEqual(1);
      expect(config.planet_count).toBeLessThanOrEqual(12);
    }
  });

  it('offers the full star and planet classification tables', () => {
    const config = getDefaultStarSystemGeneratorConfig();

    expect(config.star_classifications).toHaveLength(getStarClassifications().length);
    expect(config.planet_classifications).toHaveLength(getPlanetClassifications().length);
  });

  it('supplies an RNG', () => {
    expect(getDefaultStarSystemGeneratorConfig().rng).toBeInstanceOf(RNG);
  });
});

describe('generateStarSystem', () => {
  it('is deterministic for a given seed', () => {
    expect(generateStarSystem(configFor('sol'))).toEqual(generateStarSystem(configFor('sol')));
  });

  it('produces different systems for different seeds', () => {
    const names = new Set(
      Array.from({ length: 10 }, (_, index) => generateStarSystem(configFor(`vary-${index}`)).name),
    );

    expect(names.size).toBeGreaterThan(1);
  });

  it('generates the requested number of stars and planets', () => {
    const system = generateStarSystem(configFor('counts', { star_count: 2, planet_count: 5 }));

    expect(system.stars).toHaveLength(2);
    expect(system.planets).toHaveLength(5);
  });

  it('numbers the stars of a multi-star system, without repeating the name', () => {
    const system = generateStarSystem(configFor('multi', { star_count: 3, planet_count: 1 }));

    system.stars.forEach((star, position) => {
      expect(star.name).toMatch(new RegExp(` ${position + 1}$`));

      // The stem must not be the generated name written twice — a `+=` here once produced
      // names like "KomKom 1".
      const stem = star.name.slice(0, -` ${position + 1}`.length);
      const firstHalf = stem.slice(0, Math.floor(stem.length / 2));

      expect(stem).toBeTruthy();
      expect(stem, star.name).not.toBe(firstHalf + firstHalf);
    });
  });

  it('leaves a single star unnumbered', () => {
    const system = generateStarSystem(configFor('single', { star_count: 1, planet_count: 1 }));

    expect(system.stars[0].name).not.toMatch(/ \d+$/);
  });

  it('gives the stars of a multi-star system distinct names', () => {
    const names = generateStarSystem(
      configFor('distinct', { star_count: 4, planet_count: 1 }),
    ).stars.map((star) => star.name);

    expect(new Set(names).size).toBe(names.length);
  });

  it('reports its own star and planet counts', () => {
    const system = generateStarSystem(configFor('reported', { star_count: 1, planet_count: 4 }));

    expect(system.star_count).toBe(system.stars.length);
    expect(system.planet_count).toBe(system.planets.length);
  });

  it('names the system after its first star', () => {
    const system = generateStarSystem(configFor('named'));

    expect(system.name).toBe(system.stars[0].name);
  });

  it('describes the system by its contents', () => {
    const system = generateStarSystem(configFor('described', { star_count: 1, planet_count: 3 }));

    expect(system.description).toBe('A star system with 1 stars and 3 planets.');
  });

  it('orders planets by orbital distance, innermost first', () => {
    for (let index = 0; index < 10; index++) {
      const distances = generateStarSystem(
        configFor(`orbit-${index}`, { planet_count: 8 }),
      ).planets.map((planet) => planet.orbital_distance);

      expect(distances).toEqual([...distances].sort((a, b) => a - b));
    }
  });

  it('generates a system with no planets when none are asked for', () => {
    const system = generateStarSystem(configFor('barren', { planet_count: 0 }));

    expect(system.planets).toEqual([]);
    expect(system.planet_count).toBe(0);
    expect(system.stars).toHaveLength(1);
  });

  it('names most planets after the system with a Roman numeral', () => {
    const system = generateStarSystem(configFor('roman', { planet_count: 8 }));
    const numbered = system.planets.filter((planet) => planet.name.startsWith(`${system.name} `));

    expect(numbered.length).toBeGreaterThan(0);
    for (const planet of numbered) {
      expect(planet.name).toMatch(new RegExp(`^${system.name} [IVXLC]+$`));
    }
  });

  it('leaves inhabited planets with their own generated name', () => {
    let foundOwnName = false;

    for (let index = 0; index < 30 && !foundOwnName; index++) {
      const system = generateStarSystem(configFor(`inhabited-${index}`, { planet_count: 10 }));
      foundOwnName = system.planets.some((planet) => !planet.name.startsWith(`${system.name} `));
    }

    expect(foundOwnName).toBe(true);
  });

  it('gives every star and planet a name and a classification', () => {
    const system = generateStarSystem(configFor('complete', { star_count: 2, planet_count: 6 }));

    for (const bodyOfSystem of [...system.stars, ...system.planets]) {
      expect(bodyOfSystem.name).toBeTruthy();
      expect(bodyOfSystem.classification).toBeTruthy();
    }
  });

  it('honours a config narrowed to a single star classification', () => {
    const single = getStarClassifications().filter((entry) => entry.name === 'G2V');
    const system = generateStarSystem(
      configFor('narrow', { star_classifications: single, planet_count: 1 }),
    );

    expect(system.stars[0].classification).toBe('G2V');
  });
});
