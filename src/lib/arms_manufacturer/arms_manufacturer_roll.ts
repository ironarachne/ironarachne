/**
 * The single path from a seed to an arms manufacturer.
 *
 * Requirement 2.2 of docs/workshop.md wants the same seed to give the same result, and 2.3 wants a
 * seed the user can see and pin. `ArmsManufacturerGenerator.svelte` had neither: it rendered no
 * `SeedControls` and called `Date.now()` three times, so what it produced could not be reproduced
 * by anyone, including the page that produced it. The page now takes a seed from the seed box, and
 * the roll itself is a pure function of that seed.
 *
 * **There is no config record here, and that is deliberate.** The page has one control, the seed
 * box. How many models a manufacturer lists and which weapon types it favours are the generator's
 * own decisions, drawn from the seed, and recording them as provenance would describe controls the
 * page does not have — the mistake `dcc_character_roll.ts` names about naming gender. A re-roll
 * takes the seed and nothing else.
 */

import { RNG } from '@ironarachne/rng';

import type { ArmsManufacturer } from './arms_manufacturer.js';
import { generate } from './generator.js';
import {
  toArmsManufacturerSnapshot,
  type ArmsManufacturerSnapshot,
} from './arms_manufacturer_snapshot.js';

/** Roll a manufacturer from a seed — the one path the generator page and a re-roll both take. */
export function rollArmsManufacturer(seed: string): ArmsManufacturer {
  return generate(new RNG(seed));
}

/**
 * Roll a fresh manufacturer as a snapshot — the destructive half of editing (requirement 4.3),
 * and what `ARTIFACT_EDITORS` registers as this kind's roller.
 */
export function rollArmsManufacturerSnapshot(seed: string): ArmsManufacturerSnapshot {
  return toArmsManufacturerSnapshot(rollArmsManufacturer(seed));
}
