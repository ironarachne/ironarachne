/**
 * The single path from a seed to a derelict.
 *
 * `SpookyShipGenerator.svelte` reseeded its own RNG from the seed field inside an `$effect` and
 * again inside `generate()`, so the seed of the next press depended on the *text* of the previous
 * one — the same requirement 2.2 failure #66, #67, #69 and #70 all had. The roll is a pure
 * function of the seed now.
 *
 * There is no config record: the page has one control and it is the seed, so recording anything
 * else would describe controls this tool does not have.
 */

import { RNG } from '@ironarachne/rng';

import { generateSpookyShip } from './spooky_ship_generation';
import { toSpookyShipSnapshot, type SpookyShipSnapshot } from './spooky_ship_snapshot';
import type { SpookyShip } from './spooky_ship_types';

/** Roll a derelict from a seed — the one path the generator page and a re-roll both take. */
export function rollSpookyShip(seed: string): SpookyShip {
  return generateSpookyShip(new RNG(seed));
}

/** Roll a fresh derelict as a snapshot — the destructive half of editing (requirement 4.3). */
export function rollSpookyShipSnapshot(seed: string): SpookyShipSnapshot {
  return toSpookyShipSnapshot(rollSpookyShip(seed));
}
