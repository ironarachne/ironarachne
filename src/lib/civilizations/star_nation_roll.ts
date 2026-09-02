/**
 * The single path from a seed to a star nation, and the record of how it was rolled.
 *
 * Requirement 2.2 of docs/workshop.md wants the same seed and settings to give the same result.
 * `StarNationGenerator.svelte` came close — it threaded one RNG through every config — but the
 * configs it threaded it through each seeded themselves from `Date.now()` first, and the preview
 * image took a seed drawn after generation rather than derived from the page's. Here every draw
 * comes from one RNG made from the seed, and the helpers it calls take that RNG rather than the
 * clock.
 *
 * The config record is the page's one control besides the seed, stated as a type so that what
 * the generator writes as provenance and what a re-roll expects to find are one thing.
 */

import { RNG } from '@ironarachne/rng';

import { generateStarSystem, getDefaultStarSystemGeneratorConfig } from '$lib/astronomical_bodies';

import {
  generateCivilization,
  getCivilizationDescription,
  getDefaultCivilizationGenerationConfig,
} from './civilizations';
import {
  generateRegionOfControl,
  getDefaultRegionOfControlGenerationConfig,
  getRegionTypeByName,
  type RegionOfControlGenerationConfig,
} from './regions_of_control';
import { STAR_NATION_PLANET_REGION_TYPE, STAR_NATION_SYSTEM_REGION_TYPE } from './star_nation';
import { toStarNationSnapshot, type StarNationSnapshot } from './star_nation_snapshot';
import type { StarNation } from './star_nation_types';

/** The most planets the page's control offers. */
export const STAR_NATION_MAX_PLANET_COUNT = 20;

/** A spacefaring nation, by the technology table: interstellar travel starts at 7. */
const TECHNOLOGY_LEVEL_RANGE: [number, number] = [7, 9];
const SPACEFARING_TECHNOLOGY_LEVEL = 7;

/**
 * What the generator records about how it rolled, and what a re-roll reads back.
 *
 * `planetCount` absent means the seed chose the home system's planet count, as the page's
 * "Random" does.
 */
export type StarNationGeneratorConfigRecord = {
  planetCount?: number;
};

/**
 * Read a stored provenance config back into the settings a roll needs.
 *
 * Anything unrecognisable is dropped rather than coerced: a planet count outside what the page
 * offers falls back to the seed's choice rather than rolling a nation from a field it misread.
 */
export function readStarNationGeneratorConfig(
  config: Record<string, unknown>,
): StarNationGeneratorConfigRecord {
  const count = config.planetCount;
  return typeof count === 'number' &&
    Number.isInteger(count) &&
    count >= 1 &&
    count <= STAR_NATION_MAX_PLANET_COUNT
    ? { planetCount: count }
    : {};
}

function regionConfigFor(
  rng: RNG,
  typeName: string,
  civilizationName: string,
): RegionOfControlGenerationConfig {
  const config = getDefaultRegionOfControlGenerationConfig(rng);
  config.region_types = [getRegionTypeByName(typeName)];
  config.technology_level = SPACEFARING_TECHNOLOGY_LEVEL;
  config.controlling_civilization = civilizationName;
  return config;
}

/**
 * The territory beyond the home system, for a nation advanced enough to hold any.
 *
 * The other systems are not generated — only how many there are and what they add to the count of
 * populated planets and to the population. The page never showed them, and a payload that stored
 * twenty star systems nobody looks at would be the size case for no reason.
 */
function rollFurtherTerritory(rng: RNG): {
  systems: number;
  populatedPlanets: number;
  population: number;
} {
  const systems = rng.int(1, 20);
  let populatedPlanets = 0;
  let population = 0;
  for (let index = 0; index < systems; index++) {
    const planets = Math.max(1, Math.round(rng.bellFloat(1, 12)));
    populatedPlanets += rng.int(1, planets);
    population += rng.int(1, planets) * rng.int(100000, 10000000);
  }
  return { systems, populatedPlanets, population };
}

/**
 * Roll a star nation from a seed and a set of options — the one path the generator page and a
 * re-roll both take.
 */
export function rollStarNation(
  seed: string,
  config: StarNationGeneratorConfigRecord = {},
): StarNation {
  const rng = new RNG(seed);

  const civilizationConfig = getDefaultCivilizationGenerationConfig(rng);
  civilizationConfig.technology_level_range = TECHNOLOGY_LEVEL_RANGE;
  const civilization = generateCivilization(civilizationConfig);

  const systemConfig = getDefaultStarSystemGeneratorConfig(rng);
  if (config.planetCount !== undefined) {
    systemConfig.planet_count = config.planetCount;
  }
  const homeSystem = generateStarSystem(systemConfig);
  const homePlanetIndex = rng.int(0, homeSystem.planets.length - 1);

  const systemRegionConfig = regionConfigFor(
    rng,
    STAR_NATION_SYSTEM_REGION_TYPE,
    civilization.name,
  );
  systemRegionConfig.population_density_range = [0.05, 0.3];
  const homeSystemRegion = generateRegionOfControl(systemRegionConfig);
  homeSystemRegion.name = homeSystem.name;

  const homePlanetRegion = generateRegionOfControl(
    regionConfigFor(rng, STAR_NATION_PLANET_REGION_TYPE, civilization.name),
  );
  homePlanetRegion.name = homeSystem.planets[homePlanetIndex].name;

  const homeSystemPopulatedPlanets = rng.int(1, homeSystem.planets.length);
  let populatedPlanets = homeSystemPopulatedPlanets;
  let population = homeSystemRegion.population;
  let systemsControlled = 1;

  if (civilization.technology_level > SPACEFARING_TECHNOLOGY_LEVEL) {
    const further = rollFurtherTerritory(rng);
    systemsControlled += further.systems;
    populatedPlanets += further.populatedPlanets;
    population += further.population;
  }

  civilization.population = population;
  civilization.description = getCivilizationDescription(civilization);
  homePlanetRegion.population = Math.round(population / populatedPlanets);

  return {
    civilization,
    homeSystem,
    homePlanetIndex,
    regionsOfControl: [homeSystemRegion, homePlanetRegion],
    homeSystemPopulatedPlanets,
    systemsControlled,
    populatedPlanets,
  };
}

/**
 * Roll a fresh nation as a snapshot — the destructive half of editing (requirement 4.3), and
 * what `ARTIFACT_EDITORS` registers as this kind's roller.
 */
export function rollStarNationSnapshot(
  seed: string,
  config: StarNationGeneratorConfigRecord = {},
): StarNationSnapshot {
  return toStarNationSnapshot(rollStarNation(seed, config));
}

/** The seed the home system's preview is drawn with: the page's seed, and nothing drawn after it. */
export function starNationPreviewSeed(seed: string): string {
  return `${seed}:home-system`;
}
