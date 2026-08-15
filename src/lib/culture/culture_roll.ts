import { RNG } from '@ironarachne/rng';

import { getFantasyNameGeneratorSet } from '$lib/names';

import { generateCulture } from './culture_generation';
import { toCultureSnapshot, type CultureSnapshot } from './culture_snapshot';
import type { CultureReligionSource } from './culture_types';

/**
 * What the culture generator records about how it rolled, and what a re-roll reads back.
 *
 * It is the shape of the `config` on an artifact's provenance, described as a type rather than
 * read field by field at the call site, so that the two ends — what the generator writes and what
 * a re-roll expects — are stated in one place and drift loudly instead of quietly.
 */
export type CultureGeneratorConfigRecord = {
  /** The name pattern set the culture's names were built from. */
  nameGeneratorSet?: string;
  /** Whether the culture rolled its own religion or took a referenced one. */
  religionSource?: CultureReligionSource;
};

function isReligionSource(value: unknown): value is CultureReligionSource {
  return value === 'generate' || value === 'reference';
}

/**
 * Read a stored provenance config back into the settings a roll needs.
 *
 * Provenance is `Record<string, unknown>` because the store cannot know what any tool records in
 * it, so this is the boundary where that becomes typed. Anything unrecognisable is dropped rather
 * than coerced: a config written by a build that spelled these differently should fall back to the
 * defaults, not roll a culture from a field it misread.
 */
export function readCultureGeneratorConfig(
  config: Record<string, unknown>,
): CultureGeneratorConfigRecord {
  return {
    ...(typeof config.nameGeneratorSet === 'string' && config.nameGeneratorSet !== ''
      ? { nameGeneratorSet: config.nameGeneratorSet }
      : {}),
    ...(isReligionSource(config.religionSource) ? { religionSource: config.religionSource } : {}),
  };
}

/**
 * Roll a fresh culture from a seed and the settings it was first made with.
 *
 * The destructive half of editing (requirement 4.3), and the only path in the workshop that
 * regenerates a stored payload. It throws rather than substituting when the recorded name pattern
 * set is not one this build has: the editing framework catches that and keeps the artifact the
 * user still has on screen, which is a better answer than quietly rolling a culture whose names
 * come from somewhere else entirely.
 *
 * `religionSource` travels with it so that re-rolling a culture built around a referenced religion
 * produces another one that defers to that reference, rather than growing a religion of its own
 * beside a link that still points at one.
 */
export function rollCultureSnapshot(
  seed: string,
  config: CultureGeneratorConfigRecord = {},
): CultureSnapshot {
  const rng = new RNG(seed);
  const nameGenerators = getFantasyNameGeneratorSet(config.nameGeneratorSet ?? 'human', rng);
  return toCultureSnapshot(
    generateCulture(seed, {
      nameGenerators,
      religionSource: config.religionSource ?? 'generate',
    }),
  );
}
