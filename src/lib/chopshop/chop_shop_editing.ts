/**
 * Editing a saved chop shop. One field, one function: the paragraph is the artifact, and the
 * textarea over it is the whole of requirement 4.1. The destructive command is a re-roll from
 * provenance, which is `chop_shop_roll.ts` and a button of its own (4.3).
 */

import type { ChopShopSnapshot } from './chop_shop_snapshot';

export function setChopShopText(snapshot: ChopShopSnapshot, text: string): ChopShopSnapshot {
  return { ...snapshot, text };
}
