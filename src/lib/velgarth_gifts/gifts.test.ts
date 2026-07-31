import { expect, describe, it } from 'vitest';
import { RNG } from '@ironarachne/rng';
import { generate } from './gifts';
import { all } from './gift_possibilities';
import type GiftGeneratorConfig from './generator_config';

function configFor(overrides: Partial<GiftGeneratorConfig> = {}): GiftGeneratorConfig {
  return { possibilities: all(), min_gifts: 1, max_gifts: 3, ...overrides };
}

describe('generate', () => {
  it('is deterministic for a given seed', () => {
    expect(generate(configFor(), new RNG('gifted'))).toEqual(
      generate(configFor(), new RNG('gifted')),
    );
  });

  it('produces different gift sets for different seeds', () => {
    const results = new Set(
      Array.from({ length: 10 }, (_, index) =>
        JSON.stringify(generate(configFor(), new RNG(`vary-${index}`))),
      ),
    );

    expect(results.size).toBeGreaterThan(1);
  });

  it('generates between min_gifts and max_gifts gifts', () => {
    for (let index = 0; index < 20; index++) {
      const gifts = generate(configFor(), new RNG(`count-${index}`));

      expect(gifts.length).toBeGreaterThanOrEqual(1);
      expect(gifts.length).toBeLessThanOrEqual(3);
    }
  });

  it('generates exactly one gift when min and max are both one', () => {
    expect(generate(configFor({ min_gifts: 1, max_gifts: 1 }), new RNG('one'))).toHaveLength(1);
  });

  it('generates no gifts when min and max are both zero', () => {
    expect(generate(configFor({ min_gifts: 0, max_gifts: 0 }), new RNG('none'))).toEqual([]);
  });

  it('never repeats a gift within one set', () => {
    for (let index = 0; index < 30; index++) {
      const names = generate(
        configFor({ min_gifts: 4, max_gifts: 4 }),
        new RNG(`unique-${index}`),
      ).map((gift) => gift.name);

      expect(new Set(names).size).toBe(names.length);
    }
  });

  it('only generates gifts that the config lists as possible', () => {
    const possibilities = all().slice(0, 3);
    const allowed = possibilities.map((possibility) => possibility.name);

    for (let index = 0; index < 20; index++) {
      const gifts = generate(
        { possibilities, min_gifts: 1, max_gifts: 3 },
        new RNG(`allowed-${index}`),
      );

      for (const gift of gifts) {
        expect(allowed).toContain(gift.name);
      }
    }
  });

  it('describes a gift with its possibility description and its strength description', () => {
    const gifts = generate(configFor(), new RNG('described'));

    for (const gift of gifts) {
      const possibility = all().find((candidate) => candidate.name === gift.name);

      expect(possibility).toBeDefined();
      expect(gift.description.startsWith(possibility!.description)).toBe(true);

      const levelsAtStrength = possibility!.strength_levels.filter(
        (level) => level.strength === gift.strength,
      );

      expect(levelsAtStrength.length).toBeGreaterThan(0);
      expect(levelsAtStrength.some((level) => gift.description.endsWith(level.description))).toBe(
        true,
      );
    }
  });

  it('gives every gift a strength its possibility actually offers', () => {
    for (let index = 0; index < 20; index++) {
      for (const gift of generate(configFor(), new RNG(`strength-${index}`))) {
        const possibility = all().find((candidate) => candidate.name === gift.name);
        const strengths = possibility!.strength_levels.map((level) => level.strength);

        expect(strengths).toContain(gift.strength);
      }
    }
  });

  it('does not mutate the possibilities it was given', () => {
    const config = configFor({ min_gifts: 4, max_gifts: 4 });
    const before = config.possibilities.length;

    generate(config, new RNG('immutable'));

    expect(config.possibilities).toHaveLength(before);
  });

  it('never leaves an undefined fragment in a description', () => {
    for (let index = 0; index < 30; index++) {
      for (const gift of generate(configFor(), new RNG(`clean-${index}`))) {
        expect(gift.description).not.toContain('undefined');
      }
    }
  });
});

describe('gift possibilities', () => {
  it('lists possibilities with unique names', () => {
    const names = all().map((possibility) => possibility.name);

    expect(new Set(names).size).toBe(names.length);
  });

  it('gives every possibility a positive commonality and a description', () => {
    for (const possibility of all()) {
      expect(possibility.commonality).toBeGreaterThan(0);
      expect(possibility.description).toBeTruthy();
    }
  });

  it('gives every possibility at least one strength level', () => {
    for (const possibility of all()) {
      expect(possibility.strength_levels.length).toBeGreaterThan(0);
    }
  });

  it('gives every strength level a positive commonality, strength and description', () => {
    for (const possibility of all()) {
      for (const level of possibility.strength_levels) {
        expect(level.commonality).toBeGreaterThan(0);
        expect(level.strength).toBeGreaterThan(0);
        expect(level.description).toBeTruthy();
      }
    }
  });

  it('gives each possibility distinct strength level descriptions', () => {
    // A possibility may offer several differently-worded levels at the same strength, so it is
    // the descriptions that must be distinct, not the strength values.
    for (const possibility of all()) {
      const descriptions = possibility.strength_levels.map((level) => level.description);

      expect(new Set(descriptions).size).toBe(descriptions.length);
    }
  });

  it('returns a fresh list each call so callers cannot mutate the source', () => {
    const first = all();
    const originalName = first[0].name;
    first[0].name = 'mutated';

    expect(all()[0].name).toBe(originalName);
  });
});
