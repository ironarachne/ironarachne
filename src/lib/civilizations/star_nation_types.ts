/**
 * A star nation: a spacefaring civilization, the territory it holds, and the star system it calls
 * home.
 *
 * This is the value `/star-nation` generates, declared here rather than left as a handful of
 * component variables so that it can be rolled, stored, edited and printed by modules that never
 * see the page. Everything in it is plain data: the star system's bodies are the parameters the
 * preview renderer takes, never the image it draws (docs/readiness-factions.md, decision 5).
 */

import type { StarSystem } from '$lib/astronomical_bodies';

import type { Civilization } from './civilizations';
import type { RegionOfControl } from './regions_of_control';

export type StarNation = {
  civilization: Civilization;
  /** The system the nation grew up in. Embedded, because there is no `star-system` kind yet. */
  homeSystem: StarSystem;
  /** Which of the home system's planets is the homeworld, by position from the star. */
  homePlanetIndex: number;
  /**
   * The territory the nation holds, as the generator draws it: the home system and the home
   * planet, each a region typed by its own scale. Found by region type rather than by position,
   * so a payload with one missing still reads.
   */
  regionsOfControl: RegionOfControl[];
  /** How many of the home system's planets are populated. */
  homeSystemPopulatedPlanets: number;
  /** How many star systems the nation controls, the home system included. */
  systemsControlled: number;
  /** How many populated planets the nation has across every system it controls. */
  populatedPlanets: number;
};
