/**
 * The single path from a seed to a potion, and the record of how it was rolled.
 *
 * `generatePotion` was already a pure function of seed and config. The page was not: it built a
 * `new RNG(Date.now().toString())` **inside every press** to draw the next seed, so the seed
 * control was honoured and the seeds themselves came from the clock — requirement 2.2's oldest
 * failure in the pass, and the one `adnd_character_roll.ts` first fixed. Pressing Generate draws a
 * fresh seed from the page's own RNG now, and the roll is this function.
 *
 * `getDefaultPotionConfig` does not read the clock, contrary to the blanket note in
 * `docs/tool-readiness.md` about fifteen `getDefault*Config` helpers. It returns three literals and
 * a container config, and takes no RNG at all.
 */

import { getDefaultPotionConfig } from './potion_generator_config.js';
import type { PotionGeneratorConfig } from './potion_generator_config.js';
import { generatePotion } from './potion_generation.js';
import { toPotionSnapshot, type PotionSnapshot } from './potion_snapshot.js';
import type { Potion } from './potion_types.js';

/**
 * What the generator records about how it rolled, and what a re-roll reads back.
 *
 * Stated as a type so the two ends — what is written as provenance and what a re-roll expects to
 * find — are in one place and drift loudly instead of quietly. It is the page's two checkboxes and
 * nothing else: the catalog, the container rules and the sensory tables are the library's, not the
 * user's.
 */
export type PotionGeneratorConfigRecord = {
  allowHomebrew: boolean;
  allowProceduralNames: boolean;
};

/** The settings a page opens on, and what an unreadable provenance record falls back to. */
export function defaultPotionGeneratorConfigRecord(): PotionGeneratorConfigRecord {
  return { allowHomebrew: false, allowProceduralNames: false };
}

/**
 * Read a stored provenance config back into the settings a roll needs.
 *
 * Anything unrecognisable falls back to the default rather than being coerced: a config written by
 * a build that spelled these differently should re-roll the ordinary way, not from a field it
 * misread.
 */
export function readPotionGeneratorConfig(
  config: Record<string, unknown>,
): PotionGeneratorConfigRecord {
  const defaults = defaultPotionGeneratorConfigRecord();
  return {
    allowHomebrew:
      typeof config.allowHomebrew === 'boolean' ? config.allowHomebrew : defaults.allowHomebrew,
    allowProceduralNames:
      typeof config.allowProceduralNames === 'boolean'
        ? config.allowProceduralNames
        : defaults.allowProceduralNames,
  };
}

/** The settings as the whole generator config the library's own roller takes. */
export function toPotionGeneratorConfig(
  config: PotionGeneratorConfigRecord,
): PotionGeneratorConfig {
  const full = getDefaultPotionConfig();
  full.allowHomebrew = config.allowHomebrew;
  full.allowProceduralNames = config.allowProceduralNames;
  return full;
}

/** Roll a potion — the one path the generator page and a re-roll both take. */
export function rollPotion(seed: string, config: PotionGeneratorConfigRecord): Potion {
  return generatePotion(seed, toPotionGeneratorConfig(config));
}

/**
 * Roll a fresh potion as a snapshot — the destructive half of editing (requirement 4.3), and what
 * `ARTIFACT_EDITORS` registers as this kind's roller.
 */
export function rollPotionSnapshot(
  seed: string,
  config: PotionGeneratorConfigRecord,
): PotionSnapshot {
  return toPotionSnapshot(rollPotion(seed, config));
}
