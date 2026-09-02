/**
 * Writing a chop shop, and reading one back.
 *
 * The identity function, tested: a chop shop is one string, so there is nothing to strip, resolve
 * or copy. The module exists for the contract — every kind has a codec, and a codec that happens
 * to be trivial is not a reason to wire it differently from its neighbours.
 */

import type { RNG } from '@ironarachne/rng';

import type { ChopShop } from './chop_shop_types';

/** A chop shop as it is stored: the type as it stands. */
export type ChopShopSnapshot = ChopShop;

export function toChopShopSnapshot(shop: ChopShop): ChopShopSnapshot {
  return { text: shop.text };
}

/** Nothing is recomputed: the paragraph comes back as it was stored (requirement 4.2). */
export function chopShopFromSnapshot(snapshot: ChopShopSnapshot): ChopShop {
  return { text: snapshot.text };
}

/** The codec's reading half, with the signature the registry hands it. The RNG is unused. */
export function chopShopFromSnapshotWithRng(snapshot: ChopShopSnapshot, _rng: RNG): ChopShop {
  return chopShopFromSnapshot(snapshot);
}
