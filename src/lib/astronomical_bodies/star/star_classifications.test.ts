import { describe, it, expect } from 'vitest';
import {
  getLuminosityClasses,
  getSpectralClasses,
  getStarClassificationByName,
  getStarClassificationBySpec,
  getStarClassifications,
  searchStarClassificationsByName,
  sortStarClassificationsByName,
} from './star_classifications';
import type { StarClassification } from './stars';

const classifications = getStarClassifications();

describe('getLuminosityClasses', () => {
  it('returns the eight Yerkes luminosity classes', () => {
    expect(getLuminosityClasses().map((entry) => entry.name)).toEqual([
      '0',
      'I',
      'II',
      'III',
      'IV',
      'V',
      'VI',
      'VII',
    ]);
  });

  it('gives every class a description and a positive commonality', () => {
    for (const entry of getLuminosityClasses()) {
      expect(entry.description, entry.name).toBeTruthy();
      expect(entry.commonality, entry.name).toBeGreaterThan(0);
    }
  });

  it('gives every class ranges where the minimum does not exceed the maximum', () => {
    for (const entry of getLuminosityClasses()) {
      expect(entry.min_mass, entry.name).toBeLessThanOrEqual(entry.max_mass);
      expect(entry.min_radius, entry.name).toBeLessThanOrEqual(entry.max_radius);
      expect(entry.min_luminosity, entry.name).toBeLessThanOrEqual(entry.max_luminosity);
    }
  });

  it('makes main sequence the most common class, as the real sky has it', () => {
    const byCommonality = [...getLuminosityClasses()].sort((a, b) => b.commonality - a.commonality);

    expect(byCommonality[0].description).toBe('main sequence');
  });
});

describe('getSpectralClasses', () => {
  it('returns the seven OBAFGKM classes', () => {
    expect(getSpectralClasses().map((entry) => entry.spectral_class)).toEqual([
      'O',
      'B',
      'A',
      'F',
      'G',
      'K',
      'M',
    ]);
  });

  it('gives every class a colour name and a positive commonality', () => {
    for (const entry of getSpectralClasses()) {
      expect(entry.name, entry.spectral_class).toBeTruthy();
      expect(entry.commonality, entry.spectral_class).toBeGreaterThan(0);
    }
  });

  it('gives every class a temperature range where the minimum does not exceed the maximum', () => {
    for (const entry of getSpectralClasses()) {
      expect(entry.min_temperature, entry.spectral_class).toBeLessThanOrEqual(
        entry.max_temperature,
      );
    }
  });

  it('orders the classes from hottest to coolest', () => {
    const temperatures = getSpectralClasses().map((entry) => entry.min_temperature);

    expect(temperatures).toEqual([...temperatures].sort((a, b) => b - a));
  });

  it('makes M the most common class, as the real sky has it', () => {
    const byCommonality = [...getSpectralClasses()].sort((a, b) => b.commonality - a.commonality);

    expect(byCommonality[0].spectral_class).toBe('M');
  });
});

describe('getStarClassifications', () => {
  it('builds ten subdivisions per luminosity and spectral class pairing', () => {
    expect(classifications).toHaveLength(
      getLuminosityClasses().length * getSpectralClasses().length * 10,
    );
  });

  it('names every classification uniquely', () => {
    const names = classifications.map((entry) => entry.name);

    expect(new Set(names).size).toBe(names.length);
  });

  it('returns them sorted by name, which the binary search depends on', () => {
    const names = classifications.map((entry) => entry.name);

    expect(names).toEqual([...names].sort((a, b) => a.localeCompare(b)));
  });

  it('names each entry as spectral class, subdivision, then luminosity class', () => {
    const luminosityNames = getLuminosityClasses().map((entry) => entry.name);

    for (const entry of classifications) {
      const match = /^([OBAFGKM])([0-9])(.+)$/.exec(entry.name);

      expect(match, entry.name).not.toBeNull();
      expect(luminosityNames, entry.name).toContain(match![3]);
    }
  });

  it('gives every entry a positive commonality', () => {
    for (const entry of classifications) {
      expect(entry.commonality, entry.name).toBeGreaterThan(0);
    }
  });

  it('gives every entry ranges where the minimum does not exceed the maximum', () => {
    for (const entry of classifications) {
      expect(entry.min_temperature, entry.name).toBeLessThanOrEqual(entry.max_temperature);
      expect(entry.min_mass, entry.name).toBeLessThanOrEqual(entry.max_mass);
      expect(entry.min_radius, entry.name).toBeLessThanOrEqual(entry.max_radius);
      expect(entry.min_luminosity, entry.name).toBeLessThanOrEqual(entry.max_luminosity);
    }
  });

  it('carries a luminosity class, spectral class and description on every entry', () => {
    for (const entry of classifications) {
      expect(entry.luminosity_class, entry.name).toBeTruthy();
      expect(entry.spectral_class, entry.name).toBeTruthy();
      expect(entry.description, entry.name).toBeTruthy();
    }
  });

  it('is deterministic, returning the same table each call', () => {
    expect(getStarClassifications().map((entry) => entry.name)).toEqual(
      classifications.map((entry) => entry.name),
    );
  });
});

describe('sortStarClassificationsByName', () => {
  it('orders entries by name', () => {
    const unsorted: StarClassification[] = [
      { ...classifications[5], name: 'zeta' },
      { ...classifications[0], name: 'alpha' },
      { ...classifications[1], name: 'mu' },
    ];

    expect(sortStarClassificationsByName(unsorted).map((entry) => entry.name)).toEqual([
      'alpha',
      'mu',
      'zeta',
    ]);
  });

  it('handles an empty list', () => {
    expect(sortStarClassificationsByName([])).toEqual([]);
  });
});

describe('getStarClassificationByName', () => {
  it('returns the classification with that name', () => {
    expect(getStarClassificationByName('B3VII').name).toBe('B3VII');
  });

  it('finds the first and last entries in the table', () => {
    expect(getStarClassificationByName(classifications[0].name).name).toBe(classifications[0].name);
    expect(getStarClassificationByName(classifications.at(-1)!.name).name).toBe(
      classifications.at(-1)!.name,
    );
  });

  it('throws when no classification matches', () => {
    expect(() => getStarClassificationByName('Z9X')).toThrow(
      'Failed to find star classification with name Z9X',
    );
  });

  it('matches names case-sensitively', () => {
    expect(() => getStarClassificationByName('b3vii')).toThrow(
      /Failed to find star classification with name/,
    );
  });
});

describe('searchStarClassificationsByName', () => {
  it('finds every entry in the sorted table', () => {
    for (const entry of classifications) {
      expect(searchStarClassificationsByName(entry.name, classifications)[0].name).toBe(entry.name);
    }
  });

  it('returns a single-entry array', () => {
    expect(searchStarClassificationsByName(classifications[3].name, classifications)).toHaveLength(
      1,
    );
  });

  it('agrees with the linear lookup', () => {
    const target = classifications[42].name;

    expect(searchStarClassificationsByName(target, classifications)[0]).toEqual(
      getStarClassificationByName(target),
    );
  });

  it('throws when no classification matches', () => {
    expect(() => searchStarClassificationsByName('Z9X', classifications)).toThrow(
      'Failed to find star classification with name Z9X',
    );
  });

  it('throws when the table is empty', () => {
    expect(() => searchStarClassificationsByName('G2V', [])).toThrow(
      'Failed to find star classification with name G2V',
    );
  });
});

describe('getStarClassificationBySpec', () => {
  it('returns a classification whose ranges contain the given specification', () => {
    const target = classifications[100];
    const found = getStarClassificationBySpec(
      target.min_temperature,
      target.min_luminosity,
      target.min_mass,
      target.min_radius,
    );

    expect(found.min_temperature).toBeLessThanOrEqual(target.min_temperature);
    expect(found.max_temperature).toBeGreaterThanOrEqual(target.min_temperature);
    expect(found.min_mass).toBeLessThanOrEqual(target.min_mass);
    expect(found.max_mass).toBeGreaterThanOrEqual(target.min_mass);
    expect(found.min_radius).toBeLessThanOrEqual(target.min_radius);
    expect(found.max_radius).toBeGreaterThanOrEqual(target.min_radius);
  });

  it('throws when nothing matches the specification', () => {
    expect(() => getStarClassificationBySpec(1, 1, 1, 1)).toThrow(
      /Failed to find star classification with temperature 1, luminosity 1, mass 1, and radius 1/,
    );
  });

  it('throws for a temperature beyond every class', () => {
    expect(() => getStarClassificationBySpec(1e9, 1, 1, 1)).toThrow(
      /Failed to find star classification/,
    );
  });
});
