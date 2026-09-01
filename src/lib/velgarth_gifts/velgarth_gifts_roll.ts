/**
 * The single path from a seed to a set of Velgarth Gifts.
 *
 * Requirement 2.2 of docs/workshop.md wants the same seed to give the same result.
 * `VelgarthGiftsGenerator.svelte` did that for the Gifts themselves — it built an `RNG` from the
 * seed box — but it drew each *new* seed from `new RNG(Date.now().toString())`, building a whole
 * generator to take one string from it. Pressing Generate now draws a new seed from the page's own
 * RNG, seeded once, and the roll itself is a pure function of the seed.
 *
 * **There is no config record here, and that is deliberate.** The page has one control, the seed
 * box, and the bounds on how many Gifts a character has are the setting's rather than the user's.
 * Recording `minGifts` and `maxGifts` as provenance would describe a page with controls that do not
 * exist — the mistake `dcc_character_roll.ts` names about naming gender — so a re-roll takes the
 * seed and nothing else, and the bounds live here as the constants they are.
 */

import { RNG } from '@ironarachne/rng';

import type Gift from './gift.js';
import type GiftGeneratorConfig from './generator_config.js';
import { all } from './gift_possibilities.js';
import { generate } from './gifts.js';
import { toVelgarthGiftsSnapshot, type VelgarthGiftsSnapshot } from './velgarth_gifts_snapshot.js';

/**
 * How many Gifts a rolled character has.
 *
 * One is the floor because a character with none is not what this tool is for, and three is the
 * ceiling because a fourth is vanishingly rare in the setting — a character with four strong Gifts
 * is a protagonist rather than a person. These were the generator page's own numbers; they are
 * named here because a constant with a reason beside it is not the same thing as a literal in a
 * component.
 */
export const VELGARTH_MIN_GIFTS = 1 as const;
export const VELGARTH_MAX_GIFTS = 3 as const;

/** The config a roll uses: the whole table, and the bounds above. */
export function velgarthGiftsGeneratorConfig(): GiftGeneratorConfig {
  return {
    possibilities: all(),
    min_gifts: VELGARTH_MIN_GIFTS,
    max_gifts: VELGARTH_MAX_GIFTS,
  };
}

/** Roll a set of Gifts from a seed — the one path the generator page and a re-roll both take. */
export function rollVelgarthGifts(seed: string): Gift[] {
  return generate(velgarthGiftsGeneratorConfig(), new RNG(seed));
}

/**
 * Roll a fresh set as a snapshot — the destructive half of editing (requirement 4.3), and what
 * `ARTIFACT_EDITORS` registers as this kind's roller.
 */
export function rollVelgarthGiftsSnapshot(seed: string): VelgarthGiftsSnapshot {
  return toVelgarthGiftsSnapshot(rollVelgarthGifts(seed));
}
