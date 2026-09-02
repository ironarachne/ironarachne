/**
 * The single path from a seed to a star system, and the record of how it was rolled.
 *
 * `StarSystemGenerator.svelte` was the closest thing in the readiness pass to a page that already
 * did this: `getDefaultStarSystemGeneratorConfig` takes its RNG, the preview seeds are derived
 * from the page's seed rather than drawn, and `applySystemConfig` was written so the mount path and
 * the button path agree. What it lacked was a record — the planet count and the star type sat in
 * component state that nothing wrote down, so a saved system could not say what produced it.
 *
 * The planet count deserves a note. When the page is left on "Random" the count is drawn from the
 * seed, and the draw happens *before* the system is generated, so it is part of the same stream.
 * Recording the resolved count rather than "random" would make a re-roll reproduce the count and
 * then generate a different system with it, because the draw would no longer have happened.
 */

import { RNG } from '@ironarachne/rng';

import type { AstronomicalBody } from './astronomical_bodies.js';
import { getPlanetClassifications } from './planet/planet_classifications.js';
import {
  getStarClassifications,
  searchStarClassificationsByName,
} from './star/star_classifications.js';
import {
  generateStarSystem,
  getDefaultStarSystemGeneratorConfig,
  type StarSystem,
} from './star_systems.js';
import { toStarSystemSnapshot, type StarSystemSnapshot } from './star_system_snapshot.js';

/** The page's value for a setting the seed picks. */
export const STAR_SYSTEM_ANY = 'random';

/** The most planets the page's control offers. */
export const STAR_SYSTEM_MAX_PLANET_COUNT = 20;

/**
 * What the generator records about how it rolled, and what a re-roll reads back.
 *
 * Stated as a type so the two ends — what is written as provenance and what a re-roll expects to
 * find — are in one place and drift loudly instead of quietly. It is the page's two controls and
 * nothing else. Either field absent means the seed chose, as the page's "Random" does.
 */
export type StarSystemGeneratorConfigRecord = {
  planetCount?: number;
  starType?: string;
};

/** Every star type the page offers, by name. */
export function starTypeNames(): string[] {
  return getStarClassifications().map((classification) => classification.name);
}

/**
 * Read a stored provenance config back into the settings a roll needs.
 *
 * A planet count outside what the page offers, or a star type this build no longer has, falls back
 * to the seed's own choice rather than being coerced: a re-roll from a setting nothing matches
 * would claim a system was built to a specification it was not.
 */
export function readStarSystemGeneratorConfig(
  config: Record<string, unknown>,
): StarSystemGeneratorConfigRecord {
  const count = config.planetCount;
  const planetCount =
    typeof count === 'number' &&
    Number.isInteger(count) &&
    count >= 1 &&
    count <= STAR_SYSTEM_MAX_PLANET_COUNT
      ? count
      : undefined;
  const starType =
    typeof config.starType === 'string' && starTypeNames().includes(config.starType)
      ? config.starType
      : undefined;

  return {
    ...(planetCount === undefined ? {} : { planetCount }),
    ...(starType === undefined ? {} : { starType }),
  };
}

/** The seed one of a system's preview images is drawn from. */
export function starSystemPreviewSeed(seed: string, part: string): string {
  return `${seed}:${part}`;
}

/**
 * Roll a star system from a seed and a set of options — the one path the page and a re-roll take.
 *
 * The order of the draws is the page's: the config's own planet-count draw happens as the config is
 * built, and the system is generated from the RNG in the state that left it.
 */
export function rollStarSystem(
  seed: string,
  config: StarSystemGeneratorConfigRecord = {},
): StarSystem {
  const rng = new RNG(seed);
  const generatorConfig = getDefaultStarSystemGeneratorConfig(rng);

  if (config.planetCount !== undefined) {
    generatorConfig.planet_count = config.planetCount;
  }
  generatorConfig.planet_classifications = getPlanetClassifications();
  generatorConfig.star_classifications =
    config.starType === undefined
      ? getStarClassifications()
      : searchStarClassificationsByName(config.starType, getStarClassifications());

  return generateStarSystem(generatorConfig);
}

/**
 * Put a saved planet into a system in place of one it rolled — requirement 5.1.
 *
 * The referenced planet takes the outermost slot and the list is re-sorted by orbital distance, so
 * it sits where its own orbit puts it rather than being appended past the edge of the system. The
 * body is *not* renamed: it is somebody's saved planet, and renaming it to "Kepler IV" to match its
 * new neighbours would be this tool editing another artifact's contents.
 *
 * A system with no planets is handed back with the reference as its only one, which is the honest
 * answer rather than a refusal: a user who asked for a one-planet system built from a saved planet
 * has described exactly that.
 */
export function withReferencedPlanet(system: StarSystem, planet: AstronomicalBody): StarSystem {
  const planets = [...system.planets.slice(0, Math.max(0, system.planets.length - 1)), planet].sort(
    (left, right) => left.orbital_distance - right.orbital_distance,
  );

  return {
    ...system,
    planets,
    planet_count: planets.length,
  };
}

/**
 * Roll a fresh system as a snapshot — the destructive half of editing (requirement 4.3), and what
 * `ARTIFACT_EDITORS` registers as this kind's roller.
 */
export function rollStarSystemSnapshot(
  seed: string,
  config: StarSystemGeneratorConfigRecord = {},
): StarSystemSnapshot {
  return toStarSystemSnapshot(rollStarSystem(seed, config));
}
