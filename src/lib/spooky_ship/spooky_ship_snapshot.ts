/**
 * Writing a derelict for storage, and reading one back.
 *
 * The identity function, tested: a derelict is one string, so there is nothing to strip, resolve
 * or copy. The module exists for the contract — every kind has a codec, and a codec that happens
 * to be trivial is not a reason to wire it differently from its neighbours.
 */

import type { RNG } from '@ironarachne/rng';

import type { SpookyShip } from './spooky_ship_types';

/** A derelict as it is stored: the type as it stands. */
export type SpookyShipSnapshot = SpookyShip;

export function toSpookyShipSnapshot(ship: SpookyShip): SpookyShipSnapshot {
  return { text: ship.text };
}

/** Nothing is recomputed: the paragraph comes back as it was stored (requirement 4.2). */
export function spookyShipFromSnapshot(snapshot: SpookyShipSnapshot): SpookyShip {
  return { text: snapshot.text };
}

/** The codec's reading half, with the signature the registry hands it. The RNG is unused. */
export function spookyShipFromSnapshotWithRng(snapshot: SpookyShipSnapshot, _rng: RNG): SpookyShip {
  return spookyShipFromSnapshot(snapshot);
}
