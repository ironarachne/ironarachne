/**
 * The single path from a seed to a planet, and the record of how it was rolled.
 *
 * `PlanetGenerator.svelte` held the whole roll — the classification choice, the inhabited coin
 * flip, the civilization, the moon loop and the preview seed — in a component, threading one `RNG`
 * that it reseeded from the seed box on every press. That was close to requirement 2.2 and had two
 * holes. `getDefaultMoonGenerationConfig` seeded itself from the clock, so every moon in the system
 * was clock-driven; and the page's `onMount` called `generatePlanet` directly rather than
 * `generate`, so the planet a visitor met on arrival had no moons and no civilization however the
 * dice fell — a different kind of result from every one produced afterwards.
 *
 * Both are fixed by there being one roll, here, that the page and a re-roll from provenance both
 * take.
 */

import { RNG } from '@ironarachne/rng';

import {
  generateCivilization,
  getDefaultCivilizationGenerationConfig,
  type Civilization,
} from '$lib/civilizations';

import type { AstronomicalBody } from './astronomical_bodies.js';
import {
  generateMoon,
  getDefaultMoonGenerationConfig,
  getNumberOfMoonsForParent,
} from './moon/moons.js';
import { generatePlanet, getDefaultPlanetGenerationConfig } from './planet/planets.js';
import {
  getPlanetClassifications,
  searchPlanetClassificationByName,
} from './planet/planet_classifications.js';
import { toPlanetSnapshot, type PlanetSnapshot } from './planet_snapshot.js';

/** The page's value for a classification the seed picks. */
export const PLANET_ANY_CLASSIFICATION = 'random';

/** The population a generated world is drawn from, which is the page's own range. */
const PLANET_POPULATION_RANGE: [number, number] = [100_000, 1_000_000_000];

/** How likely a rolled planet is to be inhabited, in percent. */
const INHABITED_CHANCE = 30;

/** How likely a rolled planet is to have any moons at all, in percent. */
const HAS_MOONS_CHANCE = 50;

/** The rings chance a planet has when the page is not forcing them, from the library's default. */
const FORCED_RINGS_CHANCE = 100;

/**
 * What the generator records about how it rolled, and what a re-roll reads back.
 *
 * Stated as a type so the two ends — what is written as provenance and what a re-roll expects to
 * find — are in one place and drift loudly instead of quietly. It is the page's two controls and
 * nothing else. `classification` absent means the seed chose, as the page's "random" does.
 */
export type PlanetGeneratorConfigRecord = {
  classification?: string;
  forceRings?: boolean;
};

/** A rolled planet, its moons, and whoever lives there. */
export type PlanetRoll = {
  planet: AstronomicalBody;
  moons: AstronomicalBody[];
  /** Absent when nothing lives here, which is the usual case. */
  civilization?: Civilization;
};

/** Every classification the page offers, by name. */
export function planetClassificationNames(): string[] {
  return getPlanetClassifications().map((classification) => classification.name);
}

/**
 * Read a stored provenance config back into the settings a roll needs.
 *
 * A classification this build no longer has is dropped rather than passed through: the generator
 * would fall back to the whole table anyway, and recording a name nothing matches would make a
 * re-roll claim a setting it did not use.
 */
export function readPlanetGeneratorConfig(
  config: Record<string, unknown>,
): PlanetGeneratorConfigRecord {
  const named =
    typeof config.classification === 'string' &&
    planetClassificationNames().includes(config.classification)
      ? config.classification
      : undefined;
  return {
    ...(named === undefined ? {} : { classification: named }),
    ...(typeof config.forceRings === 'boolean' ? { forceRings: config.forceRings } : {}),
  };
}

/**
 * The seed the preview image is drawn from.
 *
 * Derived from the roll's seed rather than taken from the RNG after generation, so that a seed
 * reproduces what you saw, previews included — the same rule `starNationPreviewSeed` states for
 * its sibling. The page used to draw this after the moons, which made the picture depend on how
 * many moons happened to be rolled.
 */
export function planetPreviewSeed(seed: string): string {
  return `${seed}-preview`;
}

/** Roll a planet from a seed and a set of options — the one path the page and a re-roll take. */
export function rollPlanet(seed: string, config: PlanetGeneratorConfigRecord = {}): PlanetRoll {
  const rng = new RNG(seed);
  const classifications = getPlanetClassifications();

  const planetConfig = getDefaultPlanetGenerationConfig(rng);
  const chosen =
    config.classification === undefined
      ? undefined
      : searchPlanetClassificationByName(config.classification, classifications);
  planetConfig.possible_classifications = chosen === undefined ? classifications : [chosen];
  if (config.forceRings === true) {
    planetConfig.rings_chance = FORCED_RINGS_CHANCE;
  }

  const planet = generatePlanet(planetConfig);

  // Drawn before the moons so that adding or removing a moon cannot change whether anyone lives
  // here, which is what made the page's first planet differ from its second.
  const inhabited = rng.int(1, 100) < INHABITED_CHANCE;
  const civilization = inhabited ? rollCivilization(rng) : undefined;

  return {
    planet,
    moons: rollMoons(planet, rng),
    ...(civilization === undefined ? {} : { civilization }),
  };
}

function rollCivilization(rng: RNG): Civilization {
  const config = getDefaultCivilizationGenerationConfig(rng);
  config.population_range = PLANET_POPULATION_RANGE;
  return generateCivilization(config);
}

function rollMoons(planet: AstronomicalBody, rng: RNG): AstronomicalBody[] {
  const hasMoons = rng.int(1, 100) > HAS_MOONS_CHANCE;
  const count = hasMoons ? getNumberOfMoonsForParent(planet, rng) : 0;

  const moons: AstronomicalBody[] = [];
  for (let index = 0; index < count; index++) {
    const config = getDefaultMoonGenerationConfig(rng);
    config.parent_mass = planet.mass;
    config.parent_radius = planet.radius;
    config.parent_orbital_distance = planet.orbital_distance;
    moons.push(generateMoon(config));
  }
  return moons;
}

/**
 * Roll a fresh planet as a snapshot — the destructive half of editing (requirement 4.3), and what
 * `ARTIFACT_EDITORS` registers as this kind's roller.
 */
export function rollPlanetSnapshot(
  seed: string,
  config: PlanetGeneratorConfigRecord = {},
): PlanetSnapshot {
  return toPlanetSnapshot(rollPlanet(seed, config));
}
