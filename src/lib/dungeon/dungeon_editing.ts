/**
 * Editing a saved dungeon, one field at a time.
 *
 * Every function here takes a snapshot and returns a new one, changing nothing in place. That is
 * requirement 4.4 of docs/workshop.md satisfied by construction — renaming one room must not
 * disturb its neighbours, and removing one room's treasure must not touch the room next door — and
 * it is what lets the editing framework compare what is on screen against what was read to decide
 * whether anything needs saving.
 *
 * **What is editable is what the page shows** (4.1): the dungeon's name, its blueprint, and per
 * room the name, purpose and description, the encounter's name and description, each combatant's
 * name, each treasure item's name, and each key's description — plus removing an encounter, a
 * combatant, an item or a key outright. The mob edits delegate to `$lib/encounters`' own editing
 * module rather than reaching into a stored encounter here: a room's encounter is an encounter,
 * and two spellings of "rename a combatant" is one of them going stale.
 *
 * **The geometry is not editable, and that is a decision rather than an omission.** A room's
 * position, its shape grid, the corridor layout, and where the doors and keys physically sit are
 * what make the map drawable and the keys reachable — `keys.ts` guarantees a key is placed in a
 * zone reachable before the door it opens, and a text box over a coordinate would let a user break
 * that quietly. A referee who wants a different map re-rolls; a referee who wants a different
 * *dungeon* edits every word of it, which is what is here.
 *
 * **Retheming relabels; it does not rebuild.** Choosing another blueprint changes what the dungeon
 * says it is — its theme name, the blueprint's own name and description, and the tags the theme
 * carries — and leaves every room exactly as it was rolled. That is requirement 4.2: the edited
 * payload is authoritative, and silently re-rolling forty rooms' purposes because a user changed a
 * label would be regenerating over their work. A dungeon whose rooms should match a new blueprint
 * is a re-roll, which is the button next to this one.
 */

import {
  removeEncounterMob,
  setEncounterMobName,
  setEncounterName,
  type EncounterSnapshot,
} from '$lib/encounters';

import type { DungeonSnapshot, StoredPopulatedRoom } from './dungeon_snapshot.js';
import { BLUEPRINTS, buildTheme } from './theme/theme.js';

function hasIndex(length: number, index: number): boolean {
  return Number.isInteger(index) && index >= 0 && index < length;
}

function replaceAt<T>(list: T[], index: number, value: T): T[] {
  return list.map((entry, position) => (position === index ? value : entry));
}

function removeAt<T>(list: T[], index: number): T[] {
  return list.filter((_entry, position) => position !== index);
}

function editRoom(
  snapshot: DungeonSnapshot,
  index: number,
  change: (room: StoredPopulatedRoom) => StoredPopulatedRoom,
): DungeonSnapshot {
  return hasIndex(snapshot.rooms.length, index)
    ? { ...snapshot, rooms: replaceAt(snapshot.rooms, index, change(snapshot.rooms[index])) }
    : snapshot;
}

/**
 * Applies a change to a room's encounter, and does nothing at all to a room that has none.
 *
 * An empty room is an ordinary state rather than a fault, so this is a no-op there rather than a
 * place that invents an encounter to edit.
 */
function editRoomEncounter(
  snapshot: DungeonSnapshot,
  roomIndex: number,
  change: (encounter: EncounterSnapshot) => EncounterSnapshot,
): DungeonSnapshot {
  return editRoom(snapshot, roomIndex, (room) =>
    room.encounter === undefined ? room : { ...room, encounter: change(room.encounter) },
  );
}

export function setDungeonName(snapshot: DungeonSnapshot, name: string): DungeonSnapshot {
  return { ...snapshot, name };
}

/**
 * Rebuild the theme around another blueprint, keeping the environment the dungeon was dug into.
 *
 * `buildTheme` does the work rather than a second spelling of it here: the theme's name and its
 * encounter and treasure tags are derived from the blueprint and the biome together, and a copy of
 * that derivation is the half that goes stale.
 *
 * A blueprint this build does not have, or a payload whose biome is one `buildTheme` refuses,
 * leaves the dungeon alone. The select cannot offer either, so reaching here with one means a
 * hand-edited payload — and relabelling a dungeon to something arbitrary, or throwing out of an
 * editing function, are both worse answers than doing nothing.
 */
export function setDungeonBlueprint(
  snapshot: DungeonSnapshot,
  blueprintName: string,
): DungeonSnapshot {
  const known = BLUEPRINTS.some((candidate) => candidate.name === blueprintName);
  if (!known || snapshot.theme.environment.biome.isAquatic) {
    return snapshot;
  }
  return { ...snapshot, theme: buildTheme(snapshot.theme.environment, blueprintName) };
}

export function setRoomName(
  snapshot: DungeonSnapshot,
  roomIndex: number,
  name: string,
): DungeonSnapshot {
  return editRoom(snapshot, roomIndex, (room) => ({ ...room, name }));
}

export function setRoomPurpose(
  snapshot: DungeonSnapshot,
  roomIndex: number,
  purpose: string,
): DungeonSnapshot {
  return editRoom(snapshot, roomIndex, (room) => ({ ...room, purpose }));
}

export function setRoomDescription(
  snapshot: DungeonSnapshot,
  roomIndex: number,
  description: string,
): DungeonSnapshot {
  return editRoom(snapshot, roomIndex, (room) => ({ ...room, description }));
}

export function setRoomEncounterName(
  snapshot: DungeonSnapshot,
  roomIndex: number,
  name: string,
): DungeonSnapshot {
  return editRoomEncounter(snapshot, roomIndex, (encounter) => setEncounterName(encounter, name));
}

export function setRoomEncounterDescription(
  snapshot: DungeonSnapshot,
  roomIndex: number,
  description: string,
): DungeonSnapshot {
  return editRoomEncounter(snapshot, roomIndex, (encounter) => ({ ...encounter, description }));
}

export function setRoomMobName(
  snapshot: DungeonSnapshot,
  roomIndex: number,
  groupIndex: number,
  mobIndex: number,
  name: string,
): DungeonSnapshot {
  return editRoomEncounter(snapshot, roomIndex, (encounter) =>
    setEncounterMobName(encounter, groupIndex, mobIndex, name),
  );
}

export function removeRoomMob(
  snapshot: DungeonSnapshot,
  roomIndex: number,
  groupIndex: number,
  mobIndex: number,
): DungeonSnapshot {
  return editRoomEncounter(snapshot, roomIndex, (encounter) =>
    removeEncounterMob(encounter, groupIndex, mobIndex),
  );
}

/** Empty a room of whatever was living in it. The room stays; what was in it does not. */
export function removeRoomEncounter(snapshot: DungeonSnapshot, roomIndex: number): DungeonSnapshot {
  return editRoom(snapshot, roomIndex, ({ encounter: _encounter, ...room }) => room);
}

export function setRoomTreasureItemName(
  snapshot: DungeonSnapshot,
  roomIndex: number,
  itemIndex: number,
  name: string,
): DungeonSnapshot {
  return editRoom(snapshot, roomIndex, (room) =>
    room.treasure !== undefined && hasIndex(room.treasure.length, itemIndex)
      ? {
          ...room,
          treasure: replaceAt(room.treasure, itemIndex, { ...room.treasure[itemIndex], name }),
        }
      : room,
  );
}

export function removeRoomTreasureItem(
  snapshot: DungeonSnapshot,
  roomIndex: number,
  itemIndex: number,
): DungeonSnapshot {
  return editRoom(snapshot, roomIndex, (room) =>
    room.treasure !== undefined && hasIndex(room.treasure.length, itemIndex)
      ? { ...room, treasure: removeAt(room.treasure, itemIndex) }
      : room,
  );
}

export function setKeyDescription(
  snapshot: DungeonSnapshot,
  keyIndex: number,
  description: string,
): DungeonSnapshot {
  return hasIndex(snapshot.keys.length, keyIndex)
    ? {
        ...snapshot,
        keys: replaceAt(snapshot.keys, keyIndex, { ...snapshot.keys[keyIndex], description }),
      }
    : snapshot;
}

export function setDoorDescription(
  snapshot: DungeonSnapshot,
  doorIndex: number,
  description: string,
): DungeonSnapshot {
  return hasIndex(snapshot.doors.length, doorIndex)
    ? {
        ...snapshot,
        doors: replaceAt(snapshot.doors, doorIndex, {
          ...snapshot.doors[doorIndex],
          description,
        }),
      }
    : snapshot;
}
