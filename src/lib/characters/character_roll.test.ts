import { describe, expect, it } from 'vitest';

import {
  readCharacterGeneratorConfig,
  rollCharacter,
  rollCharacterSnapshot,
  CHARACTER_ANY,
} from './character_roll.js';

describe('reading a recorded config', () => {
  it('takes the fields it recognises', () => {
    expect(
      readCharacterGeneratorConfig({
        speciesName: 'elf',
        archetypeName: 'noble',
        genderName: 'Female',
        ageCategoryName: 'adult',
        nameGeneratorSet: 'dwarf',
        namingGender: 'male',
      }),
    ).toEqual({
      speciesName: 'elf',
      archetypeName: 'noble',
      genderName: 'Female',
      ageCategoryName: 'adult',
      nameGeneratorSet: 'dwarf',
      namingGender: 'male',
    });
  });

  /**
   * Anything unrecognisable is dropped rather than coerced. A config written by a build that
   * spelled these differently should fall back to the defaults, not roll a character from a field
   * it misread.
   */
  it('drops what it does not recognise', () => {
    expect(
      readCharacterGeneratorConfig({
        speciesName: 42,
        archetypeName: '',
        namingGender: 'neither',
        somethingElse: 'ignored',
      }),
    ).toEqual({});
  });
});

describe('rolling a character', () => {
  /** Requirement 2.2, and the defect this module exists to fix: the clock is out of the roll. */
  it('gives the same character for the same seed and settings', () => {
    const config = { speciesName: 'elf', archetypeName: 'noble', genderName: 'female' };
    const first = rollCharacter('a-fixed-seed', config);
    const second = rollCharacter('a-fixed-seed', config);

    expect(second.character).toEqual(first.character);
    expect(second.nameGeneratorSet).toBe(first.nameGeneratorSet);
  });

  it('gives a different character for a different seed', () => {
    expect(rollCharacter('seed-one').character.name).not.toBe(
      rollCharacter('seed-two').character.name,
    );
  });

  /**
   * The name has a stream of its own, so choosing where names come from cannot shift the rest of
   * the character. Without it, "same seed, same character" holds only for one naming source.
   */
  it('does not let the naming source move the character’s body', () => {
    const plain = rollCharacter('shared-seed', { speciesName: 'human' });
    const named = rollCharacter('shared-seed', { speciesName: 'human', nameGeneratorSet: 'dwarf' });

    expect(named.character.height).toBe(plain.character.height);
    expect(named.character.weight).toBe(plain.character.weight);
    expect(named.character.physicalTraits).toEqual(plain.character.physicalTraits);
    expect(named.character.name).not.toBe(plain.character.name);
  });

  it('honours the species, archetype and gender it was asked for', () => {
    const { character } = rollCharacter('asked-for', {
      speciesName: 'dwarf',
      archetypeName: 'noble',
      genderName: 'female',
    });

    expect(character.species.name).toBe('dwarf');
    expect(character.archetype?.name).toBe('noble');
    expect(character.gender.name).toBe('female');
  });

  it('treats the generator’s own “Random” as no choice at all', () => {
    const { character } = rollCharacter('any-of-them', {
      speciesName: CHARACTER_ANY,
      archetypeName: CHARACTER_ANY,
      genderName: CHARACTER_ANY,
      ageCategoryName: CHARACTER_ANY,
    });

    expect(character.name).not.toBe('');
  });

  it('keeps the displayed name in step with its two halves', () => {
    const { character } = rollCharacter('in-step');

    expect(character.name).toBe(`${character.firstName} ${character.lastName}`);
  });

  it('reports the pattern set it actually used, not the one that was asked for', () => {
    const { nameGeneratorSet, substitutions } = rollCharacter('resolved', {
      speciesName: 'human',
      nameGeneratorSet: 'a-set-nobody-has',
    });

    expect(nameGeneratorSet).toBe('human');
    expect(substitutions).toContain('nameGeneratorSet');
  });

  /**
   * Decision 3 of docs/fantasy-character.md. A placeholder species has empty tables, so rolling
   * from one would produce a character out of nothing; the roll falls back and says which part it
   * substituted, which is what the editing surface tells the user after a re-roll.
   */
  it('falls back to the default species rather than rolling out of empty tables', () => {
    const { character, substitutions } = rollCharacter('gone', { speciesName: 'Thrennish' });

    expect(character.species.name).toBe('human');
    expect(substitutions).toContain('species');
  });

  it('widens back to every archetype when the recorded one has gone', () => {
    const { substitutions } = rollCharacter('gone-too', { archetypeName: 'lamplighter-royal' });

    expect(substitutions).toContain('archetype');
  });

  it('rolls a snapshot by the same path', () => {
    const config = { speciesName: 'halfling' };

    expect(rollCharacterSnapshot('paths-agree', config).name).toBe(
      rollCharacter('paths-agree', config).character.name,
    );
  });

  /**
   * Every species in the list, because `generate` reaches for a name pattern set to name a noble's
   * lands and most species have none of their own. A noble aarakocra used to take the whole roll
   * down with an unavailable-pattern-set error.
   */
  it('rolls a noble of every species without throwing', () => {
    const speciesNames = ['aarakocra', 'tabaxi', 'tortle', 'human', 'elf', 'dwarf'];

    for (const speciesName of speciesNames) {
      expect(() =>
        rollCharacter(`noble-${speciesName}`, { speciesName, archetypeName: 'noble' }),
      ).not.toThrow();
    }
  });
});
