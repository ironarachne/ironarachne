import { describe, expect, it, vi } from 'vitest';
import { RNG } from '@ironarachne/rng';
import { generateLandscapeName } from './landscape_names';
import type {
  LandscapeNameContext,
  LandscapeNameInput,
  LandscapeNameStyle,
} from './landscape_name_types';
import type { StoredNameGeneratorPatternSet } from './name_generator_patterns';

const context: LandscapeNameContext = { usedNames: [], recentStyles: [] };
const patterns: StoredNameGeneratorPatternSet = {
  name: 'fixture',
  female: ['DOBBY'],
  male: ['DOBBY'],
  family: ['DOBBY'],
  culture: ['DOBBY'],
  country: ['DOBBY'],
  town: ['DOBBY'],
};
const input: LandscapeNameInput = {
  id: 'test',
  nouns: ['Woods'],
  directions: ['east'],
  culturePatterns: patterns,
};
function forceStyle(style: LandscapeNameStyle, seed = 'style') {
  const rng = new RNG(seed);
  vi.spyOn(rng, 'weighted').mockReturnValue(style);
  return rng;
}

describe('landscape names', () => {
  it('selects a style at the upper RNG boundary after a repeat penalty', () => {
    const rng = new RNG('upper-bound');
    vi.spyOn(rng, 'next').mockReturnValue(0.999999);
    expect(() =>
      generateLandscapeName(
        { ...input, directions: [] },
        { usedNames: [], recentStyles: ['descriptive'] },
        rng,
      ),
    ).not.toThrow();
  });

  it('repeats names and batch history with the same seed and varies them with other seeds', () => {
    expect(generateLandscapeName(input, context, new RNG('a'))).toEqual(
      generateLandscapeName(input, context, new RNG('a')),
    );
    const results = Array.from({ length: 30 }, (_, index) =>
      generateLandscapeName(input, context, new RNG(index)),
    );
    expect(new Set(results.map((result) => result.name)).size).toBeGreaterThan(10);
    expect(new Set(results.map((result) => result.style))).toEqual(
      new Set(['cultural', 'geographic', 'descriptive']),
    );
  });

  it('uses only supplied nouns and eligible directions', () => {
    const result = generateLandscapeName(input, context, forceStyle('geographic'));
    expect(result.name).toBe('the Eastern Woods');
    expect(result.style).toBe('geographic');
    expect(
      generateLandscapeName(
        { ...input, directions: ['northwest'] },
        context,
        forceStyle('geographic'),
      ).name,
    ).toBe('the Northwestern Woods');
  });

  it('offers mostly descriptive names and uses culture only when it is supplied', () => {
    const rng = new RNG('options');
    const select = vi.spyOn(rng, 'weighted');
    generateLandscapeName(input, context, rng);
    expect(select).toHaveBeenCalledWith([
      { value: 'descriptive', commonality: 220 },
      { value: 'geographic', commonality: 120 },
      { value: 'cultural', commonality: 60 },
    ]);
    select.mockClear();
    generateLandscapeName({ id: 'a', nouns: [], directions: [] }, context, rng);
    expect(select).toHaveBeenCalledWith([{ value: 'descriptive', commonality: 220 }]);
    expect(
      generateLandscapeName({ id: 'a', nouns: [' '], directions: [] }, context, new RNG('blank'))
        .name,
    ).toMatch(/^the .+ Country$/);
  });

  it('uses personal possessives and family forms from the supplied patterns', () => {
    const results = Array.from(
      { length: 25 },
      (_, index) =>
        generateLandscapeName(
          { ...input, nouns: ['Hills'] },
          context,
          forceStyle('cultural', String(index)),
        ).name,
    );
    expect(results).toContain('Dobby’s Hills');
    expect(results).toContain('Dobby Hills');
    const endingS = { ...patterns, female: ['HARRIS'], male: ['HARRIS'], family: [] };
    expect(
      generateLandscapeName({ ...input, culturePatterns: endingS }, context, forceStyle('cultural'))
        .name,
    ).toBe('Harris’ Woods');
  });

  it('falls back when cultural patterns are empty or return no name', () => {
    for (const source of [[], [''], { patterns: [] }]) {
      const empty = { ...patterns, female: source, male: source, family: source };
      const result = generateLandscapeName(
        { ...input, culturePatterns: empty },
        context,
        forceStyle('cultural'),
      );
      expect(result.style).toBe('descriptive');
      expect(result.name).toMatch(/^the .+ Woods$/);
    }
  });

  it('avoids duplicates, retains immutable bounded history and reduces consecutive style repetition', () => {
    const rng = new RNG('batch');
    const initial = structuredClone(context);
    let batch = context;
    for (let index = 0; index < 40; index++) {
      const result = generateLandscapeName(input, batch, rng);
      expect(batch.usedNames).not.toContain(result.name);
      batch = result.nextContext;
    }
    expect(new Set(batch.usedNames.map((name) => name.toLowerCase())).size).toBe(40);
    expect(batch.recentStyles).toHaveLength(3);
    expect(context).toEqual(initial);
    const select = vi.spyOn(rng, 'weighted');
    generateLandscapeName(input, { usedNames: [], recentStyles: ['cultural'] }, rng);
    expect(select).toHaveBeenCalledWith(
      expect.arrayContaining([{ value: 'cultural', commonality: 45 }]),
    );
  });

  it('qualifies exhausted names without IDs, using normalized duplicate comparison', () => {
    const usedNames = [
      ' THE   EASTERN Woods ',
      ...['Second', 'Third', 'Fourth', 'Fifth', 'Sixth', 'Seventh', 'Eighth', 'Ninth', 'Tenth'].map(
        (word) => `the Eastern Woods (${word})`,
      ),
    ];
    const result = generateLandscapeName(
      input,
      { usedNames, recentStyles: [] },
      forceStyle('geographic'),
    );
    expect(result.name).toBe('the Eastern Woods (11th)');
    expect(result.name).not.toContain(input.id);
  });
});
