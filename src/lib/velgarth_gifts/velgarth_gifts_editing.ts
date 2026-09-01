/**
 * Editing a saved set of Velgarth Gifts, one field at a time.
 *
 * Every function here takes a snapshot and returns a new one, changing nothing in place. That is
 * requirement 4.4 of docs/workshop.md satisfied by construction — renaming one Gift must not
 * disturb another, and changing a strength must not rewrite the prose beside it — and it is what
 * lets the editing framework compare what is on screen against what was read to decide whether
 * anything needs saving.
 *
 * **Both text fields are the user's.** A Gift's description is assembled at generation time from
 * the Gift's own sentence and the sentence for the strength that was rolled, so unlike an Uncharted
 * Worlds skill there is no table row that owns it — nothing would be corrected by deriving it, and
 * a referee who has written what their character's Foresight actually does is the authority on it.
 *
 * **Nothing here recomputes anything.** Raising a strength does not rewrite the description to the
 * table's sentence for that band: the two are separate decisions, and a form that silently replaced
 * a user's prose would overrule them. The destructive command is a re-roll from provenance, which
 * is `velgarth_gifts_roll.ts` and a button of its own (4.3).
 */

import type Gift from './gift.js';
import type { VelgarthGiftsSnapshot } from './velgarth_gifts_snapshot.js';

/** The strength bands the tables use, which is what the editor's control offers. */
export const VELGARTH_STRENGTHS = [1, 2, 3, 4, 5] as const;

/** The parts of a Gift the sheet prints as text. */
export type VelgarthGiftTextField = 'name' | 'description';

function hasIndex(length: number, index: number): boolean {
  return Number.isInteger(index) && index >= 0 && index < length;
}

function replaceAt<T>(list: T[], index: number, value: T): T[] {
  return list.map((entry, position) => (position === index ? value : entry));
}

function removeAt<T>(list: T[], index: number): T[] {
  return list.filter((_entry, position) => position !== index);
}

export function setVelgarthGiftText(
  snapshot: VelgarthGiftsSnapshot,
  index: number,
  field: VelgarthGiftTextField,
  value: string,
): VelgarthGiftsSnapshot {
  return hasIndex(snapshot.gifts.length, index)
    ? {
        ...snapshot,
        gifts: replaceAt(snapshot.gifts, index, { ...snapshot.gifts[index], [field]: value }),
      }
    : snapshot;
}

/**
 * One Gift's strength.
 *
 * A field the user has emptied arrives as `NaN` and is refused rather than stored: a Gift with a
 * strength of `NaN` is a payload that fails its own kind's validation, which the user would meet as
 * a broken artifact rather than as a rejected keystroke.
 */
export function setVelgarthGiftStrength(
  snapshot: VelgarthGiftsSnapshot,
  index: number,
  strength: number,
): VelgarthGiftsSnapshot {
  return Number.isFinite(strength) && hasIndex(snapshot.gifts.length, index)
    ? {
        ...snapshot,
        gifts: replaceAt(snapshot.gifts, index, { ...snapshot.gifts[index], strength }),
      }
    : snapshot;
}

/**
 * A blank Gift at the middling strength.
 *
 * Blank rather than drawn from the table: a set is normally one to three Gifts and the tool rolls
 * them, so adding one by hand is a user saying "and this one too" about something they have in
 * mind. Strength 3 because the scale runs 1 to 5 and a new row has to start somewhere the user can
 * see and change.
 */
export function addVelgarthGift(snapshot: VelgarthGiftsSnapshot): VelgarthGiftsSnapshot {
  const gift: Gift = { name: '', description: '', strength: 3 };
  return { ...snapshot, gifts: [...snapshot.gifts, gift] };
}

export function removeVelgarthGift(
  snapshot: VelgarthGiftsSnapshot,
  index: number,
): VelgarthGiftsSnapshot {
  return hasIndex(snapshot.gifts.length, index)
    ? { ...snapshot, gifts: removeAt(snapshot.gifts, index) }
    : snapshot;
}
