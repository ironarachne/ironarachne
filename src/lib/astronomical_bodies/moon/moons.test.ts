import { expect, describe, it } from 'vitest';
import { RNG } from '@ironarachne/rng';
import {
  generateMoon,
  getDefaultMoonGenerationConfig,
  getNumberOfMoonsForParent,
  getRotationPeriod,
} from './moons';
import {
  getMoonClassificationByName,
  getStandardMoonClassifications,
} from './moon_classifications';
import type { AstronomicalBody } from '../astronomical_bodies';

function generate(seed: string) {
  const config = getDefaultMoonGenerationConfig(new RNG('base-seed'));
  config.rng = new RNG(seed);
  return generateMoon(config);
}

function body(overrides: Partial<AstronomicalBody> = {}): AstronomicalBody {
  return {
    name: 'Parent',
    description: '',
    albedo: 0.3,
    axis_of_rotation: 0,
    classification: 'terrestrial planet',
    gravity: 9.8,
    has_atmosphere: true,
    has_ring_system: false,
    luminosity: 0,
    mass: 5.972,
    orbital_distance: 1,
    orbital_period: 365,
    radius: 6371,
    rotation_period: 24,
    surface_pressure: 1,
    surface_temperature: 288,
    ...overrides,
  };
}

describe('getDefaultMoonGenerationConfig', () => {
  it('defaults to the standard classifications', () => {
    expect(
      getDefaultMoonGenerationConfig(new RNG('base-seed')).possible_classifications.map(
        (c) => c.name,
      ),
    ).toEqual(getStandardMoonClassifications().map((c) => c.name));
  });

  it('defaults the parent body to Earth', () => {
    const config = getDefaultMoonGenerationConfig(new RNG('base-seed'));

    expect(config.parent_mass).toBe(5.972);
    expect(config.parent_radius).toBe(6371);
    expect(config.parent_orbital_distance).toBe(1);
  });

  it('defaults the star temperature to the Sun', () => {
    expect(getDefaultMoonGenerationConfig(new RNG('base-seed')).star_temperature).toBe(5778);
  });

  it('supplies an RNG', () => {
    expect(getDefaultMoonGenerationConfig(new RNG('base-seed')).rng).toBeInstanceOf(RNG);
  });
});

describe('generateMoon', () => {
  it('is deterministic for a given seed', () => {
    expect(generate('luna')).toEqual(generate('luna'));
  });

  it('produces different moons for different seeds', () => {
    const names = new Set(Array.from({ length: 10 }, (_, index) => generate(`vary-${index}`).name));

    expect(names.size).toBeGreaterThan(1);
  });

  it('names the moon', () => {
    expect(generate('named').name).toBeTruthy();
  });

  it('labels the classification with a trailing "moon"', () => {
    const names = getStandardMoonClassifications().map((entry) => `${entry.name} moon`);

    for (let index = 0; index < 20; index++) {
      expect(names).toContain(generate(`class-${index}`).classification);
    }
  });

  it('never gives a moon a ring system', () => {
    for (let index = 0; index < 10; index++) {
      expect(generate(`rings-${index}`).has_ring_system).toBe(false);
    }
  });

  it('gives a moon no luminosity of its own', () => {
    expect(generate('dark').luminosity).toBe(0);
  });

  it('keeps the axis of rotation within a full turn', () => {
    for (let index = 0; index < 20; index++) {
      const moon = generate(`axis-${index}`);

      expect(moon.axis_of_rotation, `axis-${index}`).toBeGreaterThanOrEqual(0);
      expect(moon.axis_of_rotation, `axis-${index}`).toBeLessThanOrEqual(360);
    }
  });

  it('gives an airless moon no surface pressure', () => {
    let checked = 0;

    for (let index = 0; index < 40; index++) {
      const moon = generate(`airless-${index}`);

      if (!moon.has_atmosphere) {
        expect(moon.surface_pressure, moon.classification).toBe(0);
        checked++;
      }
    }

    expect(checked).toBeGreaterThan(0);
  });

  it('gives positive mass, radius and gravity', () => {
    for (let index = 0; index < 20; index++) {
      const moon = generate(`positive-${index}`);

      expect(moon.mass, `positive-${index}`).toBeGreaterThan(0);
      expect(moon.radius, `positive-${index}`).toBeGreaterThan(0);
      expect(moon.gravity, `positive-${index}`).toBeGreaterThan(0);
    }
  });

  it('scales a moon up with a larger parent body', () => {
    const small = getDefaultMoonGenerationConfig(new RNG('base-seed'));
    small.rng = new RNG('scale');
    small.possible_classifications = [getMoonClassificationByName('rocky')];

    const large = getDefaultMoonGenerationConfig(new RNG('base-seed'));
    large.rng = new RNG('scale');
    large.possible_classifications = [getMoonClassificationByName('rocky')];
    large.parent_radius = 6371 * 10;
    large.parent_mass = 5.972 * 10;

    expect(generateMoon(large).radius).toBeGreaterThan(generateMoon(small).radius);
  });

  it('scales orbital distance with the parent distance from the star', () => {
    const near = getDefaultMoonGenerationConfig(new RNG('base-seed'));
    near.rng = new RNG('orbit');
    near.possible_classifications = [getMoonClassificationByName('rocky')];

    const far = getDefaultMoonGenerationConfig(new RNG('base-seed'));
    far.rng = new RNG('orbit');
    far.possible_classifications = [getMoonClassificationByName('rocky')];
    far.parent_orbital_distance = 10;

    expect(generateMoon(far).orbital_distance).toBeGreaterThan(generateMoon(near).orbital_distance);
  });

  it('describes the moon', () => {
    for (let index = 0; index < 10; index++) {
      const moon = generate(`describe-${index}`);

      expect(moon.description, `describe-${index}`).toBeTruthy();
      expect(moon.description, `describe-${index}`).not.toContain('undefined');
    }
  });

  it('honours a config narrowed to a single classification', () => {
    const config = getDefaultMoonGenerationConfig(new RNG('base-seed'));
    config.rng = new RNG('narrow');
    config.possible_classifications = [getMoonClassificationByName('icy')];

    expect(generateMoon(config).classification).toBe('icy moon');
  });
});

describe('getNumberOfMoonsForParent', () => {
  it('gives a gas giant between 5 and 20 moons', () => {
    for (let index = 0; index < 20; index++) {
      const count = getNumberOfMoonsForParent(
        body({ classification: 'gas giant planet' }),
        new RNG(`giant-${index}`),
      );

      expect(count).toBeGreaterThanOrEqual(5);
      expect(count).toBeLessThanOrEqual(20);
    }
  });

  it('gives any other body between 1 and 5 moons', () => {
    for (let index = 0; index < 20; index++) {
      const count = getNumberOfMoonsForParent(body(), new RNG(`rocky-${index}`));

      expect(count).toBeGreaterThanOrEqual(1);
      expect(count).toBeLessThanOrEqual(5);
    }
  });

  it('is deterministic for a given seed', () => {
    expect(getNumberOfMoonsForParent(body(), new RNG('same'))).toBe(
      getNumberOfMoonsForParent(body(), new RNG('same')),
    );
  });

  it('matches gas giants anywhere in the classification string', () => {
    const count = getNumberOfMoonsForParent(
      body({ classification: 'cold gas giant planet' }),
      new RNG('substring'),
    );

    expect(count).toBeGreaterThanOrEqual(5);
  });
});

describe('getRotationPeriod', () => {
  it('tidally locks a close moon, matching its orbital period', () => {
    expect(getRotationPeriod(30, 0.05, new RNG('close'))).toBe(30);
  });

  it('tidally locks a moon exactly at the threshold', () => {
    expect(getRotationPeriod(30, 0.1, new RNG('threshold'))).toBe(30);
  });

  it('leaves a distant moon unlocked, with a period at or above its orbit', () => {
    for (let index = 0; index < 20; index++) {
      const period = getRotationPeriod(30, 0.5, new RNG(`far-${index}`));

      expect(period).toBeGreaterThanOrEqual(30);
      expect(period).toBeLessThanOrEqual(60);
    }
  });

  it('is deterministic for a given seed', () => {
    expect(getRotationPeriod(30, 0.5, new RNG('same'))).toBe(
      getRotationPeriod(30, 0.5, new RNG('same')),
    );
  });
});
