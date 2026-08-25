import { RNG } from '@ironarachne/rng';
import { describe, expect, it } from 'vitest';

import {
  readAdndCharacterGeneratorConfig,
  rollAdndCharacter,
  rollAdndCharacterSnapshot,
} from './adnd_character_roll.js';
import { generateCharacter } from './adndcharactergenerator.js';
import { getDefaultConfig } from './adndcharactergeneratorconfig.js';

describe('rollAdndCharacter', () => {
  it('is deterministic for a seed and configuration', () => {
    // Requirement 2.2, and the reason this function exists rather than a config assembled in the
    // page: determinism that depends on nobody editing a Svelte component is not determinism.
    const first = rollAdndCharacter('same-seed', { includeProficiencies: true, includeKits: true });
    const second = rollAdndCharacter('same-seed', {
      includeProficiencies: true,
      includeKits: true,
    });

    expect(second.character).toEqual(first.character);
  });

  it('names deterministically too, which the page did not', () => {
    // The name used to come off a clock-seeded RNG, so a locked seed reproduced the body and a
    // different name every time.
    const first = rollAdndCharacter('named-seed', { nameGeneratorSet: 'human' });
    const second = rollAdndCharacter('named-seed', { nameGeneratorSet: 'human' });

    expect(first.character.firstName).not.toBe('');
    expect(second.character.firstName).toBe(first.character.firstName);
    expect(second.character.lastName).toBe(first.character.lastName);
  });

  it('gives different seeds different characters', () => {
    const a = rollAdndCharacter('seed-a');
    const b = rollAdndCharacter('seed-b');

    expect(b.character).not.toEqual(a.character);
  });

  it('leaves a character unnamed when no pattern set was asked for', () => {
    // The generator's naming control defaults to offering none, and "a level 1 elf thief" is a
    // usable character. Absent means do not name, not pick one for me.
    const rolled = rollAdndCharacter('unnamed');

    expect(rolled.character.firstName).toBe('');
    expect(rolled.nameGeneratorSet).toBe('');
  });

  it('drops a pattern set this build no longer has rather than substituting one', () => {
    const rolled = rollAdndCharacter('gone', { nameGeneratorSet: 'a-set-that-was-removed' });

    expect(rolled.nameGeneratorSet).toBe('');
    expect(rolled.character.firstName).toBe('');
  });

  it('reports the set it actually used, so provenance records what happened', () => {
    const rolled = rollAdndCharacter('reported', { nameGeneratorSet: 'human' });

    expect(rolled.nameGeneratorSet).toBe('human');
  });

  it('honours the naming gender', () => {
    const male = rollAdndCharacter('gendered', { nameGeneratorSet: 'human', namingGender: 'male' });
    const female = rollAdndCharacter('gendered', {
      nameGeneratorSet: 'human',
      namingGender: 'female',
    });

    expect(male.character.firstName).not.toBe(female.character.firstName);
  });

  it('applies the proficiency and kit switches', () => {
    const plain = rollAdndCharacter('switches');
    const loaded = rollAdndCharacter('switches', {
      includeProficiencies: true,
      includeKits: true,
    });

    expect(plain.character.weaponProficiencyGroups).toEqual([]);
    expect(loaded.character.weaponProficiencyGroups.length).toBeGreaterThan(0);
  });
});

describe('rollAdndCharacterSnapshot', () => {
  it('produces a snapshot rather than a live character', () => {
    const snapshot = rollAdndCharacterSnapshot('snap', { nameGeneratorSet: 'human' });

    expect(typeof snapshot.raceName).toBe('string');
    expect(snapshot).not.toHaveProperty('race');
    expect(() => structuredClone(snapshot)).not.toThrow();
  });

  it('reproduces the same character on a re-roll', () => {
    const config = { nameGeneratorSet: 'human', includeKits: true };

    expect(rollAdndCharacterSnapshot('reroll', config)).toEqual(
      rollAdndCharacterSnapshot('reroll', config),
    );
  });
});

describe('readAdndCharacterGeneratorConfig', () => {
  it('reads what a tool stored', () => {
    expect(
      readAdndCharacterGeneratorConfig({
        nameGeneratorSet: 'human',
        namingGender: 'female',
        includeProficiencies: true,
        includeKits: false,
      }),
    ).toEqual({
      nameGeneratorSet: 'human',
      namingGender: 'female',
      includeProficiencies: true,
      includeKits: false,
    });
  });

  it('drops what it does not recognise rather than coercing it', () => {
    // A config written by a build that spelled these differently should fall back to the
    // defaults, not roll a character from a field it misread.
    expect(
      readAdndCharacterGeneratorConfig({
        nameGeneratorSet: 42,
        namingGender: 'enby-but-not-a-valid-value',
        includeProficiencies: 'yes',
        somethingElse: true,
      }),
    ).toEqual({});
  });

  it('treats an empty pattern set as absent', () => {
    expect(readAdndCharacterGeneratorConfig({ nameGeneratorSet: '' })).toEqual({});
  });

  it('reads an empty config', () => {
    expect(readAdndCharacterGeneratorConfig({})).toEqual({});
  });
});

describe('rolling a character the dice qualify for no class', () => {
  it('rolls again instead of crashing', () => {
    // These four seeds threw `Cannot read properties of undefined (reading 'apply')` before the
    // retry existed: `getClassOptionsForRace` came back empty and `rng.item([])` gave undefined.
    // Two of them had a race that would have worked; two rolled stats no class takes under any
    // race, which is the case the PHB answers by telling you to roll again.
    for (const seed of ['golden-18', 'golden-138', 'golden-171', 'golden-252']) {
      const config = getDefaultConfig(new RNG(seed));

      expect(() => generateCharacter(config)).not.toThrow();
      expect(generateCharacter(getDefaultConfig(new RNG(seed))).class.name).not.toBe('');
    }
  });

  it('produces a class for every seed across a wide sweep', () => {
    for (let seed = 0; seed < 400; seed += 1) {
      const character = generateCharacter(getDefaultConfig(new RNG(`sweep-${seed}`)));

      expect(character.class).toBeDefined();
      expect(character.race).toBeDefined();
    }
  });
});
