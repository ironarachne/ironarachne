/**
 * Writing a treasure hoard for storage, and reading one back.
 *
 * **One artifact, not forty.** Decision 3 of `docs/readiness-objects.md`: a hoard is read out at a
 * table as a unit, its contents are not things a user names individually, and forty artifacts per
 * hoard is a vault nobody can browse. So the items are embedded rather than referenced, which also
 * answers the fork the issue points at — `/star-system` embeds its planets for the same reason.
 *
 * **A hoard item is an item plus what its own kind adds.** `generateRandomTreasureHoard` returns a
 * deliberately heterogeneous `Item[]`: containers, piles of coins, gems, art objects, potions and
 * ordinary gear, each stamped with an `itemMinorType` the predicates narrow on and each carrying a
 * few fields of its own. `ItemSnapshot` — the shape #66 settled for a *lone* item — drops three of
 * those on purpose, and all three matter here:
 *
 * - **`containerId` and `contents`.** #66 drops them because "the container is not part of this
 *   artifact". In a hoard it is: the chest and what is in it are the same artifact, and the pairing
 *   is the whole structure a referee reads out.
 * - **The container's own capacity.** A chest with no `maxVolume` is a chest nobody can say is
 *   full.
 * - **The subtype fields** — a gem's cut and size, an art object's artist, a coin pile's
 *   denomination and quantity. Dropping them would leave "12 gems" where "12 cushion-cut emeralds"
 *   was rolled.
 *
 * Everything here is plain data, so the codec is a deep copy rather than a conversion.
 */

import { toItemSnapshot, type ItemSnapshot, type RolledItem } from '$lib/equipment';
import type { Item } from '$lib/equipment';

/**
 * One item of a hoard, as it is stored.
 *
 * The lone-item shape plus the fields a hoard's own kinds add. Every extra is optional because the
 * list is heterogeneous: a gem has no `contents` and a chest has no `cut`.
 */
export type HoardItemSnapshot = ItemSnapshot & {
  /** The container this item is packed in, when it is packed in one. */
  containerId?: string;

  /** Container: what it can hold, what it is holding, and what is in it. */
  maxWeight?: number;
  maxVolume?: number;
  currentWeight?: number;
  currentVolume?: number;
  isOpen?: boolean;
  contents?: string[];

  /** Gem: how it was cut and how big it is. */
  cut?: string;
  isCut?: boolean;
  size?: string;

  /** Art object: who made it. */
  artist?: string;

  /** Pile of coins: which coin, and how many. */
  denomination?: string;
  quantity?: number;
};

/** A hoard as it is stored. */
export type TreasureHoardSnapshot = {
  /** What the hoard was rolled to be worth, in copper. */
  targetValue: number;
  items: HoardItemSnapshot[];
};

/** The optional numbers a hoard item may carry, and the key each is stored under. */
const NUMBER_EXTRAS = [
  'maxWeight',
  'maxVolume',
  'currentWeight',
  'currentVolume',
  'quantity',
] as const;

const STRING_EXTRAS = ['containerId', 'cut', 'size', 'artist', 'denomination'] as const;

const BOOLEAN_EXTRAS = ['isOpen', 'isCut'] as const;

/** One item of a hoard, copied field by field so nothing shared reaches the store. */
export function toHoardItemSnapshot(item: Item): HoardItemSnapshot {
  const source = item as Record<string, unknown>;
  const snapshot: HoardItemSnapshot = toItemSnapshot(item as RolledItem);

  for (const key of STRING_EXTRAS) {
    if (typeof source[key] === 'string' && source[key] !== '') {
      snapshot[key] = source[key] as string;
    }
  }
  for (const key of NUMBER_EXTRAS) {
    if (typeof source[key] === 'number' && Number.isFinite(source[key])) {
      snapshot[key] = source[key] as number;
    }
  }
  for (const key of BOOLEAN_EXTRAS) {
    if (typeof source[key] === 'boolean') {
      snapshot[key] = source[key] as boolean;
    }
  }
  if (Array.isArray(source.contents)) {
    snapshot.contents = (source.contents as unknown[]).filter(
      (id): id is string => typeof id === 'string',
    );
  }

  return snapshot;
}

export function toTreasureHoardSnapshot(items: Item[], targetValue: number): TreasureHoardSnapshot {
  return { targetValue, items: items.map(toHoardItemSnapshot) };
}

/**
 * Nothing is recomputed on read.
 *
 * A stored hoard is finished. Re-deriving a container's `currentWeight` from what it holds would
 * overwrite whatever a referee changed by hand — requirement 4.2 exactly — and re-packing the items
 * would rearrange a hoard they had already read out to their table.
 */
export function treasureHoardFromSnapshot(snapshot: TreasureHoardSnapshot): TreasureHoardSnapshot {
  return {
    targetValue: snapshot.targetValue,
    items: snapshot.items.map((item) => toHoardItemSnapshot(item as unknown as Item)),
  };
}

/** The codec's reading half, with the signature the registry hands it. The RNG is unused. */
export function treasureHoardFromSnapshotWithRng(
  snapshot: TreasureHoardSnapshot,
  _rng: unknown,
): TreasureHoardSnapshot {
  return treasureHoardFromSnapshot(snapshot);
}
