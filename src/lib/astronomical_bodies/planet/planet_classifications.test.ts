import { expect, describe, it } from 'vitest';
import { RNG } from '@ironarachne/rng';
import {
  getDescriptionFromFeatures,
  getPlanetClassificationByName,
  getPlanetClassifications,
  searchPlanetClassificationByName,
  sortPlanetClassificationsByName,
} from './planet_classifications';
import type { PlanetFeatureSet } from './planet_classifications';
import type { PlanetClassification } from './planets';

const classifications = getPlanetClassifications();

/**
 * Built fresh per call because `getDescriptionFromFeatures` shuffles the array it is handed,
 * in place. Every production caller passes a fresh literal, so this only matters to tests and
 * to any future caller that reuses one.
 */
function featureSets(): PlanetFeatureSet[] {
  return [
    { name: 'storms', options: ['Fierce storms rage.', 'Storms are rare.'] },
    { name: 'oceans', options: ['Vast oceans cover it.', 'Shallow seas dot it.'] },
    { name: 'life', options: ['Life teems here.', 'Nothing lives here.'] },
  ];
}

const features = featureSets();

describe('getDescriptionFromFeatures', () => {
  it('is deterministic for a given seed and an equal input', () => {
    expect(getDescriptionFromFeatures(featureSets(), 2, new RNG('desc'))).toBe(
      getDescriptionFromFeatures(featureSets(), 2, new RNG('desc')),
    );
  });

  it('reorders the array it was given, so callers must not share one', () => {
    const shared = featureSets();
    const before = shared.map((feature) => feature.name);
    let reordered = false;

    // Try several seeds: any one shuffle may land back on the original order.
    for (let index = 0; index < 10 && !reordered; index++) {
      getDescriptionFromFeatures(shared, 3, new RNG(`mutate-${index}`));
      reordered = shared.some((feature, position) => feature.name !== before[position]);
    }

    expect(reordered).toBe(true);
  });

  it('gives a shared array a different result than a fresh one, because of that reordering', () => {
    const shared = featureSets();
    const first = getDescriptionFromFeatures(shared, 2, new RNG('shared'));
    const second = getDescriptionFromFeatures(shared, 2, new RNG('shared'));

    expect(first).not.toBe(second);
    expect(getDescriptionFromFeatures(featureSets(), 2, new RNG('shared'))).toBe(first);
  });

  it('picks one option from each of the requested number of feature sets', () => {
    const description = getDescriptionFromFeatures(featureSets(), 2, new RNG('two'));
    const matched = features.flatMap((feature) =>
      feature.options.filter((option) => description.includes(option)),
    );

    expect(matched).toHaveLength(2);
  });

  it('returns an empty description when no features are requested', () => {
    expect(getDescriptionFromFeatures(featureSets(), 0, new RNG('none'))).toBe('');
  });

  it('never repeats a feature set, since it shuffles and slices', () => {
    for (let index = 0; index < 20; index++) {
      const description = getDescriptionFromFeatures(featureSets(), 3, new RNG(`all-${index}`));
      const usedSets = features.filter((feature) =>
        feature.options.some((option) => description.includes(option)),
      );

      expect(usedSets).toHaveLength(3);
    }
  });

  it('takes every feature set when asked for more than exist', () => {
    const description = getDescriptionFromFeatures(featureSets(), 99, new RNG('over'));
    const usedSets = features.filter((feature) =>
      feature.options.some((option) => description.includes(option)),
    );

    expect(usedSets).toHaveLength(features.length);
  });

  it('returns an empty description when there are no features', () => {
    expect(getDescriptionFromFeatures([], 3, new RNG('empty'))).toBe('');
  });

  it('separates the chosen options with a space', () => {
    expect(getDescriptionFromFeatures(featureSets(), 2, new RNG('spaced'))).toMatch(/ $/);
  });

  it('varies across seeds', () => {
    const descriptions = new Set(
      Array.from({ length: 20 }, (_, index) =>
        getDescriptionFromFeatures(featureSets(), 2, new RNG(`vary-${index}`)),
      ),
    );

    expect(descriptions.size).toBeGreaterThan(1);
  });
});

describe('getPlanetClassifications', () => {
  it('returns a non-empty table', () => {
    expect(classifications.length).toBeGreaterThan(0);
  });

  it('names every classification uniquely', () => {
    const names = classifications.map((entry) => entry.name);

    expect(new Set(names).size).toBe(names.length);
  });

  it('returns them sorted by name, which the binary search depends on', () => {
    const names = classifications.map((entry) => entry.name);

    expect(names).toEqual([...names].sort((a, b) => a.localeCompare(b)));
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

  it('gives every entry a positive radius and mass', () => {
    for (const entry of classifications) {
      expect(entry.radius_min, entry.name).toBeGreaterThan(0);
      expect(entry.mass_min, entry.name).toBeGreaterThan(0);
    }
  });

  it('produces a non-empty description for every classification', () => {
    for (const entry of classifications) {
      expect(entry.getRandomDescription(new RNG(`desc-${entry.name}`)), entry.name).toBeTruthy();
    }
  });

  it('produces a deterministic description for a given seed', () => {
    for (const entry of classifications) {
      expect(entry.getRandomDescription(new RNG('same')), entry.name).toBe(
        entry.getRandomDescription(new RNG('same')),
      );
    }
  });

  it('never leaves an undefined fragment in a description', () => {
    for (const entry of classifications) {
      for (let index = 0; index < 5; index++) {
        expect(entry.getRandomDescription(new RNG(`clean-${index}`)), entry.name).not.toContain(
          'undefined',
        );
      }
    }
  });
});

describe('sortPlanetClassificationsByName', () => {
  it('orders entries by name', () => {
    const unsorted: PlanetClassification[] = [
      { ...classifications[2], name: 'zeta' },
      { ...classifications[0], name: 'alpha' },
      { ...classifications[1], name: 'mu' },
    ];

    expect(sortPlanetClassificationsByName(unsorted).map((entry) => entry.name)).toEqual([
      'alpha',
      'mu',
      'zeta',
    ]);
  });

  it('handles an empty list', () => {
    expect(sortPlanetClassificationsByName([])).toEqual([]);
  });
});

describe('getPlanetClassificationByName', () => {
  it('returns the classification with that name', () => {
    const target = classifications[0].name;

    expect(getPlanetClassificationByName(target).name).toBe(target);
  });

  it('finds every entry in the table', () => {
    for (const entry of classifications) {
      expect(getPlanetClassificationByName(entry.name).name).toBe(entry.name);
    }
  });

  it('throws when no classification matches', () => {
    expect(() => getPlanetClassificationByName('ringworld')).toThrow(
      'Failed to find planet classification with name ringworld',
    );
  });
});

describe('searchPlanetClassificationByName', () => {
  it('finds every entry in the sorted table', () => {
    for (const entry of classifications) {
      expect(searchPlanetClassificationByName(entry.name, classifications).name).toBe(entry.name);
    }
  });

  it('agrees with the linear lookup', () => {
    const target = classifications[1].name;
    const found = searchPlanetClassificationByName(target, classifications);
    const expected = getPlanetClassificationByName(target);

    // Compared field by field: each table call rebuilds the getRandomDescription closures, so
    // two lookups never share function identity.
    expect(found.name).toBe(expected.name);
    expect(found.description).toBe(expected.description);
    expect(found.radius_min).toBe(expected.radius_min);
    expect(found.mass_max).toBe(expected.mass_max);
  });
});
