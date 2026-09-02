import { describe, expect, it } from 'vitest';
import { RNG } from '@ironarachne/rng';

import {
  emptyEcosystem,
  environmentFromSnapshot,
  environmentFromSnapshotWithRng,
  toEnvironmentSnapshot,
} from './environment_snapshot';
import { rollEnvironment } from './environment_roll';

/**
 * Requirement 7.2: `fromSnapshot(toSnapshot(x))` preserves everything that matters.
 *
 * For an environment that is everything, because every part of one is plain data. The single field
 * that is not stored is `dominantEcosystem`, and it comes back because it is `ecosystems[0]` — the
 * claim the approved domain model rests on, asserted here rather than assumed.
 */
const environment = rollEnvironment('round-trip-seed');

describe('an environment snapshot', () => {
  const snapshot = toEnvironmentSnapshot(environment);
  const restored = environmentFromSnapshot(snapshot);

  it('comes back exactly as it went in', () => {
    expect(restored).toEqual(environment);
  });

  it('does not store the dominant ecosystem twice', () => {
    expect('dominantEcosystem' in snapshot).toBe(false);
  });

  it('rebuilds the dominant ecosystem from the list', () => {
    expect(restored.dominantEcosystem).toEqual(environment.ecosystems[0]);
  });

  it('carries no functions into storage', () => {
    expect(() => structuredClone(snapshot)).not.toThrow();
  });

  it('reads back through the codec signature without drawing from the RNG', () => {
    // The RNG is handed over by the registry and deliberately unused: an environment is finished
    // when it is stored, and drawing from a seed on the way back would regenerate over an edit.
    const rng = new RNG('unused-seed');
    expect(environmentFromSnapshotWithRng(snapshot, rng)).toEqual(restored);
  });
});

describe('an environment stored with no ecosystems', () => {
  it('reads back with the empty one the generator itself produces', () => {
    const snapshot = { ...toEnvironmentSnapshot(environment), ecosystems: [] };
    expect(environmentFromSnapshot(snapshot).dominantEcosystem).toEqual(emptyEcosystem());
  });

  it('is the shape every environment on the site has today', () => {
    // `Ecosystems.generate` is a documented stub. If this ever fails, the sub-generator has been
    // written and the presentation's dropped Ecosystem section is now doing real work.
    expect(environment.dominantEcosystem).toEqual(emptyEcosystem());
  });
});
