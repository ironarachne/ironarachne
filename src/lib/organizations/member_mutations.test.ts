import { RNG } from '@ironarachne/rng';
import { describe, expect, it } from 'vitest';
import * as Characters from '$lib/characters';
import type { Character } from '$lib/characters/character_types.js';
import {
  buildLeaderBlurb,
  describeLeaderForOrganization,
  withAgeCategoryName,
  withPushedTitle,
  withSpecies,
} from './member_mutations';

function character(seed: string): Character {
  return Characters.generate(seed, Characters.getDefaultCharacterGenerationConfig(seed));
}

describe('withPushedTitle', () => {
  it('appends a title to a character that has none', () => {
    const c = character('title-none');
    c.titles = undefined;
    const titled = withPushedTitle(c, {
      femaleTitle: 'Quartermaster',
      maleTitle: 'Quartermaster',
      femaleHonorific: '',
      maleHonorific: '',
      hasLands: false,
      landName: '',
      precedence: 1,
    });
    expect(titled.titles?.map((t) => t.maleTitle)).toEqual(['Quartermaster']);
  });

  it('keeps titles a character already holds', () => {
    const c = character('title-existing');
    const before = c.titles?.length ?? 0;
    withPushedTitle(c, {
      femaleTitle: 'Second',
      maleTitle: 'Second',
      femaleHonorific: '',
      maleHonorific: '',
      hasLands: false,
      landName: '',
      precedence: 2,
    });
    expect(c.titles?.length).toBe(before + 1);
    expect(c.titles?.at(-1)?.maleTitle).toBe('Second');
  });
});

describe('withAgeCategoryName', () => {
  it('moves a character into the named category and re-rolls age to fit it', () => {
    const c = character('age-move');
    const target = c.species.ageCategories.find((cat) => cat.name === 'elderly');
    expect(target).toBeDefined();

    withAgeCategoryName(c, 'elderly', {
      rng: new RNG('age-rng'),
      characterConfig: Characters.getDefaultCharacterGenerationConfig('age-move'),
    });

    expect(c.ageCategory.name).toBe('elderly');
    expect(c.age).toBeGreaterThanOrEqual(target!.minAge);
    expect(c.age).toBeLessThanOrEqual(target!.maxAge);
  });

  it('throws for a category the species does not have', () => {
    const c = character('age-missing');
    expect(() =>
      withAgeCategoryName(c, 'primordial', {
        rng: new RNG('age-rng-2'),
        characterConfig: Characters.getDefaultCharacterGenerationConfig('age-missing'),
      }),
    ).toThrow(/Failed to find age category for name primordial/);
  });
});

describe('withSpecies', () => {
  it('keeps the equivalent age category when the new species has one by that name', () => {
    const c = character('species-keep');
    const categoryName = c.ageCategory.name;
    const replacement = {
      ...c.species,
      name: 'tidewalker',
      creatureTypes: ['humanoid', 'aquatic'],
    };

    withSpecies(c, replacement, new RNG('species-rng'));

    expect(c.species.name).toBe('tidewalker');
    expect(c.ageCategory.name).toBe(categoryName);
    expect(c.abilities).toEqual(replacement.abilities);
    expect(c.creatureTypes).toEqual(['humanoid', 'aquatic']);
    expect(c.age).toBeGreaterThanOrEqual(c.ageCategory.minAge);
    expect(c.age).toBeLessThanOrEqual(c.ageCategory.maxAge);
  });

  it('picks a category from the new species when the old name is gone', () => {
    const c = character('species-repick');
    const onlyCategory = {
      ...c.species.ageCategories[0],
      name: 'ageless',
      minAge: 300,
      maxAge: 400,
    };
    const replacement = { ...c.species, name: 'construct', ageCategories: [onlyCategory] };

    withSpecies(c, replacement, new RNG('species-rng-2'));

    expect(c.ageCategory.name).toBe('ageless');
    expect(c.age).toBeGreaterThanOrEqual(300);
    expect(c.age).toBeLessThanOrEqual(400);
  });

  it('copies ability and creature-type lists rather than sharing them', () => {
    const c = character('species-copy');
    const replacement = { ...c.species, creatureTypes: ['fey'] };

    withSpecies(c, replacement, new RNG('species-rng-3'));

    /* Same contents, different arrays: mutating the character must not reach the species. */
    expect(c.abilities).toEqual(replacement.abilities);
    expect(c.abilities).not.toBe(replacement.abilities);
    expect(c.creatureTypes).toEqual(replacement.creatureTypes);
    expect(c.creatureTypes).not.toBe(replacement.creatureTypes);

    c.creatureTypes.push('mutated');
    expect(replacement.creatureTypes).toEqual(['fey']);
  });
});

describe('leader description', () => {
  it('names the leader and carries their own description through', () => {
    const c = character('blurb');
    c.description = 'A calm tactician.';
    withPushedTitle(c, {
      femaleTitle: 'Commander',
      maleTitle: 'Commander',
      femaleHonorific: 'Commander',
      maleHonorific: 'Commander',
      hasLands: false,
      landName: '',
      precedence: 0,
    });

    const blurb = buildLeaderBlurb(c);
    expect(blurb).toContain(c.firstName);
    expect(blurb).toContain(c.lastName);
    expect(blurb).toContain('A calm tactician.');
    expect(blurb).not.toMatch(/\s{2,}/);
  });

  it('still reads cleanly when the leader holds no title', () => {
    const c = character('blurb-untitled');
    c.titles = [];
    c.description = 'Keeps to themselves.';

    const blurb = buildLeaderBlurb(c);
    expect(blurb.startsWith('They are led by ')).toBe(true);
    expect(blurb).toContain(c.firstName);
    expect(blurb).not.toMatch(/\s{2,}/);
  });

  it('describes a leader the same way whichever entry point is used', () => {
    const c = character('blurb-same');
    expect(describeLeaderForOrganization(c, 'The Iron Compact')).toBe(buildLeaderBlurb(c));
  });
});
