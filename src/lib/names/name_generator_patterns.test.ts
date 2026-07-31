import { expect, describe, it } from 'vitest';
import * as MUN from '@ironarachne/made-up-names';
import { RNG } from '@ironarachne/rng';
import { getFantasyNameGeneratorSet } from './index';
import {
  nameGeneratorSetFromPatternSources,
  nameGeneratorSetToStoredPatternSet,
  patternSourceFromNameGenerator,
} from './name_generator_patterns';

const GENERATOR_KINDS = ['culture', 'country', 'family', 'female', 'male', 'town'] as const;

function firstSetName(): string {
  return MUN.getSupportedClassicRaceNamePatternSets()[0];
}

describe('patternSourceFromNameGenerator', () => {
  it('extracts a plain pattern array from a generator without combinations', () => {
    const generator = MUN.getNameGeneratorForPatternSet('test', ['CVC', 'CVCV'], new RNG('a'));

    expect(patternSourceFromNameGenerator(generator)).toEqual(['CVC', 'CVCV']);
  });

  it('copies the patterns rather than aliasing the generator', () => {
    const generator = MUN.getNameGeneratorForPatternSet('test', ['CVC'], new RNG('a'));
    const source = patternSourceFromNameGenerator(generator) as string[];
    source.push('mutated');

    expect(patternSourceFromNameGenerator(generator)).toEqual(['CVC']);
  });

  it('keeps combinations alongside patterns when the generator has them', () => {
    const generator = MUN.getNameGeneratorForPatternSet(
      'test',
      { patterns: ['CVC'], combinations: [[['a', 'b']]] },
      new RNG('a'),
    );

    expect(patternSourceFromNameGenerator(generator)).toEqual({
      patterns: ['CVC'],
      combinations: [[['a', 'b']]],
    });
  });

  it('throws when the generator carries no patterns array', () => {
    const notAGenerator = { generate: () => [] } as unknown as MUN.NameGenerator;

    expect(() => patternSourceFromNameGenerator(notAGenerator)).toThrow(
      'Name generator cannot be persisted: missing patterns array.',
    );
  });
});

describe('nameGeneratorSetToStoredPatternSet', () => {
  it('keeps the set name', () => {
    const set = getFantasyNameGeneratorSet(firstSetName(), new RNG('store'));

    expect(nameGeneratorSetToStoredPatternSet(set).name).toBe(firstSetName());
  });

  it('stores a pattern source for every generator kind', () => {
    const stored = nameGeneratorSetToStoredPatternSet(
      getFantasyNameGeneratorSet(firstSetName(), new RNG('store')),
    );

    for (const kind of GENERATOR_KINDS) {
      expect(stored[kind]).toBeDefined();
    }
  });

  it('produces something JSON can round-trip', () => {
    const stored = nameGeneratorSetToStoredPatternSet(
      getFantasyNameGeneratorSet(firstSetName(), new RNG('store')),
    );

    expect(JSON.parse(JSON.stringify(stored))).toEqual(stored);
  });
});

describe('nameGeneratorSetFromPatternSources', () => {
  it('rebuilds a set that generates the same names as the original', () => {
    const setName = firstSetName();
    const original = getFantasyNameGeneratorSet(setName, new RNG('round-trip'));
    const stored = nameGeneratorSetToStoredPatternSet(original);
    const rebuilt = nameGeneratorSetFromPatternSources(stored, new RNG('round-trip'));

    expect(rebuilt.name).toBe(setName);
    expect(rebuilt.town.generate(5)).toEqual(
      getFantasyNameGeneratorSet(setName, new RNG('round-trip')).town.generate(5),
    );
  });

  it('survives a trip through JSON, which is how sets are persisted', () => {
    const stored = nameGeneratorSetToStoredPatternSet(
      getFantasyNameGeneratorSet(firstSetName(), new RNG('json')),
    );
    const rebuilt = nameGeneratorSetFromPatternSources(
      JSON.parse(JSON.stringify(stored)),
      new RNG('json'),
    );

    expect(nameGeneratorSetToStoredPatternSet(rebuilt)).toEqual(stored);
  });

  it('builds a generator of each kind', () => {
    const stored = nameGeneratorSetToStoredPatternSet(
      getFantasyNameGeneratorSet(firstSetName(), new RNG('kinds')),
    );
    const rebuilt = nameGeneratorSetFromPatternSources(stored, new RNG('kinds'));

    for (const kind of GENERATOR_KINDS) {
      expect(rebuilt[kind].generate(2)).toHaveLength(2);
    }
  });
});
