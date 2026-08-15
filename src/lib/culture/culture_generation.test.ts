import { RNG } from '@ironarachne/rng';
import { describe, expect, it } from 'vitest';

import {
  describeOrganization,
  generateCulture,
  generateCulturalOrganization,
  getDefaultCultureGenerationConfig,
} from './culture_generation';
import type { CultureGenerationConfig } from './culture_types';
import { getFantasyNameGeneratorSet, type NameGeneratorSet } from '$lib/names';

function configFor(seed: string): CultureGenerationConfig {
  const config = getDefaultCultureGenerationConfig();
  config.nameGenerators = getFantasyNameGeneratorSet('dwarf', new RNG(seed));
  return config;
}

/** A generator set with one slot knocked out, to reach the guards at the top of `generateCulture`. */
function setWithout(slot: keyof NameGeneratorSet): NameGeneratorSet {
  const set = getFantasyNameGeneratorSet('dwarf', new RNG('missing-slot'));
  return { ...set, [slot]: null };
}

describe('generateCulture', () => {
  /**
   * Requirement 2.2. A seed a user wrote down has to keep meaning the culture it produced, which
   * is also what makes re-rolling a saved artifact from its provenance worth offering.
   */
  it('produces the same culture from the same seed and configuration', () => {
    const first = generateCulture('a-fixed-seed', configFor('sets'));
    const second = generateCulture('a-fixed-seed', configFor('sets'));

    expect(second.name).toBe(first.name);
    expect(second.taboos).toEqual(first.taboos);
    expect(second.organization).toEqual(first.organization);
    expect(second.greeting).toBe(first.greeting);
    expect(second.religion?.name).toBe(first.religion?.name);
  });

  it('produces a different culture from a different seed', () => {
    const first = generateCulture('one-seed', configFor('sets'));
    const second = generateCulture('another-seed', configFor('sets'));

    expect(second.taboos).not.toEqual(first.taboos);
    expect(second.organization).not.toEqual(first.organization);
  });

  /**
   * The culture's *name* comes from the name generators it was handed rather than from the seed:
   * a generator carries its own RNG, and this one is only ever asked for the next name. So two
   * rolls given freshly built, identically seeded generators are named the same whatever seed
   * they were rolled from.
   *
   * That is not a gap. A caller who wants the name to follow the seed seeds the generators from
   * it, which is exactly what `rollCultureSnapshot` does and what the generator page does when it
   * reseeds its own RNG before picking a set. Stated here because it is the sort of thing that is
   * discovered by accident, at the cost of an afternoon, once per person.
   */
  it('takes its name from the name generators it was handed, not from the seed', () => {
    expect(generateCulture('one-seed', configFor('same-sets')).name).toBe(
      generateCulture('another-seed', configFor('same-sets')).name,
    );
  });

  it('gives a culture its own religion by default', () => {
    expect(generateCulture('a-fixed-seed', configFor('sets')).religion).not.toBeNull();
  });

  it('names the culture in its own music style', () => {
    const culture = generateCulture('a-fixed-seed', configFor('sets'));

    expect(culture.musicStyle).toContain(culture.name);
    expect(culture.musicStyle).not.toContain('This style of');
  });

  it('draws between two and five taboos, none of them empty', () => {
    for (let index = 0; index < 20; index++) {
      const culture = generateCulture(`taboo-seed-${index}`, configFor('sets'));

      expect(culture.taboos.length).toBeGreaterThanOrEqual(2);
      expect(culture.taboos.length).toBeLessThanOrEqual(5);
      expect(new Set(culture.taboos).size).toBe(culture.taboos.length);
      expect(culture.taboos.every((taboo) => taboo.trim() !== '')).toBe(true);
    }
  });

  /**
   * The guards exist because a partial name set produces a culture that cannot name anything, and
   * failing at generation says so where failing later would not.
   */
  it.each(['culture', 'country', 'family', 'female', 'male', 'town'] as const)(
    'refuses a configuration with no %s name generator',
    (slot) => {
      expect(() => generateCulture('a-fixed-seed', { nameGenerators: setWithout(slot) })).toThrow(
        new RegExp(`${slot} name generator`, 'i'),
      );
    },
  );
});

describe('generateCulturalOrganization', () => {
  it('is seeded, and describes itself', () => {
    const organization = generateCulturalOrganization('org-seed');

    expect(generateCulturalOrganization('org-seed')).toEqual(organization);
    expect(organization.description).toBe(describeOrganization(organization));
  });
});

describe('describeOrganization', () => {
  it('writes the attributes into a sentence', () => {
    const description = describeOrganization({
      powerConcentration: 'power is determined by wealth',
      socialMobility: 'social mobility is completely stagnant',
      dominantProfession: 'merchants',
      dominantGender: 'women are dominant',
      description: '',
    });

    expect(description).toContain('power is determined by wealth');
    expect(description).toContain('Merchants are most highly regarded');
    expect(description).toContain('Women are dominant');
    expect(description).toContain('Social mobility is completely stagnant');
  });

  it('leaves out a dominant gender the culture does not have', () => {
    const description = describeOrganization({
      powerConcentration: 'power is shared among multiple groups',
      socialMobility: 'social mobility is possible through hard work and determination alone',
      dominantProfession: 'farmers',
      description: '',
    });

    expect(description).toContain('Farmers are most highly regarded');
    expect(description).not.toContain('dominant.');
  });
});
