import door from '$lib/assets/icons/set2/door.svg?raw';
import {
  acceptedPayload,
  asRecord,
  defineArtifactKind,
  hasStringFields,
  rejectedPayload,
  type PayloadResult,
} from '$lib/artifact_kinds';
// Deep, and for the reason the registry's own header gives: `$lib/encounters`'s entry point
// reaches the encounter generator and from there the species and archetype tables. This module is
// metadata and validation only, and the registry that imports it is loaded by any page that lists
// what a project contains.
import {
  migrateEncounterSnapshot,
  validateEncounterSnapshot,
} from '$lib/encounters/encounter_artifact_kind';

import type { DungeonSnapshot } from './dungeon_snapshot.js';
import type { EngineeredDungeon } from './generator/types.js';

/**
 * Stable artifact kind id. Unqualified: a dungeon is neither a game system's nor a setting's, per
 * the kind table in docs/tool-readiness.md.
 */
export const DUNGEON_ARTIFACT_KIND = 'dungeon' as const;

/** Version 2 composes the actor migration through every room encounter. */
export const DUNGEON_PAYLOAD_VERSION = 2 as const;

function isFiniteNumber(value: unknown): value is number {
  return typeof value === 'number' && Number.isFinite(value);
}

function isBooleanArray(value: unknown): value is boolean[] {
  return Array.isArray(value) && value.every((entry) => typeof entry === 'boolean');
}

/**
 * A grid, which is the shape everything geometric here is built on: a width, a height, and one
 * flat array of tiles rather than nested rows.
 *
 * The length is checked against the dimensions rather than taken on trust. A grid whose data is
 * short is not a smaller dungeon, it is one whose renderer reads past the end of the array and
 * whose room shapes silently lose their last row.
 */
function validateGrid(value: unknown, what: string): PayloadResult<unknown> {
  const grid = asRecord(value);
  if (grid === null) {
    return rejectedPayload('invalid-payload', `${what} is not an object`);
  }
  if (!isFiniteNumber(grid.width) || !isFiniteNumber(grid.height)) {
    return rejectedPayload('invalid-payload', `${what} has no numeric width and height`);
  }
  if (!isBooleanArray(grid.data)) {
    return rejectedPayload('invalid-payload', `${what} data is not an array of booleans`);
  }
  if (grid.data.length !== grid.width * grid.height) {
    return rejectedPayload(
      'invalid-payload',
      `${what} holds ${grid.data.length} tiles for a ${grid.width}×${grid.height} grid`,
    );
  }
  return acceptedPayload(grid);
}

function validatePlacement(value: unknown, what: string): PayloadResult<unknown> {
  const placed = asRecord(value);
  if (placed === null) {
    return rejectedPayload('invalid-payload', `${what} is not an object`);
  }
  if (!isFiniteNumber(placed.x) || !isFiniteNumber(placed.y)) {
    return rejectedPayload('invalid-payload', `${what} has no numeric position`);
  }
  const primitive = asRecord(placed.primitive);
  if (primitive === null) {
    return rejectedPayload('invalid-payload', `${what} has no room primitive`);
  }
  if (!isFiniteNumber(primitive.width) || !isFiniteNumber(primitive.height)) {
    return rejectedPayload('invalid-payload', `${what} primitive has no numeric size`);
  }
  if (typeof primitive.style !== 'string') {
    return rejectedPayload('invalid-payload', `${what} primitive has no style`);
  }
  return validateGrid(primitive.shape, `${what} primitive shape`);
}

/** The dungeon's theme: what it is called, where it sits, and what it was built as. */
function validateTheme(value: unknown): PayloadResult<unknown> {
  const theme = asRecord(value);
  if (theme === null) {
    return rejectedPayload('invalid-payload', 'dungeon theme is not an object');
  }
  if (typeof theme.name !== 'string') {
    return rejectedPayload('invalid-payload', 'dungeon theme has no name');
  }
  if (asRecord(theme.environment) === null) {
    return rejectedPayload('invalid-payload', 'dungeon theme has no environment');
  }
  const blueprint = asRecord(theme.blueprint);
  if (blueprint === null) {
    return rejectedPayload('invalid-payload', 'dungeon theme has no blueprint');
  }
  if (!hasStringFields(blueprint, ['name', 'description'])) {
    return rejectedPayload('invalid-payload', 'dungeon blueprint needs a name and a description');
  }
  return acceptedPayload(theme);
}

function validateLayout(value: unknown): PayloadResult<unknown> {
  const layout = asRecord(value);
  if (layout === null) {
    return rejectedPayload('invalid-payload', 'dungeon layout is not an object');
  }
  if (!isFiniteNumber(layout.width) || !isFiniteNumber(layout.height)) {
    return rejectedPayload('invalid-payload', 'dungeon layout has no numeric size');
  }
  const grid = validateGrid(layout.grid, 'dungeon layout grid');
  if (!grid.ok) {
    return grid;
  }
  if (!Array.isArray(layout.rooms)) {
    return rejectedPayload('invalid-payload', 'dungeon layout rooms is not a list');
  }
  const failed = layout.rooms
    .map((room, index) => validatePlacement(room, `dungeon layout room ${index}`))
    .find((check) => !check.ok);
  return failed ?? acceptedPayload(layout);
}

/**
 * One populated room: where it is, what it is called, and what is in it.
 *
 * A room with no encounter and no treasure is accepted, and so is a room whose name has been
 * emptied. Both are editing decisions a user is entitled to make — 3.3 asks for a well-defined
 * empty result, not a refusal.
 */
function validateRoom(value: unknown, index: number): PayloadResult<unknown> {
  const placement = validatePlacement(value, `dungeon room ${index}`);
  if (!placement.ok) {
    return placement;
  }
  const room = asRecord(value) as Record<string, unknown>;
  if (!hasStringFields(room, ['id', 'name', 'purpose', 'description'])) {
    return rejectedPayload(
      'invalid-payload',
      `dungeon room ${index} needs an id, a name, a purpose and a description`,
    );
  }
  if (room.treasure !== undefined && !Array.isArray(room.treasure)) {
    return rejectedPayload('invalid-payload', `dungeon room ${index} treasure is not a list`);
  }
  return room.encounter === undefined
    ? acceptedPayload(room)
    : validateEncounterSnapshot(room.encounter);
}

function validateDoor(value: unknown, index: number): PayloadResult<unknown> {
  const record = asRecord(value);
  if (record === null) {
    return rejectedPayload('invalid-payload', `dungeon door ${index} is not an object`);
  }
  if (!hasStringFields(record, ['id', 'type', 'state', 'description'])) {
    return rejectedPayload(
      'invalid-payload',
      `dungeon door ${index} needs an id, a type, a state and a description`,
    );
  }
  if (!isFiniteNumber(record.x) || !isFiniteNumber(record.y)) {
    return rejectedPayload('invalid-payload', `dungeon door ${index} has no numeric position`);
  }
  return acceptedPayload(record);
}

function validateKey(value: unknown, index: number): PayloadResult<unknown> {
  const record = asRecord(value);
  if (record === null) {
    return rejectedPayload('invalid-payload', `dungeon key ${index} is not an object`);
  }
  if (!hasStringFields(record, ['id', 'doorId', 'description'])) {
    return rejectedPayload(
      'invalid-payload',
      `dungeon key ${index} needs an id, a door and a description`,
    );
  }
  if (!isFiniteNumber(record.x) || !isFiniteNumber(record.y)) {
    return rejectedPayload('invalid-payload', `dungeon key ${index} has no numeric position`);
  }
  return acceptedPayload(record);
}

function validateEntrance(value: unknown, index: number): PayloadResult<unknown> {
  const record = asRecord(value);
  if (record === null) {
    return rejectedPayload('invalid-payload', `dungeon entrance ${index} is not an object`);
  }
  if (!hasStringFields(record, ['type', 'roomId'])) {
    return rejectedPayload('invalid-payload', `dungeon entrance ${index} needs a type and a room`);
  }
  if (!isFiniteNumber(record.x) || !isFiniteNumber(record.y)) {
    return rejectedPayload('invalid-payload', `dungeon entrance ${index} has no numeric position`);
  }
  return acceptedPayload(record);
}

function validateList(
  value: unknown,
  what: string,
  check: (entry: unknown, index: number) => PayloadResult<unknown>,
): PayloadResult<unknown> {
  if (!Array.isArray(value)) {
    return rejectedPayload('invalid-payload', `dungeon ${what} is not a list`);
  }
  return value.map(check).find((result) => !result.ok) ?? acceptedPayload(value);
}

/**
 * Checks what reading and drawing depend on: the name, the theme, the layout and its grid, and the
 * four lists a dungeon is populated with.
 *
 * A dungeon with no rooms is accepted. The generator can produce one — a layout at low density on a
 * small grid sometimes packs nothing — and a payload that failed its own validator would be a
 * broken artifact rather than an empty one.
 */
export function validateDungeonSnapshot(payload: unknown): PayloadResult<DungeonSnapshot> {
  const record = asRecord(payload);
  if (record === null) {
    return rejectedPayload('invalid-payload', 'dungeon payload is not an object');
  }
  if (typeof record.name !== 'string') {
    return rejectedPayload('invalid-payload', 'dungeon payload needs a name');
  }

  const checks = [
    validateTheme(record.theme),
    validateLayout(record.layout),
    validateList(record.rooms, 'rooms', validateRoom),
    validateList(record.doors, 'doors', validateDoor),
    validateList(record.keys, 'keys', validateKey),
    validateList(record.entrances, 'entrances', validateEntrance),
  ];
  const failed = checks.find((check) => !check.ok);
  if (failed !== undefined) {
    return failed as PayloadResult<DungeonSnapshot>;
  }

  return acceptedPayload(record as unknown as DungeonSnapshot);
}

/** Composes the encounter migration through every populated room. */
export function migrateDungeonSnapshot(
  payload: unknown,
  from: number,
): PayloadResult<DungeonSnapshot> {
  if (from !== 1) {
    return rejectedPayload(
      'unsupported-version',
      `Dungeons have no migration from payload version ${from}; version 1 is the only older shape there has been`,
    );
  }
  const record = asRecord(payload);
  if (record === null) {
    return rejectedPayload('invalid-payload', 'dungeon payload is not an object');
  }
  return validateDungeonSnapshot({
    ...record,
    rooms: Array.isArray(record.rooms)
      ? record.rooms.map((room) => {
          const storedRoom = asRecord(room);
          if (storedRoom === null || storedRoom.encounter === undefined) {
            return room;
          }
          const migrated = migrateEncounterSnapshot(storedRoom.encounter, 1);
          return { ...storedRoom, encounter: migrated.ok ? migrated.value : storedRoom.encounter };
        })
      : record.rooms,
  });
}

/** What to call a saved dungeon: its name, or the kind when the name has been emptied. */
function dungeonName(snapshot: DungeonSnapshot): string {
  const name = snapshot.name.trim();
  return name === '' ? 'Dungeon' : name;
}

/**
 * A dungeon as an artifact.
 *
 * The codec is a dynamic import because its reading half rebuilds every room's encounter, and that
 * reaches the archetype tables and, through a character's arms, 18 MB of charge art. Listing a
 * project must not pay for that.
 */
export const dungeonArtifactKind = defineArtifactKind<EngineeredDungeon, DungeonSnapshot>({
  kind: DUNGEON_ARTIFACT_KIND,
  displayName: 'Dungeon',
  icon: door,
  payloadVersion: DUNGEON_PAYLOAD_VERSION,
  loadCodec: async () => {
    const [{ toDungeonSnapshot }, { dungeonFromSnapshotWithRng }] = await Promise.all([
      import('./dungeon_snapshot.js'),
      import('./dungeon_rehydrate.js'),
    ]);
    return {
      toSnapshot: toDungeonSnapshot,
      fromSnapshot: dungeonFromSnapshotWithRng,
    };
  },
  nameOf: dungeonName,
  validate: validateDungeonSnapshot,
  migrate: migrateDungeonSnapshot,
});
