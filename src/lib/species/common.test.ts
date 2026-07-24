import * as AgeCategories from '$lib/age/age_categories.js';
import { traditional } from '$lib/gender/index.js';
import * as Sizes from '$lib/size/sizes.js';
import { RNG } from '@ironarachne/rng';
import { describe, expect, it } from 'vitest';
import dog from '$lib/species_animals/dog.js';
import {
  breed,
  breedable,
  byAllTags,
  byAnyTag,
  byCreatureType,
  byEnvironment,
  byName,
  generateCompositeName,
  getCommonEnvironments,
  getModifiedVariants,
  mergeTags,
  randomTraits,
  randomUniqueSet,
  randomWeighted,
  sentient,
  nonSentient,
  withCreatureType,
} from './common.js';
import type Species from './species.js';

function dogVariant(name: string, breedType = 'dog'): Species {
  return {
    ...dog,
    name,
    pluralName: `${name}s`,
    adjective: name,
    breedType,
    tags: [...dog.tags],
    environments: [...dog.environments],
    creatureTypes: [...dog.creatureTypes],
    physicalTraitGeneratorConfigs: dog.physicalTraitGeneratorConfigs.map((c) => ({
      ...c,
      options: [...c.options],
      tags: [...c.tags],
    })),
    ageCategories: [...dog.ageCategories],
    sizeGeneratorConfigMatrix: dog.sizeGeneratorConfigMatrix,
    abilities: [...dog.abilities],
    genders: traditional(),
    commonality: 5,
  };
}

describe('randomWeighted', () => {
  it('respects commonality weights', () => {
    const heavy = dogVariant('heavy');
    heavy.commonality = 100;
    const light = dogVariant('light');
    light.commonality = 1;
    const rng = new RNG('species-weight');

    expect(randomWeighted([heavy, light], rng)).toBe(heavy);
  });
});

describe('breedable and breed', () => {
  it('allows breeding within the same breed type', () => {
    const a = dogVariant('alpha');
    const b = dogVariant('beta');
    const expectedName = generateCompositeName(a, b);
    expect(breedable(a, b)).toBe(true);
    expect(breed(a, b).name).toBe(expectedName);
  });

  it('rejects cross-breed-type pairs', () => {
    const a = dogVariant('alpha', 'dog');
    const b = dogVariant('beta', 'wolf');
    expect(() => breed(a, b)).toThrow(/not breedable/);
  });

  it('does not mutate the parent species', () => {
    const a = dogVariant('alpha');
    const b = dogVariant('beta');
    const originalName = a.name;
    const originalEnvironments = [...a.environments];
    const originalTags = [...a.tags];
    breed(a, b);
    expect(a.name).toBe(originalName);
    expect(a.environments).toEqual(originalEnvironments);
    expect(a.tags).toEqual(originalTags);
  });
});

describe('species filters', () => {
  const options = [dogVariant('alpha'), dogVariant('beta')];

  it('filters by creature type and environment', () => {
    expect(byCreatureType('beast', options)).toHaveLength(2);
    expect(byEnvironment('grassland', options)).toHaveLength(2);
    expect(byEnvironment('undersea', options)).toHaveLength(0);
  });

  it('filters by tags', () => {
    expect(byAllTags(['dog'], options)).toHaveLength(2);
    expect(byAnyTag(['dog', 'missing'], options)).toHaveLength(2);
  });

  it('finds species by name or throws', () => {
    expect(byName('alpha', options).name).toBe('alpha');
    expect(() => byName('missing', options)).toThrow(/No species found/);
  });
});

describe('mergeTags and getCommonEnvironments', () => {
  it('deduplicates merged tag lists', () => {
    expect(mergeTags(['a', 'b'], ['b', 'c']).sort()).toEqual(['a', 'b', 'c']);
  });

  it('returns shared environments only', () => {
    const a = dogVariant('alpha');
    const b = dogVariant('beta');
    a.environments = ['grassland', 'mountain'];
    b.environments = ['grassland', 'desert'];
    expect(getCommonEnvironments(a, b)).toEqual(['grassland']);
  });
});

describe('generateCompositeName', () => {
  it('orders names lexicographically', () => {
    expect(generateCompositeName(dogVariant('beta'), dogVariant('alpha'))).toBe('beta-alpha');
  });
});

describe('randomTraits', () => {
  it('returns one trait per generator config', () => {
    const traits = randomTraits('dog-traits', dog);
    expect(traits).toHaveLength(dog.physicalTraitGeneratorConfigs.length);
    expect(traits.every((t) => t.name.length > 0)).toBe(true);
  });
});

describe('randomUniqueSet', () => {
  it('returns the requested number of distinct species', () => {
    const options = [dogVariant('a'), dogVariant('b'), dogVariant('c')];
    const rng = new RNG('unique-species');
    const picked = randomUniqueSet(options, 2, rng);
    expect(picked).toHaveLength(2);
    expect(new Set(picked.map((s) => s.name)).size).toBe(2);
  });
});

describe('getModifiedVariants', () => {
  it('creates skeleton, vampire, and zombie variants', () => {
    const variants = getModifiedVariants([dogVariant('alpha')]);
    expect(variants.some((s) => s.tags.includes('skeleton'))).toBe(true);
    expect(variants.some((s) => s.tags.includes('vampire'))).toBe(true);
    expect(variants.some((s) => s.tags.includes('zombie'))).toBe(true);
  });
});

describe('sentient and nonSentient', () => {
  it('returns at least one sentient species from the catalog', () => {
    expect(sentient().length).toBeGreaterThan(0);
  });

  it('returns non-sentient species from the catalog', () => {
    expect(nonSentient().length).toBeGreaterThan(0);
    expect(nonSentient().every((s) => !s.tags.includes('sentient'))).toBe(true);
  });
});

describe('withCreatureType', () => {
  it('filters a provided species list by creature type', () => {
    const options = [dogVariant('alpha'), dogVariant('beta')];
    expect(withCreatureType('beast', options)).toHaveLength(2);
    expect(withCreatureType('undead', options)).toHaveLength(0);
  });
});

describe('averageAgeCategories', () => {
  it('blends age categories from two species', () => {
    const shortLived = dogVariant('short');
    shortLived.ageCategories = AgeCategories.beastLifespanFourStage({ elderlyCommonality: 1 });
    const longLived = dogVariant('long');
    longLived.ageCategories = AgeCategories.beastLifespanCat();
    const blended = breed(shortLived, longLived);
    expect(blended.ageCategories.length).toBeGreaterThan(0);
    expect(blended.sizeGeneratorConfigMatrix).toBeDefined();
  });
});
