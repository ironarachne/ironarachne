/**
 * Rebuilding a dungeon from a snapshot.
 *
 * **Nothing here is recomputed.** Every room name, every door state, every description comes back
 * exactly as it was stored, per requirement 4.2 in docs/workshop.md. The one part that is rebuilt
 * rather than copied is a room's encounter, and `$lib/encounters` owns that rule: species and
 * archetypes resolve by name, and a name this build no longer has becomes an inert placeholder
 * rather than a refusal.
 *
 * Split from `dungeon_snapshot.ts` for what that import costs. Reading reaches the character and
 * creature rehydrators, and from there the archetype tables and the charge art; writing, listing
 * and validating a dungeon reach none of it.
 */

import type { RNG } from '@ironarachne/rng';

import { encounterFromSnapshot } from '$lib/encounters';

import type { EngineeredDungeon, PopulatedRoom } from './generator/types.js';
import type { DungeonSnapshot, StoredPopulatedRoom } from './dungeon_snapshot.js';

function roomFromStored(stored: StoredPopulatedRoom): PopulatedRoom {
  const { encounter, ...rest } = stored;
  return encounter === undefined ? rest : { ...rest, encounter: encounterFromSnapshot(encounter) };
}

export function dungeonFromSnapshot(snapshot: DungeonSnapshot): EngineeredDungeon {
  return {
    name: snapshot.name,
    theme: snapshot.theme,
    layout: snapshot.layout,
    rooms: snapshot.rooms.map(roomFromStored),
    doors: snapshot.doors,
    keys: snapshot.keys,
    entrances: snapshot.entrances,
  };
}

/**
 * The codec's reading half, with the signature the registry hands it.
 *
 * The RNG is unused, and that is the correct amount of use for it: a dungeon is finished when it
 * is stored, and drawing anything from a seed on the way back would be regenerating over the
 * user's edits.
 */
export function dungeonFromSnapshotWithRng(
  snapshot: DungeonSnapshot,
  _rng: RNG,
): EngineeredDungeon {
  return dungeonFromSnapshot(snapshot);
}
