import { describe, expect, it } from 'vitest';

import {
  characterFromSnapshot,
  isUnknownSpeciesName,
  placeholderSpecies,
  speciesFromStoredName,
} from './character_rehydrate.js';
import { rollCharacter } from './character_roll.js';
import { toCharacterSnapshot, toStoredCharacter } from './character_snapshot.js';
import type { Character } from './character_types.js';

/**
 * A generated character of a given shape, found by sweeping seeds.
 *
 * Sweeping rather than hand-building, because the point of a round-trip test is that a character
 * the generator actually produces survives, and a hand-built one only proves the fields the test
 * author remembered to set.
 */
function rollMatching(
  predicate: (character: Character) => boolean,
  config: Parameters<typeof rollCharacter>[1] = {},
): Character {
  for (let seed = 0; seed < 200; seed += 1) {
    const { character } = rollCharacter(`roundtrip-${seed}`, config);
    if (predicate(character)) {
      return character;
    }
  }
  throw new Error('no seed in the sweep produced a character of that shape');
}

describe('character snapshot', () => {
  /** Requirement 7.2: the snapshot is lossless for everything the sheet shows. */
  it('round-trips a generated character', () => {
    const character = rollMatching(() => true);
    const restored = characterFromSnapshot(toCharacterSnapshot(character));

    expect(restored.name).toBe(character.name);
    expect(restored.firstName).toBe(character.firstName);
    expect(restored.lastName).toBe(character.lastName);
    expect(restored.description).toBe(character.description);
    expect(restored.shortDescription).toBe(character.shortDescription);
    expect(restored.age).toBe(character.age);
    expect(restored.height).toBe(character.height);
    expect(restored.weight).toBe(character.weight);
    expect(restored.length).toBe(character.length);
    expect(restored.gender).toEqual(character.gender);
    expect(restored.ageCategory).toEqual(character.ageCategory);
    expect(restored.personalityTraits).toEqual(character.personalityTraits);
    expect(restored.physicalTraits).toEqual(character.physicalTraits);
    expect(restored.abilities).toEqual(character.abilities);
    expect(restored.carried).toEqual(character.carried);
    expect(restored.tags).toEqual(character.tags);
  });

  it('resolves the species back from its name, tables and all', () => {
    const character = rollMatching((rolled) => rolled.species.name === 'human');
    const restored = characterFromSnapshot(toCharacterSnapshot(character));

    expect(restored.species).toEqual(character.species);
  });

  it('gives an archetype its equipment tables back', () => {
    const character = rollMatching(
      (rolled) => (rolled.archetype?.equipmentGenerationConfigs.length ?? 0) > 0,
    );
    const snapshot = toCharacterSnapshot(character);
    const restored = characterFromSnapshot(snapshot);

    // Dropped on the way out — they are what the character was rolled *from*, and 66 KB of it.
    expect(snapshot.archetype).not.toHaveProperty('equipmentGenerationConfigs');
    expect(restored.archetype).toEqual(character.archetype);
  });

  it('redraws a noble’s arms from the names of their parts', () => {
    const character = rollMatching((rolled) => rolled.heraldry !== undefined, {
      archetypeName: 'noble',
    });
    const restored = characterFromSnapshot(toCharacterSnapshot(character));

    expect(restored.heraldry?.blazon).toBe(character.heraldry?.blazon);
    expect(restored.heraldry?.device.field.name).toBe(character.heraldry?.device.field.name);
    expect(restored.heraldry?.device.chargeGroups.map((group) => group.charge.name)).toEqual(
      character.heraldry?.device.chargeGroups.map((group) => group.charge.name),
    );
  });

  /**
   * The value that says "these arms are a record of their own". Requirement 5.2, and decision 4 of
   * docs/fantasy-character.md: copying them in would fork them at the moment of saving.
   */
  it('stores referenced arms as null rather than as a copy', () => {
    const character = rollMatching((rolled) => rolled.heraldry !== undefined, {
      archetypeName: 'noble',
    });
    const snapshot = toCharacterSnapshot(character, true);

    expect(snapshot.heraldry).toBeNull();
    expect(characterFromSnapshot(snapshot).heraldry).toBeUndefined();
  });

  it('is free of the functions IndexedDB refuses', () => {
    const character = rollMatching((rolled) => rolled.heraldry !== undefined, {
      archetypeName: 'noble',
    });

    expect(() => structuredClone(toCharacterSnapshot(character))).not.toThrow();
  });

  it('leaves a character with no arms carrying none', () => {
    const character = rollMatching((rolled) => rolled.heraldry === undefined);
    const snapshot = toStoredCharacter(character);

    expect(snapshot).not.toHaveProperty('heraldry');
  });
});

describe('an unknown species', () => {
  /**
   * Decision 3 of docs/fantasy-character.md: a name this build no longer has becomes a placeholder
   * rather than retiring the character. Everything the sheet prints is already in the payload.
   */
  it('comes back as an inert placeholder carrying the stored name', () => {
    const species = speciesFromStoredName('Thrennish');

    expect(species.name).toBe('Thrennish');
    expect(species.adjective).toBe('Thrennish');
    expect(species.ageCategories).toEqual([]);
    expect(species.sizeGeneratorConfigMatrix).toEqual([]);
    expect(placeholderSpecies('Thrennish')).toEqual(species);
  });

  it('is reported as unknown, so a re-roll can decline to use it', () => {
    expect(isUnknownSpeciesName('Thrennish')).toBe(true);
    expect(isUnknownSpeciesName('human')).toBe(false);
  });

  it('keeps every number the character was saved with', () => {
    const character = rollMatching(() => true);
    const restored = characterFromSnapshot({
      ...toCharacterSnapshot(character),
      speciesName: 'Thrennish',
    });

    expect(restored.species.name).toBe('Thrennish');
    expect(restored.height).toBe(character.height);
    expect(restored.weight).toBe(character.weight);
    expect(restored.physicalTraits).toEqual(character.physicalTraits);
  });
});
