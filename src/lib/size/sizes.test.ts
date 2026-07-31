import { describe, expect, it } from 'vitest';
import type AgeCategory from '$lib/age/age_category';
import type SizeGeneratorConfig from './size_generator_config';
import { convertMatrixToSummary, getSizeConfig, type SizeMatrix } from './size_matrix';
import { generate, getHeightRange, getHumanVariant, getWeightRange, humanStandard } from './sizes';

const standard = humanStandard();

function makeConfig(overrides: Partial<SizeGeneratorConfig> = {}): SizeGeneratorConfig {
  return {
    minHeight: 160,
    maxHeight: 180,
    minWeight: 60,
    maxWeight: 80,
    minLength: 0,
    maxLength: 0,
    minMass: 0,
    maxMass: 0,
    ...overrides,
  };
}

describe('humanStandard', () => {
  it('covers both genders', () => {
    expect(standard.map((row) => row.gender)).toEqual(['female', 'male']);
  });

  it('gives each gender the same age categories', () => {
    const [female, male] = standard;

    expect(female.entries.map((entry) => entry.ageCategoryName)).toEqual(
      male.entries.map((entry) => entry.ageCategoryName),
    );
  });

  it('gives every entry a usable range', () => {
    for (const row of standard) {
      for (const entry of row.entries) {
        const config = entry.sizeGeneratorConfig;

        expect(config.minHeight).toBeGreaterThan(0);
        expect(config.maxHeight).toBeGreaterThanOrEqual(config.minHeight);
        expect(config.minWeight).toBeGreaterThan(0);
        expect(config.maxWeight).toBeGreaterThanOrEqual(config.minWeight);
      }
    }
  });

  it('returns a fresh matrix on each call', () => {
    expect(humanStandard()).not.toBe(standard);
    expect(humanStandard()).toEqual(standard);
  });
});

describe('generate', () => {
  it('stays inside the configured ranges', () => {
    const config = makeConfig();

    for (let i = 0; i < 50; i++) {
      const size = generate('seed-' + i, config);

      expect(size.height).toBeGreaterThanOrEqual(config.minHeight);
      expect(size.height).toBeLessThanOrEqual(config.maxHeight);
      expect(size.weight).toBeGreaterThanOrEqual(config.minWeight);
      expect(size.weight).toBeLessThanOrEqual(config.maxWeight);
    }
  });

  it('is reproducible from a seed', () => {
    expect(generate('seed-a', makeConfig())).toEqual(generate('seed-a', makeConfig()));
  });

  it('varies with the seed', () => {
    const heights = new Set(
      ['a', 'b', 'c', 'd', 'e', 'f'].map((seed) => generate(seed, makeConfig()).height),
    );

    expect(heights.size).toBeGreaterThan(1);
  });

  it('returns the single value when a range has no spread', () => {
    const size = generate('seed-a', makeConfig({ minHeight: 170, maxHeight: 170 }));

    expect(size.height).toBe(170);
  });

  it('carries length and mass through', () => {
    const size = generate(
      'seed-a',
      makeConfig({ minLength: 5, maxLength: 5, minMass: 9, maxMass: 9 }),
    );

    expect(size.length).toBe(5);
    expect(size.mass).toBe(9);
  });
});

describe('getHeightRange', () => {
  it('renders both a metric and an imperial expression', () => {
    const range = getHeightRange(makeConfig());

    expect(range).toContain('cm');
    expect(range).toContain('in.');
    expect(range).toMatch(/^.+ \(.+\)$/);
  });

  it('starts from the minimum height', () => {
    expect(getHeightRange(makeConfig({ minHeight: 160 }))).toContain('160 +');
  });

  it('does not throw for a zero-width range', () => {
    expect(() => getHeightRange(makeConfig({ minHeight: 170, maxHeight: 170 }))).not.toThrow();
  });

  it('renders for every entry in the standard matrix', () => {
    for (const row of standard) {
      for (const entry of row.entries) {
        expect(getHeightRange(entry.sizeGeneratorConfig).length).toBeGreaterThan(0);
      }
    }
  });
});

describe('getWeightRange', () => {
  it('renders both a metric and an imperial expression', () => {
    const range = getWeightRange(makeConfig());

    expect(range).toContain('kg');
    expect(range).toContain('lb.');
    expect(range).toMatch(/^.+ \(.+\)$/);
  });

  it('starts from the minimum weight', () => {
    expect(getWeightRange(makeConfig({ minWeight: 60 }))).toContain('60 +');
  });

  it('does not throw for a zero-width range', () => {
    expect(() => getWeightRange(makeConfig({ minWeight: 70, maxWeight: 70 }))).not.toThrow();
  });
});

describe('getHumanVariant', () => {
  it('keeps the shape of the standard matrix', () => {
    const variant = getHumanVariant(1, 1);

    expect(variant.map((row) => row.gender)).toEqual(standard.map((row) => row.gender));
    expect(variant[0].entries.length).toBe(standard[0].entries.length);
  });

  it('leaves sizes unchanged at a modifier of one', () => {
    const variant = getHumanVariant(1, 1);

    for (let i = 0; i < variant.length; i++) {
      for (let j = 0; j < variant[i].entries.length; j++) {
        expect(variant[i].entries[j].sizeGeneratorConfig.minHeight).toBe(
          standard[i].entries[j].sizeGeneratorConfig.minHeight,
        );
      }
    }
  });

  it('scales heights and weights independently', () => {
    const variant = getHumanVariant(2, 0.5);
    const base = standard[0].entries[0].sizeGeneratorConfig;
    const scaled = variant[0].entries[0].sizeGeneratorConfig;

    expect(scaled.minHeight).toBe(Math.round(base.minHeight * 0.5));
    expect(scaled.minWeight).toBe(Math.round(base.minWeight * 2));
  });

  it('renames teenager to young adult', () => {
    const names = getHumanVariant(1, 1)[0].entries.map((entry) => entry.ageCategoryName);

    expect(names).toContain('young adult');
    expect(names).not.toContain('teenager');
  });

  it('leaves length and mass alone', () => {
    const variant = getHumanVariant(3, 3);

    for (const row of variant) {
      for (const entry of row.entries) {
        expect(entry.sizeGeneratorConfig.minLength).toBe(0);
        expect(entry.sizeGeneratorConfig.maxMass).toBe(0);
      }
    }
  });

  it('does not disturb the standard matrix', () => {
    const before = JSON.stringify(humanStandard());

    getHumanVariant(5, 5);

    expect(JSON.stringify(humanStandard())).toBe(before);
  });
});

describe('getSizeConfig', () => {
  it('finds the config for a gender and age category', () => {
    const config = getSizeConfig('female', 'adult', standard);

    expect(config).toEqual(
      standard[0].entries.find((e) => e.ageCategoryName === 'adult')!.sizeGeneratorConfig,
    );
  });

  it('distinguishes the two genders', () => {
    const female = getSizeConfig('female', 'adult', standard);
    const male = getSizeConfig('male', 'adult', standard);

    expect(male.minHeight).not.toBe(female.minHeight);
  });

  it('throws for an unknown gender', () => {
    expect(() => getSizeConfig('other', 'adult', standard)).toThrow(/Failed to find size config/);
  });

  it('throws for an unknown age category', () => {
    expect(() => getSizeConfig('female', 'ancient', standard)).toThrow(
      /Failed to find size config/,
    );
  });
});

describe('convertMatrixToSummary', () => {
  const ageCategories: AgeCategory[] = [
    {
      name: 'adult',
      noun: 'adult',
      minAge: 20,
      maxAge: 59,
      genderedNoun: ['woman', 'man'],
      commonality: 10,
    },
  ];

  it('returns one row per entry for the requested gender', () => {
    const summary = convertMatrixToSummary(standard, ageCategories, 'female');

    expect(summary.length).toBe(standard[0].entries.length);
    for (const row of summary) {
      expect(row.genderName).toBe('female');
    }
  });

  it('returns nothing for a gender the matrix does not have', () => {
    expect(convertMatrixToSummary(standard, ageCategories, 'other')).toEqual([]);
  });

  it('fills in ages from a matching age category', () => {
    const summary = convertMatrixToSummary(standard, ageCategories, 'female');
    const adult = summary.find((row) => row.ageCategoryName === 'adult')!;

    expect(adult.minAge).toBe(20);
    expect(adult.maxAge).toBe(59);
  });

  it('defaults ages to zero when no age category matches', () => {
    const summary = convertMatrixToSummary(standard, ageCategories, 'female');
    const infant = summary.find((row) => row.ageCategoryName === 'infant')!;

    expect(infant.minAge).toBe(0);
    expect(infant.maxAge).toBe(0);
  });

  it('carries the height and weight figures and their rendered ranges', () => {
    const summary = convertMatrixToSummary(standard, ageCategories, 'male');

    for (const row of summary) {
      expect(row.maxHeight).toBeGreaterThanOrEqual(row.minHeight);
      expect(row.maxWeight).toBeGreaterThanOrEqual(row.minWeight);
      expect(row.heightRange).toContain('cm');
      expect(row.weightRange).toContain('kg');
    }
  });

  it('returns nothing for an empty matrix', () => {
    expect(convertMatrixToSummary([] as SizeMatrix, ageCategories, 'female')).toEqual([]);
  });
});
