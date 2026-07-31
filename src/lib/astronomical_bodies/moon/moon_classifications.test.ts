import { expect, describe, it } from 'vitest';
import {
  getMoonClassificationByName,
  getMoonClassifications,
  getStandardMoonClassifications,
} from './moon_classifications';

const classifications = getMoonClassifications();

describe('getMoonClassifications', () => {
  it('returns a non-empty table', () => {
    expect(classifications.length).toBeGreaterThan(0);
  });

  it('names every classification uniquely', () => {
    const names = classifications.map((entry) => entry.name);

    expect(new Set(names).size).toBe(names.length);
  });

  it('gives every entry a name, a description and a description generator', () => {
    for (const entry of classifications) {
      expect(entry.name, entry.name).toBeTruthy();
      expect(entry.description, entry.name).toBeTruthy();
      expect(typeof entry.getRandomDescription, entry.name).toBe('function');
    }
  });

  it('gives every entry ranges where the minimum does not exceed the maximum', () => {
    for (const entry of classifications) {
      expect(entry.radius_min, entry.name).toBeLessThanOrEqual(entry.radius_max);
      expect(entry.mass_min, entry.name).toBeLessThanOrEqual(entry.mass_max);
      expect(entry.orbital_distance_min, entry.name).toBeLessThanOrEqual(
        entry.orbital_distance_max,
      );
      expect(entry.orbital_period_min, entry.name).toBeLessThanOrEqual(entry.orbital_period_max);
      expect(entry.surface_pressure_min, entry.name).toBeLessThanOrEqual(
        entry.surface_pressure_max,
      );
    }
  });

  it('gives every entry a positive radius, mass and orbital distance', () => {
    for (const entry of classifications) {
      expect(entry.radius_min, entry.name).toBeGreaterThan(0);
      expect(entry.mass_min, entry.name).toBeGreaterThan(0);
      expect(entry.orbital_distance_min, entry.name).toBeGreaterThan(0);
    }
  });

  it('produces a non-empty description for every classification', () => {
    for (const entry of classifications) {
      expect(entry.getRandomDescription(), entry.name).toBeTruthy();
    }
  });

  it('includes the rocky and icy moons', () => {
    const names = classifications.map((entry) => entry.name);

    expect(names).toContain('rocky');
    expect(names).toContain('icy');
  });

  it('returns a fresh table each call', () => {
    const first = getMoonClassifications();
    const originalName = first[0].name;
    first[0].name = 'mutated';

    expect(getMoonClassifications()[0].name).toBe(originalName);
  });
});

describe('getStandardMoonClassifications', () => {
  it('drops the gaseous and volcanic classifications as too rare', () => {
    const names = getStandardMoonClassifications().map((entry) => entry.name);

    expect(names).not.toContain('gaseous');
    expect(names).not.toContain('volcanic');
  });

  it('keeps every other classification', () => {
    const excluded = ['gaseous', 'volcanic'];
    const expected = classifications
      .map((entry) => entry.name)
      .filter((name) => !excluded.includes(name));

    expect(getStandardMoonClassifications().map((entry) => entry.name)).toEqual(expected);
  });

  it('is a strict subset of the full table', () => {
    expect(getStandardMoonClassifications().length).toBeLessThan(classifications.length);
  });

  it('is non-empty, since the generator defaults to it', () => {
    expect(getStandardMoonClassifications().length).toBeGreaterThan(0);
  });
});

describe('getMoonClassificationByName', () => {
  it('returns the classification with that name', () => {
    expect(getMoonClassificationByName('rocky').name).toBe('rocky');
  });

  it('finds every entry in the table', () => {
    for (const entry of classifications) {
      expect(getMoonClassificationByName(entry.name).name).toBe(entry.name);
    }
  });

  it('throws when no classification matches', () => {
    expect(() => getMoonClassificationByName('cheese')).toThrow(
      'Moon classification "cheese" not found.',
    );
  });

  it('matches names case-sensitively', () => {
    expect(() => getMoonClassificationByName('Rocky')).toThrow(
      'Moon classification "Rocky" not found.',
    );
  });

  it('still finds the classifications the standard set excludes', () => {
    expect(getMoonClassificationByName('gaseous').name).toBe('gaseous');
    expect(getMoonClassificationByName('volcanic').name).toBe('volcanic');
  });
});
