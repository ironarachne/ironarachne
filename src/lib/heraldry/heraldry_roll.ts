/**
 * The single path from a seed and a set of options to a coat of arms.
 *
 * Every other tool in the readiness pass grew one of these; heraldry's arrived last because its
 * roll was the most tangled of them. The generator page assembled a `HeraldryGeneratorConfig`
 * inline from a dozen pieces of component state, and that assembly *consumes the RNG* — the number
 * of charges, the charge tincture and the two field-tincture pools are all drawn before
 * `generateHeraldry` is called. So the seed alone never reproduced anything; the page's local
 * variables were half the input.
 *
 * That is what requirement 2.2 asks to be fixed, and it is what requirement 4.3 needs: a re-roll
 * from a saved artifact's provenance has only a seed and a recorded config, and no page.
 *
 * **The order of the draws here is load-bearing.** It is transcribed from the page as it stood,
 * because changing it changes what every existing seed produces — a coat of arms someone saved a
 * URL for, or wrote down. The transcription was checked seed by seed against the page's own output
 * before the page was changed to call this.
 */

import { RNG } from '@ironarachne/rng';

import * as Charges from '$lib/charges';

import type { Arms } from './arms.js';
import { asHeraldryCharge, type Charge } from './charge_heraldry.js';
import { generateHeraldry } from './generator.js';
import { mergeHeraldryGeneratorConfig, type HeraldryGeneratorConfig } from './generatorconfig.js';
import {
  defaultHeraldryGeneratorOptions,
  normalizeHeraldryGeneratorOptions,
  toHeraldrySnapshot,
  type HeraldryGeneratorOptionsSnapshot,
  type HeraldrySnapshot,
} from './heraldry_snapshot.js';
import {
  buildVariationSlotPreferences,
  fieldDivisionNameFromOption,
  hasPinnedFieldTinctures,
  resolveFieldOptions,
} from './heraldry_ui_options.js';
import * as Tinctures from './tinctures.js';
import * as Variations from './variations.js';

/** The size the generator draws at, and the size a stored coat of arms is redrawn at. */
export const HERALDRY_WIDTH = 600 as const;
export const HERALDRY_HEIGHT = 660 as const;

/** How many charges each option asks for. `any` lets the seed choose. */
const CHARGE_COUNTS: Record<string, number> = {
  none: 0,
  one: 1,
  two: 2,
  three: 3,
  four: 4,
};

/**
 * A rolled coat of arms and the options it was actually rolled with.
 *
 * The options travel back out normalized, because provenance has to record what was *used*: an
 * options record written before field divisions existed is missing three fields, and recording it
 * as it arrived would be provenance a re-roll reads differently from the roll it describes.
 */
export type HeraldryRoll = {
  arms: Arms;
  generatorOptions: HeraldryGeneratorOptionsSnapshot;
};

function readString(value: unknown, fallback: string): string {
  return typeof value === 'string' ? value : fallback;
}

function isStringArray(value: unknown): value is string[] {
  return Array.isArray(value) && value.every((entry) => typeof entry === 'string');
}

function isStringMatrix(value: unknown): value is string[][] {
  return Array.isArray(value) && value.every((row) => isStringArray(row));
}

/**
 * Read a stored provenance config back into the options a roll needs.
 *
 * Provenance is `Record<string, unknown>` because the store cannot know what any tool puts in it,
 * so this is the boundary where that becomes typed. Anything unrecognisable falls back to the
 * default rather than being coerced — a setting this build misread would draw arms nobody asked
 * for and call them the same ones.
 *
 * `lockSeed` is read because it is part of the stored shape, not because a roll uses it: it says
 * what the *next* roll should do with the seed box, and a re-roll is handed its seed anyway.
 */
export function readHeraldryGeneratorConfig(
  config: Record<string, unknown>,
): HeraldryGeneratorOptionsSnapshot {
  const defaults = defaultHeraldryGeneratorOptions();
  return normalizeHeraldryGeneratorOptions({
    heraldryTag: readString(config.heraldryTag, defaults.heraldryTag),
    chargeTinctureName: readString(config.chargeTinctureName, defaults.chargeTinctureName),
    numberOfChargesOption: readString(config.numberOfChargesOption, defaults.numberOfChargesOption),
    chargePosition: readString(config.chargePosition, defaults.chargePosition),
    lockSeed: typeof config.lockSeed === 'boolean' ? config.lockSeed : defaults.lockSeed,
    ...(typeof config.fieldDivisionOption === 'string'
      ? { fieldDivisionOption: config.fieldDivisionOption }
      : {}),
    ...(isStringArray(config.variationSlotOptions)
      ? { variationSlotOptions: config.variationSlotOptions }
      : {}),
    ...(isStringMatrix(config.variationTinctureOptions)
      ? { variationTinctureOptions: config.variationTinctureOptions }
      : {}),
  });
}

/**
 * The charges a tag admits. `any` is every charge this build has.
 *
 * Each glyph is copied on the way out, with the tables' own default tincture on it. The copy is
 * load bearing: `generateHeraldry` writes the drawn tincture onto the charge it picked, so handing
 * it the shared glyph list would tint every later coat of arms' idea of that charge.
 */
export function chargesForTag(tag: string): Charge[] {
  const all = Charges.all();
  const matching = tag === 'any' ? all : Charges.matchingTag(tag, all);
  return matching.map((glyph) => asHeraldryCharge(glyph));
}

/**
 * The number of charges an option asks for, drawing one when it says `any`.
 *
 * The weights are the page's: one charge is the ordinary case, none is common, and four is rare.
 * A draw happens even when the option pins a count, because the pin is applied afterwards — that
 * is how the page did it, and skipping the draw would shift every seed's later choices.
 */
function chargeCountForOption(option: string, rng: RNG): number {
  const drawn = rng.weighted([
    { value: 0, commonality: 20 },
    { value: 1, commonality: 55 },
    { value: 2, commonality: 5 },
    { value: 3, commonality: 3 },
    { value: 4, commonality: 2 },
  ]);
  return CHARGE_COUNTS[option] ?? drawn;
}

/**
 * The tinctures the field may use, given the charge's own.
 *
 * The rule is contrast: a colour charge wants metal behind it and a metal charge wants colour, with
 * an occasional stain thrown in. The two `rng.int` calls happen only on the colour branch, exactly
 * as they did on the page — they are part of the sequence, so moving them would change what every
 * seed draws next.
 *
 * Skipped entirely when the user has pinned any field tincture: the pools are then whatever the
 * pins say, and `buildVariationSlotPreferences` is what carries them.
 */
function fieldTincturePools(
  chargeTinctureType: string,
  pinned: boolean,
  rng: RNG,
): { fieldTinctures1: Tinctures.Tincture[]; fieldTinctures2: Tinctures.Tincture[] } {
  if (pinned) {
    return { fieldTinctures1: Tinctures.all(), fieldTinctures2: Tinctures.all() };
  }

  let types1: string[] = [];
  let types2: string[] = [];
  if (chargeTinctureType === 'color' || chargeTinctureType === 'stain') {
    types1 = ['metal'];
    types2 = ['metal'];
  } else {
    types1 = ['color'];
    types2 = ['color'];
    if (rng.int(1, 100) > 70) {
      types1.push('stain');
    }
    if (rng.int(1, 100) > 80) {
      types2.push('stain');
    }
  }
  types1.push('fur');

  return { fieldTinctures1: Tinctures.ofTypes(types1), fieldTinctures2: Tinctures.ofTypes(types2) };
}

/**
 * Build the generator config a set of options and a seeded RNG describe.
 *
 * Exported because the generator page needs the same config for the roll it performs itself —
 * one assembly, one order of draws, one place to change it.
 */
export function heraldryConfigFromOptions(
  options: HeraldryGeneratorOptionsSnapshot,
  rng: RNG,
): HeraldryGeneratorConfig {
  const normalized = normalizeHeraldryGeneratorOptions(options);
  const chargeCount = chargeCountForOption(normalized.numberOfChargesOption, rng);

  const chargeTincture =
    normalized.chargeTinctureName === 'any'
      ? Tinctures.randomChargeTincture(rng)
      : Tinctures.byName(normalized.chargeTinctureName);

  const { fieldTinctures1, fieldTinctures2 } = fieldTincturePools(
    chargeTincture.type,
    hasPinnedFieldTinctures(normalized.variationTinctureOptions!),
    rng,
  );

  return mergeHeraldryGeneratorConfig({
    chargeCount,
    chargeOptions: chargesForTag(normalized.heraldryTag),
    chargeTinctures: [chargeTincture],
    chargePosition: normalized.chargePosition === 'normal' ? undefined : normalized.chargePosition,
    fieldOptions: resolveFieldOptions(normalized.fieldDivisionOption!),
    fieldDivisionName: fieldDivisionNameFromOption(normalized.fieldDivisionOption!),
    variationSlotPreferences: buildVariationSlotPreferences(
      normalized.variationSlotOptions!,
      normalized.variationTinctureOptions!,
    ),
    variationOptions: Variations.all(),
    fieldTinctures1,
    fieldTinctures2,
    width: HERALDRY_WIDTH,
    height: HERALDRY_HEIGHT,
    rng,
  });
}

/**
 * Roll a coat of arms from a seed and a set of options — the one path the generator page and a
 * re-roll both take.
 */
export function rollHeraldry(
  seed: string,
  options: HeraldryGeneratorOptionsSnapshot = defaultHeraldryGeneratorOptions(),
): HeraldryRoll {
  const normalized = normalizeHeraldryGeneratorOptions(options);
  const arms = generateHeraldry(heraldryConfigFromOptions(normalized, new RNG(seed)));
  return { arms, generatorOptions: normalized };
}

/**
 * Roll a fresh coat of arms as a snapshot — the destructive half of editing (requirement 4.3), and
 * what `ARTIFACT_EDITORS` registers as this kind's roller.
 */
export function rollHeraldrySnapshot(
  seed: string,
  options: HeraldryGeneratorOptionsSnapshot = defaultHeraldryGeneratorOptions(),
): HeraldrySnapshot {
  const rolled = rollHeraldry(seed, options);
  return toHeraldrySnapshot(rolled.arms, seed, rolled.generatorOptions);
}
