import { describe, expect, it } from 'vitest';

import {
  readDccCharacterGeneratorConfig,
  resolveDccNameGeneratorSet,
  rollDccCharacter,
  rollDccCharacterSnapshot,
} from './dcc_character_roll.js';

describe('reading a recorded config', () => {
  it('takes the fields it recognises', () => {
    expect(
      readDccCharacterGeneratorConfig({
        allowedOccupations: ['dwarf', 'human'],
        nameGeneratorSet: 'elf',
      }),
    ).toEqual({ allowedOccupations: ['dwarf', 'human'], nameGeneratorSet: 'elf' });
  });

  /**
   * Anything unrecognisable is dropped rather than coerced. A config written by a build that spelled
   * these differently should fall back to the defaults, not roll a character from a field it
   * misread.
   */
  it('drops what it does not recognise', () => {
    expect(
      readDccCharacterGeneratorConfig({
        allowedOccupations: ['dwarf', 'gnome', 7],
        nameGeneratorSet: 42,
        namingGender: 'male',
      }),
    ).toEqual({ allowedOccupations: ['dwarf'] });
  });

  /**
   * Every table off is a setting the page cannot produce and the generator cannot honour, so it
   * reads as no preference rather than as an empty list a roll would then draw nothing from.
   */
  it('drops an allowed-occupations list that filters down to nothing', () => {
    expect(readDccCharacterGeneratorConfig({ allowedOccupations: ['gnome'] })).toEqual({});
    expect(readDccCharacterGeneratorConfig({ allowedOccupations: [] })).toEqual({});
    expect(readDccCharacterGeneratorConfig({})).toEqual({});
  });
});

describe('resolving the pattern set', () => {
  it('keeps a set this build has, and drops one it does not', () => {
    expect(resolveDccNameGeneratorSet('dwarf')).toBe('dwarf');
    expect(resolveDccNameGeneratorSet('a-set-nobody-has')).toBe('');
    expect(resolveDccNameGeneratorSet(undefined)).toBe('');
    expect(resolveDccNameGeneratorSet('')).toBe('');
  });
});

describe('rolling a DCC character', () => {
  /** Requirement 2.2, and the defect this module exists to fix: the clock is out of the roll. */
  it('gives the same character for the same seed and settings', () => {
    const config = { allowedOccupations: ['human' as const] };
    const first = rollDccCharacter('a-fixed-seed', config);
    const second = rollDccCharacter('a-fixed-seed', config);

    expect(second.character).toEqual(first.character);
    expect(second.nameGeneratorSet).toBe(first.nameGeneratorSet);
  });

  it('gives a different character for a different seed', () => {
    const first = rollDccCharacter('seed-one').character;
    const second = rollDccCharacter('seed-two').character;

    expect(`${second.firstName} ${second.lastName}`).not.toBe(
      `${first.firstName} ${first.lastName}`,
    );
  });

  /**
   * The name is drawn from a stream derived from the seed, so a naming choice cannot move the dice.
   * Without it, "same seed, same character" would hold only for one naming source.
   */
  it('does not let the naming source move the character’s dice', () => {
    const plain = rollDccCharacter('shared-seed', { allowedOccupations: ['human'] });
    const named = rollDccCharacter('shared-seed', {
      allowedOccupations: ['human'],
      nameGeneratorSet: 'dwarf',
    });

    expect(named.character.strength).toEqual(plain.character.strength);
    expect(named.character.hp).toBe(plain.character.hp);
    expect(named.character.occupation.name).toBe(plain.character.occupation.name);
    expect(named.character.luckyRoll.name).toBe(plain.character.luckyRoll.name);
  });

  it('rolls from only the tables it was given', () => {
    for (let seed = 0; seed < 20; seed += 1) {
      const { character } = rollDccCharacter(`dwarves-only-${seed}`, {
        allowedOccupations: ['dwarf'],
      });
      expect(character.occupation.name).toContain('dwarven');
    }
  });

  it('rolls from every table when it was given none', () => {
    const names = new Set(
      Array.from({ length: 40 }, (_entry, index) => rollDccCharacter(`any-${index}`).character)
        .map((character) => character.occupation.name)
        .filter((name) => !name.includes('dwarven') && !name.includes('elven')),
    );

    expect(names.size).toBeGreaterThan(0);
  });

  it('reports the pattern set it actually used, not the one that was asked for', () => {
    expect(
      rollDccCharacter('resolved', { nameGeneratorSet: 'a-set-nobody-has' }).nameGeneratorSet,
    ).toBe('');
    expect(rollDccCharacter('resolved', { nameGeneratorSet: 'elf' }).nameGeneratorSet).toBe('elf');
  });

  it('makes a zero-level character with at least one hit point', () => {
    for (let seed = 0; seed < 30; seed += 1) {
      const { character } = rollDccCharacter(`zero-level-${seed}`);
      expect(character.level).toBe(0);
      expect(character.hp).toBeGreaterThanOrEqual(1);
      expect(character.languages).toContain('Common');
    }
  });

  it('rolls a snapshot by the same path', () => {
    const config = { allowedOccupations: ['halfling' as const] };

    expect(rollDccCharacterSnapshot('paths-agree', config).occupation.name).toBe(
      rollDccCharacter('paths-agree', config).character.occupation.name,
    );
  });
});
