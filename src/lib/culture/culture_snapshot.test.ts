import * as RNG from '@ironarachne/rng';
import { describe, expect, it } from 'vitest';

import { generateCulture, getDefaultCultureGenerationConfig } from './culture_generation';
import {
  cultureFromSnapshot,
  stripFunctionValuesDeep,
  toCultureSnapshot,
} from './culture_snapshot';
import {
  nameGeneratorSetFromPatternSources,
  nameGeneratorSetToStoredPatternSet,
  patternSourceFromNameGenerator,
  getAllFantasyNameGeneratorSets,
  getFantasyNameGeneratorSet,
} from '$lib/names';

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
    expect(patternSourceFromNameGenerator(rebuilt.male)).toEqual(
      patternSourceFromNameGenerator(set!.male),
    );
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
    expect(restored.religion?.description).toBe(culture.religion?.description);
    expect(nameGeneratorSetToStoredPatternSet(restored.nameGenerators)).toEqual(
      nameGeneratorSetToStoredPatternSet(culture.nameGenerators),
    );
  });

  /**
   * The composed case: a culture whose religion is a referenced artifact keeps no religion of its
   * own, and that absence has to survive storage. A round trip that quietly grew one back would
   * put a stale copy of someone's religion inside every culture that links to it.
   */
  it('round-trips a culture that takes its religion from a reference', () => {
    const rng = new RNG.RNG('snap-referenced');
    const genConfig = getDefaultCultureGenerationConfig();
    genConfig.nameGenerators = getFantasyNameGeneratorSet('dwarf', rng);
    genConfig.religionSource = 'reference';
    const culture = generateCulture('seed-one', genConfig);
    expect(culture.religion).toBeNull();

    const parsed = JSON.parse(JSON.stringify(toCultureSnapshot(culture))) as ReturnType<
      typeof toCultureSnapshot
    >;
    const restored = cultureFromSnapshot(parsed, rng);

    expect(restored.religion).toBeNull();
    expect(restored.name).toBe(culture.name);
    expect(restored.taboos).toEqual(culture.taboos);
  });

  /**
   * A referenced religion changes where the religion comes from and nothing else. If it moved any
   * other field, a user who ticked the box would find the seed they had written down no longer
   * produced the culture they wrote it down for.
   */
  it('leaves every other field alone when the religion comes from a reference', () => {
    function roll(religionSource: 'generate' | 'reference') {
      const rng = new RNG.RNG('snap-parity');
      const genConfig = getDefaultCultureGenerationConfig();
      genConfig.nameGenerators = getFantasyNameGeneratorSet('elf', rng);
      genConfig.religionSource = religionSource;
      return generateCulture('parity-seed', genConfig);
    }

    const own = roll('generate');
    const referenced = roll('reference');

    expect(referenced.name).toBe(own.name);
    expect(referenced.taboos).toEqual(own.taboos);
    expect(referenced.greeting).toBe(own.greeting);
    expect(referenced.eatingTrait).toBe(own.eatingTrait);
    expect(referenced.designTrait).toBe(own.designTrait);
    expect(referenced.musicStyle).toBe(own.musicStyle);
    expect(referenced.organization).toEqual(own.organization);
    expect(own.religion).not.toBeNull();
    expect(referenced.religion).toBeNull();
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
