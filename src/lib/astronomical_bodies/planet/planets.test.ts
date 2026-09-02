import { expect, describe, it } from 'vitest';
import { RNG } from '@ironarachne/rng';
import { generatePlanet, getDefaultPlanetGenerationConfig } from './planets';
import { getPlanetClassificationByName, getPlanetClassifications } from './planet_classifications';

function generate(seed: string) {
  const config = getDefaultPlanetGenerationConfig(new RNG(seed));
  return generatePlanet(config);
}

function classificationOf(planet: { classification: string }) {
  return getPlanetClassificationByName(planet.classification.replace(/ planet$/, ''));
}

describe('getDefaultPlanetGenerationConfig', () => {
  it('offers the full classification table', () => {
    expect(
      getDefaultPlanetGenerationConfig(new RNG('default')).possible_classifications,
    ).toHaveLength(getPlanetClassifications().length);
  });

  it('defaults the star temperature to the Sun', () => {
    expect(getDefaultPlanetGenerationConfig(new RNG('default')).star_temperature).toBe(5773);
  });

  it('defaults the rings, starport and habitable chances', () => {
    const config = getDefaultPlanetGenerationConfig(new RNG('default'));

    expect(config.rings_chance).toBe(5);
    expect(config.starport_chance).toBe(85);
    expect(config.habitable_chance).toBe(60);
  });

  it('carries the RNG it was handed', () => {
    const rng = new RNG('carried');
    expect(getDefaultPlanetGenerationConfig(rng).rng).toBe(rng);
  });
});

describe('generatePlanet', () => {
  it('is deterministic for a given seed', () => {
    expect(generate('terra')).toEqual(generate('terra'));
  });

  it('produces different planets for different seeds', () => {
    const names = new Set(Array.from({ length: 10 }, (_, index) => generate(`vary-${index}`).name));

    expect(names.size).toBeGreaterThan(1);
  });

  it('names the planet', () => {
    expect(generate('named').name).toBeTruthy();
  });

  it('labels the classification with a trailing "planet"', () => {
    const names = getPlanetClassifications().map((entry) => `${entry.name} planet`);

    for (let index = 0; index < 20; index++) {
      expect(names).toContain(generate(`class-${index}`).classification);
    }
  });

  it('keeps radius, mass, orbital distance and period inside the classification range', () => {
    for (let index = 0; index < 20; index++) {
      const planet = generate(`ranges-${index}`);
      const classification = classificationOf(planet);

      expect(planet.radius, planet.classification).toBeGreaterThanOrEqual(
        classification.radius_min,
      );
      expect(planet.radius, planet.classification).toBeLessThanOrEqual(classification.radius_max);
      expect(planet.mass, planet.classification).toBeGreaterThanOrEqual(classification.mass_min);
      expect(planet.mass, planet.classification).toBeLessThanOrEqual(classification.mass_max);
      expect(planet.orbital_distance, planet.classification).toBeGreaterThanOrEqual(
        classification.orbital_distance_min,
      );
      expect(planet.orbital_distance, planet.classification).toBeLessThanOrEqual(
        classification.orbital_distance_max,
      );
      expect(planet.orbital_period, planet.classification).toBeGreaterThanOrEqual(
        classification.orbital_period_min,
      );
      expect(planet.orbital_period, planet.classification).toBeLessThanOrEqual(
        classification.orbital_period_max,
      );
    }
  });

  it('takes its atmosphere flag from the classification', () => {
    for (let index = 0; index < 20; index++) {
      const planet = generate(`atmosphere-${index}`);

      expect(planet.has_atmosphere, planet.classification).toBe(
        classificationOf(planet).has_atmosphere,
      );
    }
  });

  it('gives an airless planet no surface pressure, whatever the classification range says', () => {
    let checked = 0;

    for (let index = 0; index < 60; index++) {
      const planet = generate(`airless-${index}`);

      if (!planet.has_atmosphere) {
        expect(planet.surface_pressure, planet.classification).toBe(0);
        checked++;
      }
    }

    expect(checked).toBeGreaterThan(0);
  });

  it('gives an atmospheric planet a pressure inside the classification range', () => {
    let checked = 0;

    for (let index = 0; index < 40; index++) {
      const planet = generate(`pressure-${index}`);

      if (planet.has_atmosphere) {
        const classification = classificationOf(planet);

        expect(planet.surface_pressure, planet.classification).toBeGreaterThanOrEqual(
          classification.surface_pressure_min,
        );
        expect(planet.surface_pressure, planet.classification).toBeLessThanOrEqual(
          classification.surface_pressure_max,
        );
        checked++;
      }
    }

    expect(checked).toBeGreaterThan(0);
  });

  it('describes the planet', () => {
    for (let index = 0; index < 10; index++) {
      const planet = generate(`describe-${index}`);

      expect(planet.description, `describe-${index}`).toBeTruthy();
      expect(planet.description, `describe-${index}`).not.toContain('undefined');
    }
  });

  it('gives a planet no luminosity of its own', () => {
    expect(generate('dark').luminosity).toBe(0);
  });

  it('keeps the axis of rotation within a full turn', () => {
    for (let index = 0; index < 20; index++) {
      const planet = generate(`axis-${index}`);

      expect(planet.axis_of_rotation).toBeGreaterThanOrEqual(0);
      expect(planet.axis_of_rotation).toBeLessThanOrEqual(360);
    }
  });

  it('gives a rotation period between 16 and 36 hours', () => {
    for (let index = 0; index < 20; index++) {
      const planet = generate(`rotation-${index}`);

      expect(planet.rotation_period).toBeGreaterThanOrEqual(16);
      expect(planet.rotation_period).toBeLessThanOrEqual(36);
    }
  });

  it('gives positive mass, radius and gravity', () => {
    for (let index = 0; index < 20; index++) {
      const planet = generate(`positive-${index}`);

      expect(planet.mass, `positive-${index}`).toBeGreaterThan(0);
      expect(planet.radius, `positive-${index}`).toBeGreaterThan(0);
      expect(planet.gravity, `positive-${index}`).toBeGreaterThan(0);
    }
  });

  it('gives an albedo between 0 and 1', () => {
    for (let index = 0; index < 20; index++) {
      const planet = generate(`albedo-${index}`);

      expect(planet.albedo, `albedo-${index}`).toBeGreaterThanOrEqual(0);
      expect(planet.albedo, `albedo-${index}`).toBeLessThanOrEqual(1);
    }
  });

  it('never gives rings when the chance is zero', () => {
    for (let index = 0; index < 20; index++) {
      const config = getDefaultPlanetGenerationConfig(new RNG(`norings-${index}`));
      config.rings_chance = 0;

      expect(generatePlanet(config).has_ring_system).toBe(false);
    }
  });

  it('always gives rings when the chance is certain', () => {
    for (let index = 0; index < 20; index++) {
      const config = getDefaultPlanetGenerationConfig(new RNG(`rings-${index}`));
      config.rings_chance = 101;

      expect(generatePlanet(config).has_ring_system).toBe(true);
    }
  });

  it('honours a config narrowed to a single classification', () => {
    const config = getDefaultPlanetGenerationConfig(new RNG('narrow'));
    config.possible_classifications = [getPlanetClassificationByName('arid')];

    expect(generatePlanet(config).classification).toBe('arid planet');
  });

  it('makes a planet hotter around a hotter star', () => {
    const cool = getDefaultPlanetGenerationConfig(new RNG('temperature'));
    cool.star_temperature = 3000;
    cool.possible_classifications = [getPlanetClassificationByName('arid')];

    const hot = getDefaultPlanetGenerationConfig(new RNG('temperature'));
    hot.star_temperature = 30000;
    hot.possible_classifications = [getPlanetClassificationByName('arid')];

    expect(generatePlanet(hot).surface_temperature).toBeGreaterThan(
      generatePlanet(cool).surface_temperature,
    );
  });
});
