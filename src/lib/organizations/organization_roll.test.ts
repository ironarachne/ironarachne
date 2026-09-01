import { describe, expect, it } from 'vitest';

import { RNG } from '@ironarachne/rng';

import {
  organizationKindsForGenre,
  readOrganizationGeneratorConfig,
  rollOrganization,
  rollOrganizationSnapshot,
} from './organization_roll.js';

describe('rollOrganization', () => {
  /** Requirement 2.2, including the people's names and the emblem. */
  it('gives the same organization for the same seed and settings', () => {
    const first = rollOrganization('a-fixed-seed', { genre: 'fantasy' });
    const second = rollOrganization('a-fixed-seed', { genre: 'fantasy' });

    expect(second.organization.name).toBe(first.organization.name);
    expect(second.organization.leader.name).toBe(first.organization.leader.name);
    expect(second.organization.visualIdentity).toEqual(first.organization.visualIdentity);
    expect(second.organization.notableMembers.map((m) => m.name)).toEqual(
      first.organization.notableMembers.map((m) => m.name),
    );
  });

  it('gives a different organization for a different seed', () => {
    const names = ['one', 'two', 'three'].map((seed) => rollOrganization(seed).organization.name);

    expect(new Set(names).size).toBeGreaterThan(1);
  });

  it('rolls the kind asked for, and reports no substitution', () => {
    const roll = rollOrganization('kind', { genre: 'fantasy', kindId: 'noble_house' });

    expect(roll.organization.kindId).toBe('noble_house');
    expect(roll.organization.genre).toBe('fantasy');
    expect(roll.substitutions).toEqual([]);
  });

  it('names the people from the set asked for, and records which', () => {
    const roll = rollOrganization('named', { nameGeneratorSet: 'elf' });

    expect(roll.nameGeneratorSet).toBe('elf');
    expect(roll.substitutions).toEqual([]);
  });

  it('lets the seed choose a name set for "any", and records the one it chose', () => {
    const roll = rollOrganization('any-names', { nameGeneratorSet: 'any' });

    expect(roll.nameGeneratorSet).not.toBe('any');
    expect(roll.substitutions).toEqual([]);
    expect(rollOrganization('any-names', { nameGeneratorSet: 'any' }).nameGeneratorSet).toBe(
      roll.nameGeneratorSet,
    );
  });

  it('substitutes, and says so, for a kind this build does not have or outside the genre', () => {
    const missing = rollOrganization('missing', { kindId: 'a kind that never was' });
    const wrongGenre = rollOrganization('wrong-genre', {
      genre: 'science_fiction',
      kindId: 'noble_house',
    });

    expect(missing.substitutions).toEqual(['kindId']);
    expect(wrongGenre.substitutions).toEqual(['kindId']);
    expect(wrongGenre.organization.genre).toBe('science_fiction');
  });

  it('substitutes, and says so, for a name set this build does not have', () => {
    expect(rollOrganization('missing-names', { nameGeneratorSet: 'nobody' }).substitutions).toEqual(
      ['nameGeneratorSet'],
    );
  });

  it('applies a size preset and a world context', () => {
    const roll = rollOrganization('sized', {
      genre: 'fantasy',
      kindId: 'mercenary_company',
      size: 'small',
      worldContextPreset: 'coastal',
    });

    expect(roll.organization.memberCount).toBeLessThanOrEqual(50);
    expect(roll.organization.profile.environmentNarrative).toBeDefined();
  });

  it('rolls a snapshot from the same seed', () => {
    const snapshot = rollOrganizationSnapshot('reroll-seed', { genre: 'fantasy' });

    expect(snapshot.name).toBe(
      rollOrganization('reroll-seed', { genre: 'fantasy' }).organization.name,
    );
    expect(typeof snapshot.leader.speciesName).toBe('string');
  });
});

describe('organizationKindsForGenre', () => {
  it('filters the registry by genre, and returns all of it for "any"', () => {
    const all = organizationKindsForGenre('any', new RNG('kinds'));
    const fantasy = organizationKindsForGenre('fantasy', new RNG('kinds'));

    expect(all.length).toBeGreaterThan(fantasy.length);
    expect(fantasy.every((kind) => kind.genre === 'fantasy')).toBe(true);
    expect(organizationKindsForGenre(undefined, new RNG('kinds')).length).toBe(all.length);
  });
});

describe('readOrganizationGeneratorConfig', () => {
  it('reads the five settings the page has', () => {
    const config = {
      genre: 'fantasy',
      kindId: 'noble_house',
      size: 'large',
      nameGeneratorSet: 'elf',
      worldContextPreset: 'tundra',
    };

    expect(readOrganizationGeneratorConfig(config)).toEqual(config);
  });

  it('drops what it does not recognise rather than coercing it', () => {
    expect(
      readOrganizationGeneratorConfig({
        genre: 'western',
        kindId: '',
        size: 'huge',
        nameGeneratorSet: 3,
        worldContextPreset: 'moon',
        other: true,
      }),
    ).toEqual({});
  });
});
