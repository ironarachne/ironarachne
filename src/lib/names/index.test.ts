import { expect, describe, it } from 'vitest';
import * as MUN from '@ironarachne/made-up-names';
import { RNG } from '@ironarachne/rng';
import { getAllFantasyNameGeneratorSets, getFantasyNameGeneratorSet } from './index';

const GENERATOR_KINDS = ['culture', 'country', 'family', 'female', 'male', 'town'] as const;

describe('getAllFantasyNameGeneratorSets', () => {
  it('returns one set per supported classic race pattern set', () => {
    const sets = getAllFantasyNameGeneratorSets(new RNG('all'));

    expect(sets.map((set) => set.name)).toEqual(MUN.getSupportedClassicRaceNamePatternSets());
  });

  it('returns a non-empty list', () => {
    expect(getAllFantasyNameGeneratorSets(new RNG('all')).length).toBeGreaterThan(0);
  });

  it('gives every set a generator of each kind', () => {
    for (const set of getAllFantasyNameGeneratorSets(new RNG('all'))) {
      for (const kind of GENERATOR_KINDS) {
        expect(set[kind]).toBeDefined();
        expect(typeof set[kind].generate).toBe('function');
      }
    }
  });

  it('produces generators that generate the requested number of non-empty names', () => {
    const [set] = getAllFantasyNameGeneratorSets(new RNG('names'));

    for (const kind of GENERATOR_KINDS) {
      const names = set[kind].generate(3);

      expect(names).toHaveLength(3);
      expect(names.every((name) => name.length > 0)).toBe(true);
    }
  });
});

describe('getFantasyNameGeneratorSet', () => {
  const availableSets = MUN.getSupportedClassicRaceNamePatternSets();

  it('returns the set with the requested name', () => {
    const setName = availableSets[0];

    expect(getFantasyNameGeneratorSet(setName, new RNG('one')).name).toBe(setName);
  });

  it('returns a generator of each kind', () => {
    const set = getFantasyNameGeneratorSet(availableSets[0], new RNG('one'));

    for (const kind of GENERATOR_KINDS) {
      expect(typeof set[kind].generate).toBe('function');
    }
  });

  it('agrees with the full list on the first set name', () => {
    const fromList = getAllFantasyNameGeneratorSets(new RNG('shared'));

    expect(fromList[0].name).toBe(availableSets[0]);
  });

  it('throws for an unknown set name', () => {
    expect(() => getFantasyNameGeneratorSet('martian', new RNG('one'))).toThrow(
      /Name pattern set "martian" is not available\./,
    );
  });

  it('lists the available sets in the error message', () => {
    expect(() => getFantasyNameGeneratorSet('martian', new RNG('one'))).toThrow(
      availableSets.join(', '),
    );
  });

  it('throws for an empty set name', () => {
    expect(() => getFantasyNameGeneratorSet('', new RNG('one'))).toThrow(
      'Name pattern set "" is not available.',
    );
  });

  it('matches set names case-sensitively', () => {
    const setName = availableSets[0];
    const shouted = setName.toUpperCase();

    if (shouted !== setName) {
      expect(() => getFantasyNameGeneratorSet(shouted, new RNG('one'))).toThrow(
        `Name pattern set "${shouted}" is not available.`,
      );
    }
  });

  it('is deterministic for a given seed', () => {
    const setName = availableSets[0];
    const first = getFantasyNameGeneratorSet(setName, new RNG('deterministic'));
    const second = getFantasyNameGeneratorSet(setName, new RNG('deterministic'));

    expect(first.town.generate(5)).toEqual(second.town.generate(5));
  });
});
