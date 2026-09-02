/**
 * Writing a planet for storage, and reading one back.
 *
 * Both halves live here rather than in a `*_rehydrate.ts` beside it, and that is the rule the pass
 * states rather than an omission: the split exists only where reading pulls a heavy dependency the
 * writing side does not. Reading a planet pulls nothing — an `AstronomicalBody` is fifteen numbers
 * and three strings, a moon is another one, and a `Civilization` is a name, a population and three
 * plain records.
 *
 * **The planet's own fields sit at the top level**, so a stored planet reads as the
 * `AstronomicalBody` it is, with the moons and whoever lives there beside it. The alternative —
 * `{ planet, moons, civilization }` — buries the fifteen numbers a user came for one level down for
 * the sake of a symmetry nothing needs.
 *
 * **The preview image is not stored, and neither is the seed it was drawn from.** The picture is a
 * rendering of the numbers above it, redrawn from the artifact's own seed whenever it is shown, and
 * a stored image is a fossil that cannot be re-rendered larger or on the other backend. That is
 * decision 3 of docs/readiness-locations.md applied to a planet rather than a map.
 *
 * Every copy is deep. The snapshot must not share its moons or its civilization's name options with
 * the value it was made from, or an edit to one would show up in the other.
 */

import type { RNG } from '@ironarachne/rng';
import type { Civilization, GovernmentType } from '$lib/civilizations';
import { stripFunctionValuesDeep } from '$lib/persistent_save';

import type { AstronomicalBody } from './astronomical_bodies.js';
import type { PlanetRoll } from './planet_roll.js';

/**
 * A planet as it is stored: its own parameters, its moons, and any civilization on it.
 *
 * `Civilization` is embedded rather than reduced to a stored form of its own. The stored vocabulary
 * in docs/tool-readiness.md exists for types that carry closures or whole sub-objects a name could
 * rebuild — arms, species, archetypes — and a civilization carries none: its government, economy
 * and military are plain records of strings and numbers, and `$lib/civilizations` stores them the
 * same way inside a star nation.
 */
export type PlanetSnapshot = AstronomicalBody & {
  moons: AstronomicalBody[];
  /** Absent when nothing lives here, which is the usual case. */
  civilization?: Civilization;
};

function copyBody(body: AstronomicalBody): AstronomicalBody {
  return { ...body };
}

function copyGovernmentType(type: GovernmentType): GovernmentType {
  return { ...type, name_options: [...type.name_options] };
}

function copyCivilization(civilization: Civilization): Civilization {
  return {
    ...civilization,
    government_type: copyGovernmentType(civilization.government_type),
    economy_type: { ...civilization.economy_type },
    military: { ...civilization.military },
  };
}

export function toPlanetSnapshot(roll: PlanetRoll): PlanetSnapshot {
  const snapshot: PlanetSnapshot = {
    ...copyBody(roll.planet),
    moons: roll.moons.map(copyBody),
    ...(roll.civilization === undefined
      ? {}
      : { civilization: copyCivilization(roll.civilization) }),
  };
  return stripFunctionValuesDeep(snapshot) as PlanetSnapshot;
}

/** The planet on its own, as the renderer and the physics helpers expect it. */
export function planetBodyFromSnapshot(snapshot: PlanetSnapshot): AstronomicalBody {
  const { moons: _moons, civilization: _civilization, ...body } = snapshot;
  return body;
}

export function planetFromSnapshot(snapshot: PlanetSnapshot): PlanetRoll {
  return {
    planet: planetBodyFromSnapshot(snapshot),
    moons: snapshot.moons.map(copyBody),
    ...(snapshot.civilization === undefined
      ? {}
      : { civilization: copyCivilization(snapshot.civilization) }),
  };
}

/**
 * The codec's reading half, with the signature the registry hands it.
 *
 * The RNG is unused, and that is the correct amount of use for it: a planet is finished when it is
 * stored, and drawing anything from a seed on the way back would be regenerating over the user's
 * edits.
 */
export function planetFromSnapshotWithRng(snapshot: PlanetSnapshot, _rng: RNG): PlanetRoll {
  return planetFromSnapshot(snapshot);
}
