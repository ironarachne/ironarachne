import { describe, expect, it } from 'vitest';

import {
  readUwCharacterGeneratorConfig,
  resolveUwNameGeneratorSet,
  rollUwCharacter,
  rollUwCharacterSnapshot,
  UW_DEFAULT_NAME_SET,
} from './uw_character_roll.js';
import { toUwCharacterSnapshot } from './uw_character_snapshot.js';

describe('rollUwCharacter', () => {
  /** Requirement 2.2, and the defect this module was written to fix. */
  it('gives the same character, names included, for the same seed', () => {
    const first = rollUwCharacter('a-fixed-seed');
    const second = rollUwCharacter('a-fixed-seed');

    expect(second.character).toEqual(first.character);
    expect(second.character.firstName).toBe(first.character.firstName);
  });

  it('gives a different character for a different seed', () => {
    expect(rollUwCharacter('one-seed').character).not.toEqual(
      rollUwCharacter('another-seed').character,
    );
  });

  /**
   * The reason the name is drawn from its own stream: choosing a naming source must not shift which
   * careers, origin or assets the same seed produces.
   */
  it('leaves the character unchanged when only the naming settings differ', () => {
    const plain = rollUwCharacter('shared-seed');
    const elvish = rollUwCharacter('shared-seed', { nameGeneratorSet: 'elf' });

    expect(elvish.character.careers).toEqual(plain.character.careers);
    expect(elvish.character.origin).toEqual(plain.character.origin);
    expect(elvish.character.assets).toEqual(plain.character.assets);
    expect(elvish.character.firstName).not.toBe(plain.character.firstName);
  });

  /** An anonymous sheet is an artifact nobody can pick out of a vault listing (3.5). */
  it('always names the character, even with no naming source chosen', () => {
    const { character, nameGeneratorSet } = rollUwCharacter('unnamed-seed');

    expect(character.firstName).not.toBe('');
    expect(character.lastName).not.toBe('');
    expect(nameGeneratorSet).toBe(UW_DEFAULT_NAME_SET);
  });

  it('honours the naming gender that was asked for', () => {
    const male = rollUwCharacter('gendered-seed', { namingGender: 'male' });
    const female = rollUwCharacter('gendered-seed', { namingGender: 'female' });

    expect(male.character.firstName).not.toBe(female.character.firstName);
    // The character is the seed's, not the gender picker's.
    expect(female.character.stats).toEqual(male.character.stats);
  });

  it('reports the set it actually used rather than the one it was asked for', () => {
    expect(
      rollUwCharacter('substituted-seed', { nameGeneratorSet: 'a-set-this-build-lacks' })
        .nameGeneratorSet,
    ).toBe(UW_DEFAULT_NAME_SET);
  });

  it('rolls a snapshot from the same seed and settings', () => {
    const snapshot = rollUwCharacterSnapshot('reroll-seed', { nameGeneratorSet: 'dwarf' });

    expect(snapshot).toEqual(
      toUwCharacterSnapshot(
        rollUwCharacter('reroll-seed', { nameGeneratorSet: 'dwarf' }).character,
      ),
    );
  });
});

describe('resolveUwNameGeneratorSet', () => {
  it('keeps a set this build has', () => {
    expect(resolveUwNameGeneratorSet('elf')).toBe('elf');
  });

  it('falls back rather than throwing on one it does not', () => {
    expect(resolveUwNameGeneratorSet('nothing-of-the-sort')).toBe(UW_DEFAULT_NAME_SET);
    expect(resolveUwNameGeneratorSet(undefined)).toBe(UW_DEFAULT_NAME_SET);
    expect(resolveUwNameGeneratorSet('')).toBe(UW_DEFAULT_NAME_SET);
  });
});

describe('readUwCharacterGeneratorConfig', () => {
  it('reads back what the generator recorded', () => {
    expect(
      readUwCharacterGeneratorConfig({ nameGeneratorSet: 'dwarf', namingGender: 'female' }),
    ).toEqual({ nameGeneratorSet: 'dwarf', namingGender: 'female' });
  });

  /** Provenance is `Record<string, unknown>`: this is the boundary where that becomes typed. */
  it('drops what it does not recognise rather than coercing it', () => {
    expect(
      readUwCharacterGeneratorConfig({
        nameGeneratorSet: 42,
        namingGender: 'neither',
        somethingElse: true,
      }),
    ).toEqual({});
    expect(readUwCharacterGeneratorConfig({})).toEqual({});
  });
});
