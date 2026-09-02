/**
 * The single path from a seed to a drug, and the record of how it was rolled.
 *
 * `DrugGenerator.svelte` drew a fresh seed from `new RNG(Date.now())` twice — once at module load
 * for the initial value and once per press — which is requirement 2.2's usual failure: the seed
 * control was there and honoured, but the seed itself came from the clock rather than from a
 * stream anybody could reproduce. The roll is a pure function of the seed now.
 *
 * There is no config record. The page has one control besides the seed, and it is the seed; the
 * drug and effect tables are the library's, not the user's. Recording anything else would describe
 * controls this tool does not have.
 */

import { RNG } from '@ironarachne/rng';

import type Drug from './drug.js';
import { generate, getDefaultConfig } from './drugs.js';
import { toDrugSnapshot, type DrugSnapshot } from './drug_snapshot.js';

/** Roll a drug from a seed — the one path the generator page and a re-roll both take. */
export function rollDrug(seed: string): Drug {
  return generate(getDefaultConfig(), new RNG(seed));
}

/**
 * Roll a fresh drug as a snapshot — the destructive half of editing (requirement 4.3), and what
 * `ARTIFACT_EDITORS` registers as this kind's roller.
 */
export function rollDrugSnapshot(seed: string): DrugSnapshot {
  return toDrugSnapshot(rollDrug(seed));
}
