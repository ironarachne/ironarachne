/**
 * The single path from a seed to an encounter, and the record of how it was rolled.
 *
 * Requirement 2.2 of docs/workshop.md wants the same seed and settings to give the same result.
 * `EncounterGenerator.svelte` came close: `generateEncounter` was already a pure function of seed
 * and config, and `getDefaultCharacterGenerationConfig` takes a seed. What it lacked was the record
 * — which template was chosen and whether species were forced uniform — and a page that drew each
 * new seed from `new RNG(Date.now().toString())`, a whole generator built to take one string.
 * Pressing Generate now draws a new seed from the page's own RNG, and the roll is this function.
 */

import { generateEncounter } from './encounter_generation.js';
import { toEncounterSnapshot, type EncounterSnapshot } from './encounter_snapshot.js';
import { getAllFantasyEncounterTemplates } from './encounter_templates.js';
import type { Encounter, EncounterTemplate } from './encounter_types.js';

/**
 * What the generator records about how it rolled, and what a re-roll reads back.
 *
 * Stated as a type so the two ends — what is written as provenance and what a re-roll expects to
 * find — are in one place and drift loudly instead of quietly. It is the page's two controls and
 * nothing else.
 */
export type EncounterGeneratorConfigRecord = {
  /** The template the encounter was drawn from. Absent when the page was left on "any". */
  templateName?: string;
  /** Whether every group was made to share one species. */
  forceUniformSpecies?: boolean;
};

/**
 * Read a stored provenance config back into the settings a roll needs.
 *
 * Anything unrecognisable is dropped rather than coerced: a config written by a build that spelled
 * these differently should fall back to the defaults, not roll an encounter from a field it
 * misread.
 */
export function readEncounterGeneratorConfig(
  config: Record<string, unknown>,
): EncounterGeneratorConfigRecord {
  return {
    ...(typeof config.templateName === 'string' && config.templateName !== ''
      ? { templateName: config.templateName }
      : {}),
    ...(typeof config.forceUniformSpecies === 'boolean'
      ? { forceUniformSpecies: config.forceUniformSpecies }
      : {}),
  };
}

/**
 * The templates a roll may draw from: the one named, or all of them.
 *
 * A template this build no longer has falls back to the whole table rather than throwing: a
 * re-roll that cannot happen at all is a worse answer than one from a template the user did not
 * pick, and the page's own "any" is exactly that.
 */
export function resolveEncounterTemplates(templateName: string | undefined): EncounterTemplate[] {
  const all = getAllFantasyEncounterTemplates();
  const chosen = templateName === undefined ? undefined : all.find((t) => t.name === templateName);
  return chosen === undefined ? all : [chosen];
}

/**
 * Roll an encounter from a seed and a set of options — the one path the generator page and a
 * re-roll both take.
 *
 * `generateEncounter` writes a chosen species into the config it is handed when species are forced
 * uniform, which is why a fresh config is built here per call rather than shared.
 */
export function rollEncounter(seed: string, config: EncounterGeneratorConfigRecord): Encounter {
  return generateEncounter(seed, {
    possibleTemplates: resolveEncounterTemplates(config.templateName),
    forceUniformSpecies: config.forceUniformSpecies ?? false,
  });
}

/**
 * Roll a fresh encounter as a snapshot — the destructive half of editing (requirement 4.3), and
 * what `ARTIFACT_EDITORS` registers as this kind's roller.
 */
export function rollEncounterSnapshot(
  seed: string,
  config: EncounterGeneratorConfigRecord,
): EncounterSnapshot {
  return toEncounterSnapshot(rollEncounter(seed, config));
}
