/**
 * Writing an environment for storage, and reading one back.
 *
 * Both halves live here rather than in a `*_rehydrate.ts` beside it, and that is the rule the pass
 * states rather than an omission: the split exists only where reading pulls a heavy dependency the
 * writing side does not — species tables, archetype equipment, charge art. Reading an environment
 * pulls nothing. Every part of one is a plain record of strings, numbers and number arrays, so the
 * conversion is a copy in both directions.
 *
 * **`dominantEcosystem` is not stored, and is rebuilt from the list.** A live `Environment` carries
 * both `dominantEcosystem` and `ecosystems`, and the generator sets the first to the first entry of
 * the second — they are the same object, so storing both would write the same ecosystem twice and
 * invite the two to drift the day something edits one of them. This is the shape the approved
 * domain model in docs/readiness-locations.md declares. An environment stored with no ecosystems at
 * all reads back with the empty one `Ecosystems.generate` itself returns, which is what every
 * environment on the site has today.
 *
 * The final `stripFunctionValuesDeep` is a net rather than the mechanism, as it is for a settlement
 * or an encounter: nothing in an environment is expected to carry a closure, and the strip is what
 * keeps one grown somewhere new from turning a save into a `DataCloneError`.
 */

import type { RNG } from '@ironarachne/rng';

import { stripFunctionValuesDeep } from '$lib/persistent_save';

import type Ecosystem from './ecosystems/ecosystem.js';
import type Environment from './environment.js';

/** An environment as it is stored. */
export type EnvironmentSnapshot = Omit<Environment, 'dominantEcosystem'>;

/** The ecosystem an environment falls back to: the one `Ecosystems.generate` returns today. */
export function emptyEcosystem(): Ecosystem {
  return { name: '', description: '', fauna: [], flora: [] };
}

export function toEnvironmentSnapshot(environment: Environment): EnvironmentSnapshot {
  const { dominantEcosystem: _dominant, ...rest } = environment;
  return stripFunctionValuesDeep(rest) as EnvironmentSnapshot;
}

export function environmentFromSnapshot(snapshot: EnvironmentSnapshot): Environment {
  return {
    ...snapshot,
    dominantEcosystem: snapshot.ecosystems[0] ?? emptyEcosystem(),
  };
}

/**
 * The codec's reading half, with the signature the registry hands it.
 *
 * The RNG is unused, and that is the correct amount of use for it: an environment is finished when
 * it is stored, and drawing anything from a seed on the way back would be regenerating over the
 * user's edits.
 */
export function environmentFromSnapshotWithRng(
  snapshot: EnvironmentSnapshot,
  _rng: RNG,
): Environment {
  return environmentFromSnapshot(snapshot);
}
