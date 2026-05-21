import * as RNG from '@ironarachne/rng';
import { describe, expect, it } from 'vitest';

import { generateCulture, getDefaultCultureGenerationConfig } from '$lib/culture/culture_generation';
import {
  cultureFromSnapshot,
  stripFunctionValuesDeep,
  toCultureSnapshot,
} from '$lib/culture/culture_snapshot';
import {
  nameGeneratorSetFromPatternSources,
  nameGeneratorSetToStoredPatternSet,
  patternSourceFromNameGenerator,
} from '$lib/names/name_generator_patterns';
import { getAllFantasyNameGeneratorSets, getFantasyNameGeneratorSet } from '$lib/names';

describe('culture_snapshot', () => {
  it('round-trips name generator patterns through JSON', () => {
    const rng = new RNG.RNG('culture-snapshot-test');
    const sets = getAllFantasyNameGeneratorSets(rng);
    const set = sets.find((s) => s.name === 'elf');
    expect(set).toBeTruthy();
    const stored = nameGeneratorSetToStoredPatternSet(set!);
    const json = JSON.stringify(stored);
    const parsed = JSON.parse(json) as typeof stored;
    const rebuilt = nameGeneratorSetFromPatternSources(parsed, rng);
    expect(patternSourceFromNameGenerator(rebuilt.male)).toEqual(patternSourceFromNameGenerator(set!.male));
    expect(rebuilt.name).toBe(set!.name);
  });

  it('toCultureSnapshot and cultureFromSnapshot preserve culture fields and patterns', () => {
    const rng = new RNG.RNG('snap-full');
    const genConfig = getDefaultCultureGenerationConfig();
    genConfig.nameGenerators = getFantasyNameGeneratorSet('dwarf', rng);
    const culture = generateCulture('seed-one', genConfig);
    const snapshot = toCultureSnapshot(culture);
    const json = JSON.stringify(snapshot);
    const parsed = JSON.parse(json) as typeof snapshot;
    const restored = cultureFromSnapshot(parsed, rng);
    expect(restored.name).toBe(culture.name);
    expect(restored.greeting).toBe(culture.greeting);
    expect(restored.organization.description).toBe(culture.organization.description);
    expect(restored.religion.description).toBe(culture.religion.description);
    expect(nameGeneratorSetToStoredPatternSet(restored.nameGenerators)).toEqual(
      nameGeneratorSetToStoredPatternSet(culture.nameGenerators),
    );
  });

  it('stripFunctionValuesDeep removes functions from nested objects', () => {
    const input = { a: 1, fn: () => 2, nested: { b: 2, g: () => 3 } };
    const out = stripFunctionValuesDeep(input) as Record<string, unknown>;
    expect(out.a).toBe(1);
    expect(out.fn).toBeUndefined();
    expect((out.nested as Record<string, unknown>).b).toBe(2);
    expect((out.nested as Record<string, unknown>).g).toBeUndefined();
  });
});
