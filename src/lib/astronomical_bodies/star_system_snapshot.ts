/**
 * Writing a star system for storage, and reading one back.
 *
 * Both halves live here rather than in a `*_rehydrate.ts` beside it: reading a system pulls
 * nothing, because a `StarSystem` is a name, a description and two lists of `AstronomicalBody`.
 *
 * **The counts are not stored, and are derived on read.** A live `StarSystem` carries `star_count`
 * and `planet_count` beside the lists they count, and the generator always sets each to its list's
 * length. Storing both would let them disagree the first time the editor removes a planet, and a
 * payload that says it has seven planets and holds six is a bug that survives every validator that
 * checks each field on its own. The approved domain model in docs/readiness-locations.md drew them
 * as stored fields; this is the one place this implementation departs from it, and the reason is
 * that a derived value with an independent copy is a defect waiting for an editor.
 *
 * **A referenced planet is not in this payload at all**, which is rule 2 of docs/workshop.md and
 * the shape culture already uses for a religion: a reference is by identity, and a system holding
 * its own copy of a planet somebody later edits would show the stale one forever. Which planet it
 * is lives on the artifact's reference. What follows from that is worth stating plainly rather than
 * discovering: a system saved with a referenced planet reads back with one fewer planet in its own
 * list, and the link is shown by the panel's reference list instead.
 *
 * The final `stripFunctionValuesDeep` is a net rather than the mechanism: nothing in a system is
 * expected to carry a closure, and the strip is what keeps one grown somewhere new from turning a
 * save into a `DataCloneError`.
 */

import type { RNG } from '@ironarachne/rng';
import { stripFunctionValuesDeep } from '$lib/persistent_save';

import type { AstronomicalBody } from './astronomical_bodies.js';
import type { StarSystem } from './star_systems.js';

/** A star system as it is stored: its two lists, and the words that go with them. */
export type StarSystemSnapshot = Omit<StarSystem, 'star_count' | 'planet_count'>;

function copyBody(body: AstronomicalBody): AstronomicalBody {
  return { ...body };
}

export function toStarSystemSnapshot(system: StarSystem): StarSystemSnapshot {
  const snapshot: StarSystemSnapshot = {
    name: system.name,
    description: system.description,
    stars: system.stars.map(copyBody),
    planets: system.planets.map(copyBody),
  };
  return stripFunctionValuesDeep(snapshot) as StarSystemSnapshot;
}

export function starSystemFromSnapshot(snapshot: StarSystemSnapshot): StarSystem {
  return {
    name: snapshot.name,
    description: snapshot.description,
    star_count: snapshot.stars.length,
    planet_count: snapshot.planets.length,
    stars: snapshot.stars.map(copyBody),
    planets: snapshot.planets.map(copyBody),
  };
}

/**
 * The codec's reading half, with the signature the registry hands it.
 *
 * The RNG is unused, and that is the correct amount of use for it: a system is finished when it is
 * stored, and drawing anything from a seed on the way back would be regenerating over the user's
 * edits.
 */
export function starSystemFromSnapshotWithRng(snapshot: StarSystemSnapshot, _rng: RNG): StarSystem {
  return starSystemFromSnapshot(snapshot);
}
