/**
 * Writing a star nation, and reading one back.
 *
 * The stored shape is the flat one docs/readiness-factions.md drew: the civilization's fields at
 * the top level, the regions of control beside them, and the home system embedded. The live value
 * nests the civilization, because that is the type the rest of this library generates and
 * describes; the codec's work is the flattening and nothing else. Nothing is recomputed on the
 * way back — a description the user rewrote comes back as written (requirement 4.2).
 *
 * Every copy is deep. The snapshot must not share its bodies, its regions or its name option list
 * with the value it was made from, or an edit to one would show up in the other.
 */

import type { RNG } from '@ironarachne/rng';
import type { AstronomicalBody, StarSystem } from '$lib/astronomical_bodies';

import type { Civilization, EconomyType, GovernmentType, Military } from './civilizations';
import type { RegionOfControl } from './regions_of_control';
import type { StarNation } from './star_nation_types';

/** A star system as stored: the bodies' parameters, which is what the preview renderer takes. */
export type StoredStarSystem = StarSystem;

/** A star nation as it is stored. Flat, as the design's diagram declared it. */
export type StarNationSnapshot = {
  name: string;
  description: string;
  population: number;
  technologyLevel: number;
  governmentType: GovernmentType;
  economyType: EconomyType;
  military: Military;
  regionsOfControl: RegionOfControl[];
  homeSystem: StoredStarSystem;
  homePlanetIndex: number;
  homeSystemPopulatedPlanets: number;
  systemsControlled: number;
  populatedPlanets: number;
};

function copyBody(body: AstronomicalBody): AstronomicalBody {
  return { ...body };
}

function copyStarSystem(system: StarSystem): StarSystem {
  return {
    ...system,
    stars: system.stars.map(copyBody),
    planets: system.planets.map(copyBody),
  };
}

function copyRegion(region: RegionOfControl): RegionOfControl {
  return { ...region, region_type: { ...region.region_type } };
}

function copyGovernmentType(type: GovernmentType): GovernmentType {
  return { ...type, name_options: [...type.name_options] };
}

export function toStarNationSnapshot(nation: StarNation): StarNationSnapshot {
  const civilization = nation.civilization;
  return {
    name: civilization.name,
    description: civilization.description,
    population: civilization.population,
    technologyLevel: civilization.technology_level,
    governmentType: copyGovernmentType(civilization.government_type),
    economyType: { ...civilization.economy_type },
    military: { ...civilization.military },
    regionsOfControl: nation.regionsOfControl.map(copyRegion),
    homeSystem: copyStarSystem(nation.homeSystem),
    homePlanetIndex: nation.homePlanetIndex,
    homeSystemPopulatedPlanets: nation.homeSystemPopulatedPlanets,
    systemsControlled: nation.systemsControlled,
    populatedPlanets: nation.populatedPlanets,
  };
}

/** The civilization a stored nation describes, as the rest of this library expects it. */
export function civilizationFromStarNationSnapshot(snapshot: StarNationSnapshot): Civilization {
  return {
    name: snapshot.name,
    description: snapshot.description,
    population: snapshot.population,
    technology_level: snapshot.technologyLevel,
    government_type: copyGovernmentType(snapshot.governmentType),
    economy_type: { ...snapshot.economyType },
    military: { ...snapshot.military },
  };
}

/** A stored nation back into the value the library works with. */
export function starNationFromSnapshot(snapshot: StarNationSnapshot): StarNation {
  return {
    civilization: civilizationFromStarNationSnapshot(snapshot),
    homeSystem: copyStarSystem(snapshot.homeSystem),
    homePlanetIndex: snapshot.homePlanetIndex,
    regionsOfControl: snapshot.regionsOfControl.map(copyRegion),
    homeSystemPopulatedPlanets: snapshot.homeSystemPopulatedPlanets,
    systemsControlled: snapshot.systemsControlled,
    populatedPlanets: snapshot.populatedPlanets,
  };
}

/**
 * The codec's reading half, with the signature the registry hands it.
 *
 * The RNG is unused, and that is the correct amount of use for it: a nation is finished when it is
 * stored, and drawing anything from a seed on the way back would be regenerating over the user's
 * edits.
 */
export function starNationFromSnapshotWithRng(snapshot: StarNationSnapshot, _rng: RNG): StarNation {
  return starNationFromSnapshot(snapshot);
}
