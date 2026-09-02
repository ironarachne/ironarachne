/**
 * The single path from a seed to a chop shop.
 *
 * `ChopShopGenerator.svelte` drew a fresh seed from the clock on every press and showed it to
 * nobody, so nothing it produced could be reproduced (requirements 2.2 and 2.3). The page now
 * takes a seed from the seed box, and the roll is a pure function of it. There is no config
 * record: the page has one control, and recording anything else would describe controls it does
 * not have.
 */

import { RNG } from '@ironarachne/rng';

import { generateChopShop } from './chop_shop_generation';
import { toChopShopSnapshot, type ChopShopSnapshot } from './chop_shop_snapshot';
import type { ChopShop } from './chop_shop_types';

/** Roll a chop shop from a seed — the one path the generator page and a re-roll both take. */
export function rollChopShop(seed: string): ChopShop {
  return generateChopShop(new RNG(seed));
}

/** Roll a fresh chop shop as a snapshot — the destructive half of editing (requirement 4.3). */
export function rollChopShopSnapshot(seed: string): ChopShopSnapshot {
  return toChopShopSnapshot(rollChopShop(seed));
}
