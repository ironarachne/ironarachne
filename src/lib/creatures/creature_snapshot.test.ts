import { describe, expect, it } from 'vitest';

import { nonSentient } from '$lib/species';

import { toStoredCreature, validateStoredCreature } from './creature_snapshot.js';
import { creatureFromStored, placeholderSpecies } from './creature_rehydrate.js';
import { generate, getDefaultCreatureGenerationConfig } from './creatures.js';

function rollCreature(seed: string) {
  const config = getDefaultCreatureGenerationConfig();
  config.speciesOptions = [nonSentient()[0]];
  return generate(seed, config);
}

const creature = rollCreature('stored-creature-fixture');

describe('toStoredCreature', () => {
  it('writes the species as its name and keeps everything else', () => {
    const stored = toStoredCreature(creature);

    expect(stored.speciesName).toBe(creature.species.name);
    expect('species' in stored).toBe(false);
    expect(stored.height).toBe(creature.height);
    expect(stored.physicalTraits).toEqual(creature.physicalTraits);
  });

  /** Requirement 7.2, one level down: the encounter's round trip is this one, per creature. */
  it('round-trips through the rehydrate half', () => {
    expect(creatureFromStored(toStoredCreature(creature))).toEqual(creature);
  });

  it('is free of the functions IndexedDB refuses', () => {
    expect(() => structuredClone(toStoredCreature(creature))).not.toThrow();
  });
});

describe('creatureFromStored', () => {
  it('resolves a species this build has, sentient or not', () => {
    const restored = creatureFromStored({ ...toStoredCreature(creature), speciesName: 'human' });

    expect(restored.species.name).toBe('human');
    expect(restored.species.ageCategories.length).toBeGreaterThan(0);
  });

  /** 3.3 one level down: a species this build no longer has is a placeholder, not a refusal. */
  it('falls back to an inert placeholder for a species this build does not have', () => {
    const restored = creatureFromStored({
      ...toStoredCreature(creature),
      speciesName: 'thrennish hound',
    });

    expect(restored.species).toEqual(placeholderSpecies('thrennish hound'));
    expect(restored.height).toBe(creature.height);
  });
});

describe('placeholderSpecies', () => {
  it('carries the name and derives the words prose reads from it', () => {
    const species = placeholderSpecies('thrennish');

    expect(species.name).toBe('thrennish');
    expect(species.adjective).toBe('thrennish');
    expect(species.pluralName).toBe('thrennishs');
    expect(species.ageCategories).toEqual([]);
  });
});

describe('validateStoredCreature', () => {
  const stored = JSON.parse(JSON.stringify(toStoredCreature(creature))) as Record<string, unknown>;

  it('accepts a creature the generator produced', () => {
    expect(validateStoredCreature(stored).ok).toBe(true);
  });

  it('rejects something that is not an object', () => {
    for (const payload of [null, 'wolf', 3, []]) {
      expect(validateStoredCreature(payload).ok).toBe(false);
    }
  });

  it('rejects a creature missing a string field, a number, a list or a named record', () => {
    for (const field of [
      'id',
      'name',
      'speciesName',
      'age',
      'height',
      'tags',
      'behaviors',
      'creatureTypes',
      'gender',
      'ageCategory',
      'physicalTraits',
      'abilities',
      'carried',
    ]) {
      const broken = { ...stored };
      delete broken[field];
      expect(validateStoredCreature(broken).ok, field).toBe(false);
    }
  });

  it('rejects a list that holds something unnamed', () => {
    expect(validateStoredCreature({ ...stored, abilities: [{ description: 'bites' }] }).ok).toBe(
      false,
    );
    expect(validateStoredCreature({ ...stored, tags: [1] }).ok).toBe(false);
  });
});
