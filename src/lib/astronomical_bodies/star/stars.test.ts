import { expect, describe, it } from 'vitest';
import { RNG } from '@ironarachne/rng';
import { generateStar, getDefaultStarGeneratorConfig } from './stars';
import { getStarClassificationByName, getStarClassifications } from './star_classifications';

function generate(seed: string) {
  const config = getDefaultStarGeneratorConfig(new RNG(seed));
  return generateStar(config);
}

describe('getDefaultStarGeneratorConfig', () => {
  it('offers the full classification table', () => {
    expect(getDefaultStarGeneratorConfig(new RNG('default')).star_classifications).toHaveLength(
      getStarClassifications().length,
    );
  });

  it('carries the RNG it was handed', () => {
    const rng = new RNG('carried');
    expect(getDefaultStarGeneratorConfig(rng).rng).toBe(rng);
  });
});

describe('generateStar', () => {
  it('is deterministic for a given seed', () => {
    expect(generate('sol')).toEqual(generate('sol'));
  });

  it('produces different stars for different seeds', () => {
    const names = new Set(Array.from({ length: 10 }, (_, index) => generate(`vary-${index}`).name));

    expect(names.size).toBeGreaterThan(1);
  });

  it('names the star', () => {
    expect(generate('named').name).toBeTruthy();
  });

  it('takes its classification from the table', () => {
    const names = new Set(getStarClassifications().map((entry) => entry.name));

    for (let index = 0; index < 20; index++) {
      expect(names).toContain(generate(`class-${index}`).classification);
    }
  });

  it('keeps mass, temperature and luminosity inside the chosen classification range', () => {
    for (let index = 0; index < 20; index++) {
      const star = generate(`ranges-${index}`);
      const classification = getStarClassificationByName(star.classification);

      expect(star.mass, star.classification).toBeGreaterThanOrEqual(classification.min_mass);
      expect(star.mass, star.classification).toBeLessThanOrEqual(classification.max_mass);
      expect(star.surface_temperature, star.classification).toBeGreaterThanOrEqual(
        classification.min_temperature,
      );
      expect(star.surface_temperature, star.classification).toBeLessThanOrEqual(
        classification.max_temperature,
      );
      expect(star.luminosity, star.classification).toBeGreaterThanOrEqual(
        classification.min_luminosity,
      );
      expect(star.luminosity, star.classification).toBeLessThanOrEqual(
        classification.max_luminosity,
      );
    }
  });

  it('reports radius in kilometres, converted from solar radii', () => {
    for (let index = 0; index < 10; index++) {
      const star = generate(`radius-${index}`);
      const classification = getStarClassificationByName(star.classification);

      expect(star.radius).toBeGreaterThanOrEqual(classification.min_radius * 695700);
      expect(star.radius).toBeLessThanOrEqual(classification.max_radius * 695700);
    }
  });

  it('describes the star using its classification description', () => {
    for (let index = 0; index < 10; index++) {
      const star = generate(`describe-${index}`);
      const classification = getStarClassificationByName(star.classification);

      expect(star.description).toContain(classification.description);
      expect(star.description).toMatch(/^This is an? .+ star\.$/);
    }
  });

  it('treats a star as having an atmosphere and no rings', () => {
    const star = generate('atmosphere');

    expect(star.has_atmosphere).toBe(true);
    expect(star.has_ring_system).toBe(false);
  });

  it('leaves the orbital figures at zero, since the star orbits nothing measured here', () => {
    const star = generate('orbit');

    expect(star.orbital_distance).toBe(0);
    expect(star.orbital_period).toBe(0);
  });

  it('keeps the axis of rotation within a full turn', () => {
    for (let index = 0; index < 20; index++) {
      const star = generate(`axis-${index}`);

      expect(star.axis_of_rotation).toBeGreaterThanOrEqual(0);
      expect(star.axis_of_rotation).toBeLessThanOrEqual(360);
    }
  });

  it('gives a rotation period between 15 and 60 hours', () => {
    for (let index = 0; index < 20; index++) {
      const star = generate(`rotation-${index}`);

      expect(star.rotation_period).toBeGreaterThanOrEqual(15);
      expect(star.rotation_period).toBeLessThanOrEqual(60);
    }
  });

  it('derives surface pressure from gravity', () => {
    const star = generate('pressure');

    expect(star.surface_pressure).toBeCloseTo(star.gravity ** 2, 5);
  });

  it('gives positive mass, radius and gravity', () => {
    for (let index = 0; index < 20; index++) {
      const star = generate(`positive-${index}`);

      expect(star.mass, `positive-${index}`).toBeGreaterThan(0);
      expect(star.radius, `positive-${index}`).toBeGreaterThan(0);
      expect(star.gravity, `positive-${index}`).toBeGreaterThan(0);
    }
  });

  it('honours a config narrowed to a single classification', () => {
    const config = getDefaultStarGeneratorConfig(new RNG('narrow'));
    config.star_classifications = [getStarClassificationByName('G2V')];

    expect(generateStar(config).classification).toBe('G2V');
  });
});
