import chest from '$lib/assets/icons/set2/chest.svg?raw';
import {
  acceptedPayload,
  asRecord,
  defineArtifactKind,
  isStringArray,
  rejectedPayload,
  type PayloadResult,
} from '$lib/artifact_kinds';
import { DEFAULT_ITEM_DENSITY, DEFAULT_ITEM_RARITY } from '$lib/equipment';
import type { DensityCategory, Rarity } from '$lib/equipment';

import type { HoardItemSnapshot, TreasureHoardSnapshot } from './treasure_hoard_snapshot';

/**
 * Stable artifact kind id. Unqualified: a hoard is neither a game system's nor a setting's, per the
 * kind table in docs/tool-readiness.md.
 *
 * **One artifact holding many items**, per decision 3 of docs/readiness-objects.md: a hoard is read
 * out at a table as a unit, and forty artifacts for one hoard is a vault nobody can browse.
 */
export const TREASURE_HOARD_ARTIFACT_KIND = 'treasure-hoard' as const;

/** Version 1. The first shape a hoard has been stored in. */
export const TREASURE_HOARD_PAYLOAD_VERSION = 1 as const;

function readNumber(value: unknown, fallback: number): number {
  return typeof value === 'number' && Number.isFinite(value) ? value : fallback;
}

function readText(value: unknown, fallback = ''): string {
  return typeof value === 'string' ? value : fallback;
}

function copyOptional(
  source: Record<string, unknown>,
  target: Record<string, unknown>,
  keys: readonly string[],
  is: (value: unknown) => boolean,
): void {
  for (const key of keys) {
    if (is(source[key])) {
      target[key] = source[key];
    }
  }
}

const isNumber = (value: unknown) => typeof value === 'number' && Number.isFinite(value);
const isText = (value: unknown) => typeof value === 'string' && value !== '';
const isBoolean = (value: unknown) => typeof value === 'boolean';

/**
 * One item of a hoard, normalised.
 *
 * An item with no id is dropped: the id is what a container's `contents` points at, so an item that
 * has lost it cannot be placed and would appear twice — once in a chest it is no longer in and once
 * loose. Everything else degrades, because a hoard is a list a referee reads out and a line missing
 * a weight is still a line.
 */
function readHoardItem(value: unknown): HoardItemSnapshot | undefined {
  const record = asRecord(value);
  if (record === null || typeof record.id !== 'string' || record.id === '') {
    return undefined;
  }

  const item: Record<string, unknown> = {
    id: record.id,
    name: readText(record.name),
    itemMajorType: readText(record.itemMajorType),
    description: readText(record.description),
    value: readNumber(record.value, 0),
    rarity: (readText(record.rarity, DEFAULT_ITEM_RARITY) || DEFAULT_ITEM_RARITY) as Rarity,
    densityCategory: (readText(record.densityCategory, DEFAULT_ITEM_DENSITY) ||
      DEFAULT_ITEM_DENSITY) as DensityCategory,
    weight: readNumber(record.weight, 0),
    properties: isStringArray(record.properties) ? record.properties : [],
  };

  copyOptional(record, item, ['uniqueName', 'itemMinorType'], isText);
  copyOptional(record, item, ['containerId', 'cut', 'size', 'artist', 'denomination'], isText);
  copyOptional(
    record,
    item,
    ['maxWeight', 'maxVolume', 'currentWeight', 'currentVolume', 'quantity'],
    isNumber,
  );
  copyOptional(record, item, ['isOpen', 'isCut'], isBoolean);
  copyOptional(
    record,
    item,
    ['combatProfile', 'material', 'refinement', 'enchantment', 'decoration'],
    (v) => asRecord(v) !== null,
  );
  if (Array.isArray(record.actions)) {
    item.actions = record.actions;
  }
  // Kept even when empty: an empty array is what says "this is a container, and it is empty",
  // where its absence says "this is not a container at all".
  if (isStringArray(record.contents)) {
    item.contents = record.contents;
  }

  return item as unknown as HoardItemSnapshot;
}

/**
 * Reads a stored hoard, normalising rather than refusing wherever it honestly can.
 *
 * What is checked is what every reader depends on: a target value and a list of items. An item that
 * cannot be placed is dropped rather than taking the hoard with it, and an emptied hoard is
 * accepted — a referee whose party has carried everything off has emptied it, and 3.3 asks for a
 * well-defined empty result rather than a refusal.
 */
export function validateTreasureHoardSnapshot(
  payload: unknown,
): PayloadResult<TreasureHoardSnapshot> {
  const record = asRecord(payload);
  if (record === null) {
    return rejectedPayload('invalid-payload', 'Treasure hoard payload is not an object');
  }
  if (!Array.isArray(record.items)) {
    return rejectedPayload('invalid-payload', 'Treasure hoard payload has no usable item list');
  }

  return acceptedPayload({
    targetValue: readNumber(record.targetValue, 0),
    items: record.items
      .map(readHoardItem)
      .filter((item): item is HoardItemSnapshot => item !== undefined),
  });
}

/**
 * There has only ever been version 1, so this rejects rather than pretending otherwise.
 *
 * It is here because the contract requires it, and it is where the first real step goes the day
 * the shape changes — a kind without one looks complete right up until it silently drops someone's
 * work, and local-only means there is no server-side migration to fall back on.
 */
export function migrateTreasureHoardSnapshot(
  _payload: unknown,
  from: number,
): PayloadResult<TreasureHoardSnapshot> {
  return rejectedPayload(
    'unsupported-version',
    `Treasure hoards have no migration from payload version ${from}; version ${TREASURE_HOARD_PAYLOAD_VERSION} is the only shape there has been`,
  );
}

/**
 * What to call a saved hoard.
 *
 * A hoard has no name of its own — it is a pile of things, not a person or a place — so the default
 * says how big it is, which is the one thing a referee scanning a vault listing wants to know.
 */
export function treasureHoardName(snapshot: TreasureHoardSnapshot): string {
  const count = snapshot.items.length;
  return count === 0 ? 'Treasure Hoard' : `Treasure Hoard (${count} items)`;
}

/**
 * A hoard as an artifact.
 *
 * The codec is a dynamic import for consistency with every other kind rather than for weight:
 * reading a hoard resolves nothing, because a stored one already holds everything it is.
 */
export const treasureHoardArtifactKind = defineArtifactKind<
  TreasureHoardSnapshot,
  TreasureHoardSnapshot
>({
  kind: TREASURE_HOARD_ARTIFACT_KIND,
  displayName: 'Treasure Hoard',
  icon: chest,
  payloadVersion: TREASURE_HOARD_PAYLOAD_VERSION,
  loadCodec: async () => {
    const { treasureHoardFromSnapshotWithRng } = await import('./treasure_hoard_snapshot.js');
    return {
      toSnapshot: (hoard: TreasureHoardSnapshot) => hoard,
      fromSnapshot: treasureHoardFromSnapshotWithRng,
    };
  },
  nameOf: treasureHoardName,
  validate: validateTreasureHoardSnapshot,
  migrate: migrateTreasureHoardSnapshot,
});
