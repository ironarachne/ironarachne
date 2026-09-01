/**
 * Writing a set of Velgarth Gifts, and reading one back.
 *
 * **A `Gift` is three plain fields** — a name, the description its strength level produced, and the
 * numeric strength — so there is no closure to strip and nothing to resolve by name. The conversion
 * is a copy, and this module exists for the contract rather than for the work.
 *
 * **The description is stored, not derived**, which is the opposite of what Uncharted Worlds does
 * with a skill (decision 3 of docs/readiness-characters.md), and the difference is worth stating.
 * A UW skill's prose is a table row a character points at. A Gift's is *assembled at generation
 * time* from two rows — the Gift's own sentence and the sentence for the strength that was rolled —
 * so there is no row to look it up in, and rebuilding it would mean re-deriving a roll. It is the
 * same reason an Uncharted Worlds asset is stored in full.
 */

import type { RNG } from '@ironarachne/rng';

import type Gift from './gift.js';

/** A set of Gifts as it is stored. */
export type VelgarthGiftsSnapshot = {
  gifts: Gift[];
};

export function toVelgarthGiftsSnapshot(gifts: Gift[]): VelgarthGiftsSnapshot {
  return { gifts: gifts.map((gift) => ({ ...gift })) };
}

/**
 * A stored set back into the list the library works with.
 *
 * Nothing is recomputed and nothing is re-rolled: the strengths and the prose come back exactly as
 * they were stored, which is requirement 4.2 — a user who has rewritten what their Foresight does
 * has made a decision no read may overrule.
 */
export function velgarthGiftsFromSnapshot(snapshot: VelgarthGiftsSnapshot): Gift[] {
  return snapshot.gifts.map((gift) => ({ ...gift }));
}

/**
 * The codec's reading half, with the signature the registry hands it.
 *
 * The RNG is unused, and that is the correct amount of use for it. It exists for kinds that rebuild
 * name generators; a set of Gifts is finished when it is stored, and drawing anything from a seed
 * on the way back would be regenerating over the user's edits.
 */
export function velgarthGiftsFromSnapshotWithRng(
  snapshot: VelgarthGiftsSnapshot,
  _rng: RNG,
): Gift[] {
  return velgarthGiftsFromSnapshot(snapshot);
}
