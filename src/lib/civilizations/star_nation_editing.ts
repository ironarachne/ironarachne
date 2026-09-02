/**
 * Editing a saved star nation, one field at a time.
 *
 * Every function here takes a snapshot and returns a new one, changing nothing in place. That is
 * requirement 4.4 satisfied by construction — changing the economy must not disturb the home
 * system — and it is what lets the editing framework compare what is on screen against what was
 * read to decide whether anything needs saving.
 *
 * **The description is the user's.** It was assembled from the figures at generation time, and
 * changing a figure deliberately does not rewrite it: a user who has written their own account of
 * the nation has made a decision no field edit may overrule (4.2). What they get instead is
 * `restoreStarNationDescription`, an explicit command that rebuilds the sentence from the figures
 * as they now stand — which is 4.4's "one part without re-rolling the whole" for the one field
 * that is derived from the others.
 *
 * The two table rows — government and economy — are set by name and resolved against the table
 * here, so an editor offers a select and never writes a row the library does not have. The home
 * planet is set by index and the planet region is renamed with it, because that region's name
 * *is* the home planet's name and the two drifting apart would be a nation whose homeworld is
 * called two things.
 */

import {
  getCivilizationDescription,
  getEconomyTypeByName,
  getGovernmentTypeByName,
} from './civilizations';
import type { RegionOfControl } from './regions_of_control';
import {
  STAR_NATION_MILITARY_QUALITY_RANGE,
  STAR_NATION_PLANET_REGION_TYPE,
  STAR_NATION_SYSTEM_REGION_TYPE,
  STAR_NATION_TECHNOLOGY_LEVEL_RANGE,
} from './star_nation';
import {
  civilizationFromStarNationSnapshot,
  type StarNationSnapshot,
} from './star_nation_snapshot';

/** The two prose fields. */
export type StarNationTextField = 'name' | 'description';

/** The figures the page prints, each a number field of its own. */
export type StarNationNumberField =
  | 'population'
  | 'technologyLevel'
  | 'homeSystemPopulatedPlanets'
  | 'systemsControlled'
  | 'populatedPlanets';

function clampInteger(value: number, [min, max]: [number, number]): number {
  return Math.min(max, Math.max(min, Math.round(value)));
}

function isUsableNumber(value: number): boolean {
  return Number.isFinite(value);
}

function renameRegionOfType(
  regions: RegionOfControl[],
  typeName: string,
  name: string,
): RegionOfControl[] {
  return regions.map((region) =>
    region.region_type.name === typeName ? { ...region, name } : region,
  );
}

export function setStarNationText(
  snapshot: StarNationSnapshot,
  field: StarNationTextField,
  value: string,
): StarNationSnapshot {
  return { ...snapshot, [field]: value };
}

/** The floor each figure is held to: a nation controls at least its home system. */
const NUMBER_FIELD_FLOORS: Record<StarNationNumberField, number> = {
  population: 0,
  technologyLevel: STAR_NATION_TECHNOLOGY_LEVEL_RANGE[0],
  homeSystemPopulatedPlanets: 0,
  systemsControlled: 1,
  populatedPlanets: 0,
};

/**
 * Sets one of the figures. A value that is not a number — what a cleared number input reports —
 * leaves the snapshot alone rather than storing something the validator would refuse. Every
 * figure is a whole number with a floor, and the technology level has the table's ceiling too,
 * so what is stored is what the prose can print.
 */
export function setStarNationNumber(
  snapshot: StarNationSnapshot,
  field: StarNationNumberField,
  value: number,
): StarNationSnapshot {
  if (!isUsableNumber(value)) {
    return snapshot;
  }
  const ceiling =
    field === 'technologyLevel' ? STAR_NATION_TECHNOLOGY_LEVEL_RANGE[1] : Number.MAX_SAFE_INTEGER;
  return { ...snapshot, [field]: clampInteger(value, [NUMBER_FIELD_FLOORS[field], ceiling]) };
}

export function setStarNationMilitaryQuality(
  snapshot: StarNationSnapshot,
  quality: number,
): StarNationSnapshot {
  if (!isUsableNumber(quality)) {
    return snapshot;
  }
  return {
    ...snapshot,
    military: {
      ...snapshot.military,
      quality: clampInteger(quality, STAR_NATION_MILITARY_QUALITY_RANGE),
    },
  };
}

/** Sets the government by the table row's name. A name the table lacks changes nothing. */
export function setStarNationGovernmentType(
  snapshot: StarNationSnapshot,
  name: string,
): StarNationSnapshot {
  const type = getGovernmentTypeByName(name);
  return type === undefined
    ? snapshot
    : { ...snapshot, governmentType: { ...type, name_options: [...type.name_options] } };
}

/** Sets the economy by the table row's name. A name the table lacks changes nothing. */
export function setStarNationEconomyType(
  snapshot: StarNationSnapshot,
  name: string,
): StarNationSnapshot {
  const type = getEconomyTypeByName(name);
  return type === undefined ? snapshot : { ...snapshot, economyType: { ...type } };
}

/**
 * Picks a different homeworld from the home system's planets, and renames the planet region to
 * match. An index outside the system changes nothing.
 */
export function setStarNationHomePlanet(
  snapshot: StarNationSnapshot,
  index: number,
): StarNationSnapshot {
  const planet = snapshot.homeSystem.planets[index];
  if (!Number.isInteger(index) || planet === undefined) {
    return snapshot;
  }
  return {
    ...snapshot,
    homePlanetIndex: index,
    regionsOfControl: renameRegionOfType(
      snapshot.regionsOfControl,
      STAR_NATION_PLANET_REGION_TYPE,
      planet.name,
    ),
  };
}

/** Renames the home system, and the region that stands for it. */
export function setStarNationHomeSystemName(
  snapshot: StarNationSnapshot,
  name: string,
): StarNationSnapshot {
  return {
    ...snapshot,
    homeSystem: { ...snapshot.homeSystem, name },
    regionsOfControl: renameRegionOfType(
      snapshot.regionsOfControl,
      STAR_NATION_SYSTEM_REGION_TYPE,
      name,
    ),
  };
}

/** Renames one of the home system's planets. Renaming the homeworld renames its region with it. */
export function setStarNationPlanetName(
  snapshot: StarNationSnapshot,
  index: number,
  name: string,
): StarNationSnapshot {
  if (snapshot.homeSystem.planets[index] === undefined) {
    return snapshot;
  }
  const planets = snapshot.homeSystem.planets.map((planet, position) =>
    position === index ? { ...planet, name } : planet,
  );
  const regionsOfControl =
    index === snapshot.homePlanetIndex
      ? renameRegionOfType(snapshot.regionsOfControl, STAR_NATION_PLANET_REGION_TYPE, name)
      : snapshot.regionsOfControl;
  return { ...snapshot, homeSystem: { ...snapshot.homeSystem, planets }, regionsOfControl };
}

/** Sets the population of one region of control, by its position in the list. */
export function setStarNationRegionPopulation(
  snapshot: StarNationSnapshot,
  index: number,
  population: number,
): StarNationSnapshot {
  if (snapshot.regionsOfControl[index] === undefined || !isUsableNumber(population)) {
    return snapshot;
  }
  const stored = clampInteger(population, [0, Number.MAX_SAFE_INTEGER]);
  return {
    ...snapshot,
    regionsOfControl: snapshot.regionsOfControl.map((region, position) =>
      position === index ? { ...region, population: stored } : region,
    ),
  };
}

/** Rebuilds the description from the figures as they now stand. Explicit, never automatic. */
export function restoreStarNationDescription(snapshot: StarNationSnapshot): StarNationSnapshot {
  return {
    ...snapshot,
    description: getCivilizationDescription(civilizationFromStarNationSnapshot(snapshot)),
  };
}
