/**
 * The single path from a seed to a constructed language.
 *
 * Requirement 2.2 of docs/workshop.md wants the same seed and settings to give the same language,
 * and 2.3 wants the seed on screen. **This tool failed 2.3 outright**: `LanguageGenerator.svelte`
 * rendered no `SeedControls` at all and drew a fresh seed from `Date.now()` inside `generate()`, so
 * a language a user liked could not be got back — there was nothing to write down. The page now
 * carries the control and the roll below is a pure function of the seed.
 *
 * `getDefaultLanguageGeneratorConfig` takes an RNG rather than defaulting one, so this library is
 * not among the fifteen helpers across six libraries that the readiness spine found seeding
 * themselves from the clock. The config is built here all the same, in one place, so the page and a
 * re-roll cannot drift apart in what they hand the generator.
 *
 * **There is no config to record.** The generator's only input is the phoneme-set table, which is
 * the library's rather than the user's — a provenance carrying every phoneme set would be storing a
 * table. Everything else about a language is drawn from the seed, so the seed is the whole
 * provenance.
 */

import { RNG } from '@ironarachne/rng';

import { generateConstructedLanguage } from './generator.js';
import { getDefaultLanguageGeneratorConfig } from './generatorconfig.js';
import type { ConstructedLanguage } from './language_types.js';
import { toLanguageSnapshot, type LanguageSnapshot } from './language_snapshot.js';

/** Roll a language from a seed — the one path the generator page and a re-roll both take. */
export function rollLanguage(seed: string): ConstructedLanguage {
  return generateConstructedLanguage(getDefaultLanguageGeneratorConfig(new RNG(seed)));
}

/**
 * Roll a fresh language snapshot from the seed it was first made with — the destructive half of
 * editing (requirement 4.3), and what `ARTIFACT_EDITORS` registers as this kind's roller.
 *
 * This is the one place a lexicon is regenerated rather than read, and that asymmetry is the point:
 * storing the lexicon makes an edit survive, and re-rolling from the seed is how a user asks for a
 * different language rather than a corrected one.
 */
export function rollLanguageSnapshot(seed: string): LanguageSnapshot {
  return toLanguageSnapshot(rollLanguage(seed));
}
