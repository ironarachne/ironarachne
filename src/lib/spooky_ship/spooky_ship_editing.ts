/**
 * Editing a saved derelict. One field, one function: the paragraph is the artifact, and the
 * textarea over it is the whole of requirement 4.1. The destructive command is a re-roll from
 * provenance, which is `spooky_ship_roll.ts` and a button of its own (4.3).
 */

import type { SpookyShipSnapshot } from './spooky_ship_snapshot';

export function setSpookyShipText(snapshot: SpookyShipSnapshot, text: string): SpookyShipSnapshot {
  return { ...snapshot, text };
}
