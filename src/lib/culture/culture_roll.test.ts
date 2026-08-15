import { describe, expect, it } from 'vitest';

import { readCultureGeneratorConfig, rollCultureSnapshot } from './culture_roll';

describe('readCultureGeneratorConfig', () => {
  it('reads back what the generator recorded', () => {
    expect(
      readCultureGeneratorConfig({ nameGeneratorSet: 'elf', religionSource: 'reference' }),
    ).toEqual({ nameGeneratorSet: 'elf', religionSource: 'reference' });
  });

  /**
   * Provenance is `Record<string, unknown>` because the store cannot know what a tool put in it.
   * Anything unrecognisable falls back to the defaults rather than being coerced — rolling a
   * culture from a misread field would be worse than rolling one from none.
   */
  it('drops values it does not recognise rather than coercing them', () => {
    expect(readCultureGeneratorConfig({})).toEqual({});
    expect(readCultureGeneratorConfig({ nameGeneratorSet: 42 })).toEqual({});
    expect(readCultureGeneratorConfig({ nameGeneratorSet: '' })).toEqual({});
    expect(readCultureGeneratorConfig({ religionSource: 'borrowed' })).toEqual({});
    expect(readCultureGeneratorConfig({ religionSource: null })).toEqual({});
  });
});

describe('rollCultureSnapshot', () => {
  it('rolls the same culture from the same seed and settings', () => {
    const config = { nameGeneratorSet: 'dwarf' as const };
    expect(rollCultureSnapshot('a-seed', config)).toEqual(rollCultureSnapshot('a-seed', config));
  });

  it('rolls a different culture from a different seed', () => {
    const config = { nameGeneratorSet: 'dwarf' as const };
    expect(rollCultureSnapshot('a-seed', config).name).not.toBe(
      rollCultureSnapshot('another-seed', config).name,
    );
  });

  it('rolls a religion of its own by default', () => {
    expect(rollCultureSnapshot('a-seed').religion).not.toBeNull();
  });

  /**
   * A culture built around a referenced religion must not grow one of its own when it is rolled
   * again: the artifact's reference still points at a religion, and a payload carrying both would
   * show one religion while linking to another.
   */
  it('keeps deferring to a reference when that is how the culture was made', () => {
    expect(rollCultureSnapshot('a-seed', { religionSource: 'reference' }).religion).toBeNull();
  });

  it('produces a payload its own kind accepts', async () => {
    const { validateCultureSnapshot } = await import('./culture_artifact_kind');
    expect(
      validateCultureSnapshot(rollCultureSnapshot('a-seed', { nameGeneratorSet: 'elf' })).ok,
    ).toBe(true);
  });

  /**
   * It throws rather than substituting a set that is not the one recorded. The editing framework
   * catches it and keeps the artifact the user still has on screen, which beats quietly rolling a
   * culture whose names come from somewhere else entirely.
   */
  it('refuses a name pattern set this build does not have', () => {
    expect(() => rollCultureSnapshot('a-seed', { nameGeneratorSet: 'no-such-set' })).toThrow();
  });
});
