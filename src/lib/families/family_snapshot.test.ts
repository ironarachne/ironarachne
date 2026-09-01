import { describe, expect, it } from 'vitest';

import { RNG } from '@ironarachne/rng';

import { familyFromSnapshot } from './family_rehydrate.js';
import { rollFamily } from './family_roll.js';
import { toFamilySnapshot } from './family_snapshot.js';

/** A real multi-generation family, as issue #55 asks — not a couple and a child. */
const { family } = rollFamily('snapshot-fixture', {
  speciesName: 'human',
  generations: 4,
  allowAdoption: true,
  adoptionChance: 0.5,
});

/** Everything but the generators, which are closures and compare by identity. */
function comparable(value: typeof family) {
  const { femaleNameGenerator: _f, maleNameGenerator: _m, ...rest } = value;
  return rest;
}

describe('the family snapshot', () => {
  it('has a fixture worth testing', () => {
    expect(family.members.length).toBeGreaterThan(3);
    expect(family.relationships.some((r) => r.type.name === 'spouse')).toBe(true);
    expect(family.relationships.some((r) => r.type.name === 'parent')).toBe(true);
  });

  /** Requirement 7.2: lossless for everything the page shows. */
  it('round-trips a multi-generation family', () => {
    const restored = familyFromSnapshot(toFamilySnapshot(family), new RNG('unused'));

    expect(comparable(restored)).toEqual(comparable(family));
  });

  it('round-trips a family with nobody in it, which is an ordinary state', () => {
    const empty = { ...family, members: [], memberIds: [], relationships: [] };
    const restored = familyFromSnapshot(toFamilySnapshot(empty), new RNG('unused'));

    expect(restored.members).toEqual([]);
    expect(restored.relationships).toEqual([]);
    expect(restored.name).toBe(family.name);
  });

  it('stores a member’s species as its name', () => {
    const stored = toFamilySnapshot(family).members[0];

    expect(stored.speciesName).toBe('human');
    expect('species' in stored).toBe(false);
  });

  /** The name generators are the closures; they become pattern sources and come back working. */
  it('stores the name generators as patterns and rebuilds ones that name', () => {
    const snapshot = toFamilySnapshot(family);
    const restored = familyFromSnapshot(snapshot, new RNG('names'));

    expect(typeof snapshot.namePatterns.female).toBe('object');
    expect(restored.femaleNameGenerator.generate(1)[0]).not.toBe('');
    expect(restored.maleNameGenerator.generate(1)[0]).not.toBe('');
  });

  it('rebuilds the same names from the same RNG', () => {
    const snapshot = toFamilySnapshot(family);

    expect(familyFromSnapshot(snapshot, new RNG('same')).femaleNameGenerator.generate(3)).toEqual(
      familyFromSnapshot(snapshot, new RNG('same')).femaleNameGenerator.generate(3),
    );
  });

  /** The cycles worry: two people who are each other's kin, stored flat. */
  it('is free of the functions and cycles IndexedDB refuses', () => {
    expect(() => structuredClone(toFamilySnapshot(family))).not.toThrow();
    expect(() => JSON.stringify(toFamilySnapshot(family))).not.toThrow();
  });

  it('keeps a name a user has changed rather than recomputing it', () => {
    const edited = toFamilySnapshot(family);
    edited.members[0].firstName = 'Tam';

    expect(familyFromSnapshot(edited, new RNG('unused')).members[0].firstName).toBe('Tam');
  });

  it('does not hand out the lists it was given', () => {
    const snapshot = toFamilySnapshot(family);
    snapshot.memberIds.push('someone');
    snapshot.relationships.pop();

    expect(family.memberIds).not.toContain('someone');
    expect(family.relationships.length).toBe(snapshot.relationships.length + 1);
  });
});
