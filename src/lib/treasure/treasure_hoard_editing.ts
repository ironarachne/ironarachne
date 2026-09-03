/**
 * Editing a saved treasure hoard, one item at a time.
 *
 * Every function here takes a snapshot and returns a new one, changing nothing in place. That is
 * requirement 4.4 of docs/workshop.md satisfied by construction, and it is what lets the editing
 * framework compare what is on screen against what was read to decide whether anything needs
 * saving.
 *
 * **A hoard is a list a party carries off.** The operations that matter are renaming a thing,
 * repricing it, and taking it out — not typing into a form. Removing an item also takes it out of
 * whatever chest it was in, because a chest whose `contents` names something no longer in the hoard
 * is a chest that reads as holding a ghost.
 *
 * **Nothing here recomputes anything.** A container's `currentWeight` is not re-derived when
 * something is taken out of it, and the target value is not re-derived from what is left: both are
 * numbers a referee may have set, and 4.2 says the payload is authoritative. `targetValue` in
 * particular is what the hoard was *rolled for*, which stays true however much of it the party
 * takes.
 */

import type { HoardItemSnapshot, TreasureHoardSnapshot } from './treasure_hoard_snapshot.js';

/** The fields of one hoard item a referee may rewrite. */
export type HoardItemTextField = 'name' | 'description';

function updateItem(
  snapshot: TreasureHoardSnapshot,
  index: number,
  change: (item: HoardItemSnapshot) => HoardItemSnapshot,
): TreasureHoardSnapshot {
  if (index < 0 || index >= snapshot.items.length) {
    return snapshot;
  }
  return {
    ...snapshot,
    items: snapshot.items.map((item, at) => (at === index ? change(item) : item)),
  };
}

export function setHoardItemText(
  snapshot: TreasureHoardSnapshot,
  index: number,
  field: HoardItemTextField,
  value: string,
): TreasureHoardSnapshot {
  return updateItem(snapshot, index, (item) => ({ ...item, [field]: value }));
}

/** One item's value, floored at zero: nothing in a hoard is worth less than nothing. */
export function setHoardItemValue(
  snapshot: TreasureHoardSnapshot,
  index: number,
  value: number,
): TreasureHoardSnapshot {
  const usable = Number.isFinite(value) && value > 0 ? value : 0;
  return updateItem(snapshot, index, (item) => ({ ...item, value: usable }));
}

/**
 * Take one thing out of the hoard.
 *
 * Also drops its id from every container's `contents`, which is the part a caller would forget: a
 * chest naming an item that is no longer here reads as holding something invisible, and the
 * presentation would count it as packed and then find nothing to print.
 */
export function removeHoardItem(
  snapshot: TreasureHoardSnapshot,
  index: number,
): TreasureHoardSnapshot {
  if (index < 0 || index >= snapshot.items.length) {
    return snapshot;
  }

  const removedId = snapshot.items[index].id;

  return {
    ...snapshot,
    items: snapshot.items
      .filter((_item, at) => at !== index)
      .map((item) =>
        item.contents === undefined
          ? item
          : { ...item, contents: item.contents.filter((id) => id !== removedId) },
      ),
  };
}

/** What the hoard was rolled to be worth, which a referee may correct. Floored at zero. */
export function setHoardTargetValue(
  snapshot: TreasureHoardSnapshot,
  targetValue: number,
): TreasureHoardSnapshot {
  return {
    ...snapshot,
    targetValue: Number.isFinite(targetValue) && targetValue > 0 ? targetValue : 0,
  };
}
