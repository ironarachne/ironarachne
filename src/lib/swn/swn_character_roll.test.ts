import { describe, expect, it } from 'vitest';

import {
  readSwnCharacterGeneratorConfig,
  resolveSwnNameGeneratorSet,
  rollSwnCharacter,
  rollSwnCharacterSnapshot,
  SWN_DEFAULT_NAME_SET,
} from './swn_character_roll.js';

describe('rollSwnCharacter', () => {
  /** Requirement 2.2, and the defect this module was written to fix. */
  it('gives the same character, names included, for the same seed', () => {
    const first = rollSwnCharacter('a-fixed-seed');
    const second = rollSwnCharacter('a-fixed-seed');

    expect(second.character).toEqual(first.character);
    expect(second.character.firstName).toBe(first.character.firstName);
    expect(second.character.lastName).toBe(first.character.lastName);
  });

  it('gives a different character for a different seed', () => {
    const first = rollSwnCharacter('one-seed');
    const second = rollSwnCharacter('another-seed');

    expect(second.character).not.toEqual(first.character);
  });

  /**
   * The reason the name is drawn from its own stream: choosing a naming source must not shift which
   * background, class or focus the same seed produces.
   */
  it('leaves the character unchanged when only the naming settings differ', () => {
    const plain = rollSwnCharacter('shared-seed');
    const elvish = rollSwnCharacter('shared-seed', { nameGeneratorSet: 'elf' });

    expect(elvish.character.background).toEqual(plain.character.background);
    expect(elvish.character.characterClass).toEqual(plain.character.characterClass);
    expect(elvish.character.focuses).toEqual(plain.character.focuses);
    expect(elvish.character.skills).toEqual(plain.character.skills);
    expect(elvish.character.firstName).not.toBe(plain.character.firstName);
  });

  /** An anonymous sheet is an artifact nobody can pick out of a vault listing (3.5). */
  it('always names the character, even with no naming source chosen', () => {
    const { character, nameGeneratorSet } = rollSwnCharacter('unnamed-seed');

    expect(character.firstName).not.toBe('');
    expect(character.lastName).not.toBe('');
    expect(nameGeneratorSet).toBe(SWN_DEFAULT_NAME_SET);
  });

  it('honours the naming gender that was asked for', () => {
    const male = rollSwnCharacter('gendered-seed', { namingGender: 'male' });
    const female = rollSwnCharacter('gendered-seed', { namingGender: 'female' });

    expect(male.character.firstName).not.toBe(female.character.firstName);
    // The body is the seed's, not the gender picker's.
    expect(female.character.stats).toEqual(male.character.stats);
  });

  it('reports the set it actually used rather than the one it was asked for', () => {
    const { nameGeneratorSet } = rollSwnCharacter('substituted-seed', {
      nameGeneratorSet: 'a-set-this-build-does-not-have',
    });

    expect(nameGeneratorSet).toBe(SWN_DEFAULT_NAME_SET);
  });

  it('rolls a snapshot from the same seed and settings', () => {
    const snapshot = rollSwnCharacterSnapshot('reroll-seed', { nameGeneratorSet: 'dwarf' });

    expect(snapshot).toEqual(
      rollSwnCharacter('reroll-seed', { nameGeneratorSet: 'dwarf' }).character,
    );
  });
});

describe('resolveSwnNameGeneratorSet', () => {
  it('keeps a set this build has', () => {
    expect(resolveSwnNameGeneratorSet('elf')).toBe('elf');
  });

  it('falls back rather than throwing on one it does not', () => {
    expect(resolveSwnNameGeneratorSet('nothing-of-the-sort')).toBe(SWN_DEFAULT_NAME_SET);
    expect(resolveSwnNameGeneratorSet(undefined)).toBe(SWN_DEFAULT_NAME_SET);
    expect(resolveSwnNameGeneratorSet('')).toBe(SWN_DEFAULT_NAME_SET);
  });
});

describe('readSwnCharacterGeneratorConfig', () => {
  it('reads back what the generator recorded', () => {
    expect(
      readSwnCharacterGeneratorConfig({ nameGeneratorSet: 'dwarf', namingGender: 'female' }),
    ).toEqual({ nameGeneratorSet: 'dwarf', namingGender: 'female' });
  });

  /** Provenance is `Record<string, unknown>`: this is the boundary where that becomes typed. */
  it('drops what it does not recognise rather than coercing it', () => {
    expect(
      readSwnCharacterGeneratorConfig({
        nameGeneratorSet: 42,
        namingGender: 'neither',
        somethingElse: true,
      }),
    ).toEqual({});
    expect(readSwnCharacterGeneratorConfig({})).toEqual({});
  });
});
