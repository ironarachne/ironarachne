/**
 * The single path from a seed to a region, and the record of how it was rolled.
 *
 * `RegionGenerator.svelte` held one `RNG` that it reseeded from the seed box on every press and
 * threaded into a config built once at module load. That was closer to requirement 2.2 than most
 * of the pass, and it had two holes. `Regions.getDefaultConfig` seeded *both* its RNG and its
 * fallback name generator set from `Date.now()`, so a caller that overwrote the first still got a
 * clock-driven name set; and nothing wrote down which name set was used, so a saved region could
 * not say what produced it.
 *
 * A referenced culture is not part of this config. It is an artifact reference beside the payload,
 * the position `$lib/organizations` takes for referenced arms: a re-roll draws its own names rather
 * than reaching back into a culture that may since have changed.
 */

import { RNG } from '@ironarachne/rng';

import type { Culture } from '$lib/culture';
import * as Names from '$lib/names';

import { generate, getDefaultConfig } from './regions.js';
import type Region from './region.js';
import { toRegionSnapshot, type RegionSnapshot } from './region_snapshot.js';

/** The page's value for a name set the seed picks. */
export const REGION_ANY_NAME_SET = 'any';

/**
 * What the generator records about how it rolled, and what a re-roll reads back.
 *
 * Stated as a type so the two ends — what is written as provenance and what a re-roll expects to
 * find — are in one place and drift loudly instead of quietly. `nameSet` is the *resolved* set, so
 * a re-roll reproduces the names rather than redrawing which set to use; absent means the region
 * was named from a culture the payload does not own.
 */
export type RegionGeneratorConfigRecord = {
  nameSet?: string;
};

/** Every name set the page offers, by name. */
export function regionNameSetNames(rng: RNG = new RNG('region-name-sets')): string[] {
  return Names.getAllFantasyNameGeneratorSets(rng).map((set) => set.name);
}

/**
 * Read a stored provenance config back into the settings a roll needs.
 *
 * A name set this build no longer has falls back to the seed's own choice rather than being
 * coerced: a re-roll from a set nothing matches would claim a region was named from a table it was
 * not.
 */
export function readRegionGeneratorConfig(
  config: Record<string, unknown>,
): RegionGeneratorConfigRecord {
  const named =
    typeof config.nameSet === 'string' && regionNameSetNames().includes(config.nameSet)
      ? config.nameSet
      : undefined;
  return named === undefined ? {} : { nameSet: named };
}

/** A rolled region, and the name set it actually used — which is what provenance records. */
export type RegionRoll = {
  region: Region;
  nameSet: string;
};

/**
 * Roll a region from a seed and a set of options — the one path the page and a re-roll take.
 *
 * A supplied culture brings its own names, so the name set is that culture's and the record says
 * nothing: the culture is a reference, and it is what a reader should follow to find the names.
 */
export function rollRegion(
  seed: string,
  config: RegionGeneratorConfigRecord = {},
  culture: Culture | null = null,
): RegionRoll {
  const rng = new RNG(seed);
  const generatorConfig = getDefaultConfig(rng);
  const sets = Names.getAllFantasyNameGeneratorSets(rng);

  const chosen =
    config.nameSet === undefined
      ? rng.item(sets)
      : (sets.find((set) => set.name === config.nameSet) ?? rng.item(sets));

  generatorConfig.nameGeneratorSet = chosen;
  generatorConfig.dominantCulture = culture;

  const region = generate(generatorConfig);
  return { region, nameSet: culture === null ? chosen.name : culture.nameGenerators.name };
}

/**
 * Roll a fresh region as a snapshot — the destructive half of editing (requirement 4.3), and what
 * `ARTIFACT_EDITORS` registers as this kind's roller.
 *
 * A re-roll never wears a referenced culture, for the reason the header gives.
 */
export function rollRegionSnapshot(
  seed: string,
  config: RegionGeneratorConfigRecord = {},
): RegionSnapshot {
  return toRegionSnapshot(rollRegion(seed, config).region);
}
