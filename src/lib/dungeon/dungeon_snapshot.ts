/**
 * Writing a dungeon for storage. Reading one back is `dungeon_rehydrate.ts`, split off for the
 * reason the encounter's halves are: rebuilding a room's encounter reaches `$lib/characters` and
 * from there the archetype tables and the charge art, and nothing that merely stores, lists or
 * validates a dungeon needs any of it.
 *
 * **The payload is the blueprint, and only the blueprint** — decision 4 of
 * docs/readiness-locations.md. The grid, the rooms, the doors, the keys, the entrances and the
 * theme are what a referee reads and edits; the map drawn on a canvas is a rendering of them and
 * is never stored, because a picture cannot be re-themed, re-rendered larger, or read by anything
 * but the renderer that made it.
 *
 * **One conversion, and it is the one that matters.** Everything an `EngineeredDungeon` holds is
 * already a plain record of strings, numbers and booleans except a room's `encounter`, whose mobs
 * embed a whole `Species` each. That single conversion — through the stored vocabulary
 * `$lib/encounters` already owns — is what makes the payload storable at all: measured over four
 * sizes, a live dungeon is 1.2 MB at 20×20 and 48 MB at the 120×120 maximum, and the same dungeons
 * as snapshots are 64 KB and 2.7 MB. See `dungeon_presentation.ts` for what the page tells a user
 * about that.
 *
 * The final `stripFunctionValuesDeep` is a net rather than the mechanism, as it is for an
 * encounter: nothing here is expected to carry a closure, and the strip is what keeps one grown
 * somewhere new from turning a save into a `DataCloneError`.
 */

import { toEncounterSnapshot, type EncounterSnapshot } from '$lib/encounters';
import { stripFunctionValuesDeep } from '$lib/persistent_save';

import type { EngineeredDungeon, PopulatedRoom } from './generator/types.js';

/** A room as it is stored: everything the generator placed, with its encounter in stored form. */
export type StoredPopulatedRoom = Omit<PopulatedRoom, 'encounter'> & {
  encounter?: EncounterSnapshot;
};

/** A dungeon as it is stored. */
export type DungeonSnapshot = Omit<EngineeredDungeon, 'rooms'> & {
  rooms: StoredPopulatedRoom[];
};

function toStoredRoom(room: PopulatedRoom): StoredPopulatedRoom {
  const { encounter, ...rest } = room;
  return encounter === undefined ? rest : { ...rest, encounter: toEncounterSnapshot(encounter) };
}

export function toDungeonSnapshot(dungeon: EngineeredDungeon): DungeonSnapshot {
  const converted: DungeonSnapshot = {
    name: dungeon.name,
    theme: dungeon.theme,
    layout: dungeon.layout,
    rooms: dungeon.rooms.map(toStoredRoom),
    doors: dungeon.doors,
    keys: dungeon.keys,
    entrances: dungeon.entrances,
  };
  return stripFunctionValuesDeep(converted) as DungeonSnapshot;
}

/**
 * Roughly what this dungeon will occupy in the vault, in bytes.
 *
 * The store keeps a payload as JSON, so the serialized length is the honest measure rather than an
 * estimate from the room count — a room with a six-creature encounter is an order of magnitude
 * larger than an empty one, and the whole point of showing a number is that a user picking 120×120
 * with every room occupied can see what they are about to ask their browser to keep.
 *
 * Zero for a payload that will not serialize, which is the same answer the save path would give
 * it: there is nothing to store.
 */
export function dungeonSnapshotByteSize(snapshot: DungeonSnapshot): number {
  try {
    return new TextEncoder().encode(JSON.stringify(snapshot)).length;
  } catch {
    return 0;
  }
}

/**
 * That size in the words a quota warning needs, which is kilobytes or megabytes and never bytes.
 *
 * The page shows it beside the save control because this is the one tool in the pass whose payload
 * can reach megabytes, and a user choosing a 120×120 map with an encounter in every room is making
 * a storage decision without being told so otherwise. The vault reports its own limits; this
 * reports what one dungeon costs against them.
 */
export function describeDungeonSize(bytes: number): string {
  if (bytes >= 1024 * 1024) {
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  }
  return `${Math.max(1, Math.round(bytes / 1024))} KB`;
}
