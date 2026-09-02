/**
 * Reading the parts of a star nation the page and the exports both need.
 *
 * The two regions of control are told apart by their region type, not by their position in the
 * list. That is what lets a stored nation with one region missing still open — the sentence that
 * needed it is dropped (requirement 6.4) rather than the whole artifact refused.
 */

import type { AstronomicalBody } from '$lib/astronomical_bodies';
import { getTechnologyLevels } from '$lib/technology_levels';

import type { RegionOfControl } from './regions_of_control';

/** The region type names the generator assigns to a nation's two regions. */
export const STAR_NATION_SYSTEM_REGION_TYPE = 'Star System';
export const STAR_NATION_PLANET_REGION_TYPE = 'Planet';

/**
 * The technology levels a nation may have: the table's own range, so the validator, the editor
 * and the page cannot drift from the rows `getTechnologyLevelByLevel` can actually find.
 */
export const STAR_NATION_TECHNOLOGY_LEVEL_RANGE: [number, number] = (() => {
  const levels = getTechnologyLevels().map((level) => level.level);
  return [Math.min(...levels), Math.max(...levels)];
})();

/** The range of the military quality table `describeMilitary` indexes. */
export const STAR_NATION_MILITARY_QUALITY_RANGE: [number, number] = [1, 10];

/** The default name for a nation with none. What the vault and the exports both call it. */
export const STAR_NATION_FALLBACK_NAME = 'Star Nation';

function regionOfType(regions: RegionOfControl[], typeName: string): RegionOfControl | undefined {
  return regions.find((region) => region.region_type.name === typeName);
}

/** The region that stands for the home system, when the nation has one. */
export function homeSystemRegionOf(nation: {
  regionsOfControl: RegionOfControl[];
}): RegionOfControl | undefined {
  return regionOfType(nation.regionsOfControl, STAR_NATION_SYSTEM_REGION_TYPE);
}

/** The region that stands for the home planet, when the nation has one. */
export function homePlanetRegionOf(nation: {
  regionsOfControl: RegionOfControl[];
}): RegionOfControl | undefined {
  return regionOfType(nation.regionsOfControl, STAR_NATION_PLANET_REGION_TYPE);
}

/** The homeworld itself, or undefined when the index points outside the system. */
export function homePlanetOf(nation: {
  homeSystem: { planets: AstronomicalBody[] };
  homePlanetIndex: number;
}): AstronomicalBody | undefined {
  return nation.homeSystem.planets[nation.homePlanetIndex];
}

/** What to call a nation: its name, or the kind when the name has been emptied. */
export function starNationDisplayName(nation: { civilization: { name: string } }): string {
  const name = nation.civilization.name.trim();
  return name === '' ? STAR_NATION_FALLBACK_NAME : name;
}
