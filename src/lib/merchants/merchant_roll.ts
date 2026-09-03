/**
 * The single path from a seed to a merchant, and the record of how it was rolled.
 *
 * `generateMerchant` was already a pure function of seed and config. What was not was the page:
 * `MerchantGenerator.svelte` reseeded its own RNG from the seed field inside an `$effect`, so the
 * seed of the next press depended on the *text* of the previous one — the same fault #66 found in
 * the equipment generator, and requirement 2.2's usual failure in this repository's newer form.
 * Pressing Generate draws a fresh seed from the page's RNG now, and the roll is this function.
 *
 * `getDefaultMerchantConfig` does not read the clock, contrary to the blanket note in
 * `docs/tool-readiness.md` about fifteen `getDefault*Config` helpers. It returns six literals and
 * takes no RNG at all.
 */

import type { CharacterNameSource } from '$lib/characters';
import { getFantasyNameGeneratorSetNames } from '$lib/names';

import { generateMerchant } from './generate_merchant.js';
import { getDefaultMerchantConfig } from './merchant_generator_config.js';
import type { MerchantGeneratorConfig } from './merchant_generator_config.js';
import { toMerchantSnapshot, type MerchantSnapshot } from './merchant_snapshot.js';
import type { HonestyLevel, Merchant, PriceLevel, ShopType, VenueType } from './merchant_types.js';
import { RESOLVED_SHOP_TYPES } from './shop_catalog.js';
import {
  RESOLVED_HONESTY_LEVELS,
  RESOLVED_PRICE_LEVELS,
  RESOLVED_VENUE_TYPES,
} from './merchant_narrative.js';

/** The fewest and most stock rows the page's control allows. */
export const MINIMUM_STOCK_COUNT = 4;
export const MAXIMUM_STOCK_COUNT = 30;

/**
 * What the generator records about how it rolled, and what a re-roll reads back.
 *
 * Stated as a type so the two ends — what is written as provenance and what a re-roll expects to
 * find — are in one place and drift loudly instead of quietly. It is the page's six controls, plus
 * the two things composition supplies.
 */
export type MerchantGeneratorConfigRecord = {
  shopType: ShopType;
  venueType: VenueType;
  honesty: HonestyLevel;
  priceLevel: PriceLevel;
  stockCount: number;
  includeMerchantMark: boolean;
  /**
   * The name pattern set the proprietor was named from.
   *
   * A merchant named from a referenced culture records that culture's own pattern set here rather
   * than the culture's id, so a re-roll produces names of the same tongue without reaching back
   * into the store for an artifact it has no way to ask for. The link to the culture is an
   * artifact reference and lives beside the payload, not in this record. That is the treatment
   * `character_roll.ts` settled.
   */
  nameGeneratorSet?: string;
  /** The settlement the shop stands in, when one was referenced. */
  settlementName?: string;
};

/** The settings a page opens on, and what an unreadable provenance record falls back to. */
export function defaultMerchantGeneratorConfigRecord(): MerchantGeneratorConfigRecord {
  return {
    shopType: 'any',
    venueType: 'any',
    honesty: 'any',
    priceLevel: 'any',
    stockCount: 12,
    includeMerchantMark: true,
  };
}

function readChoice<T extends string>(value: unknown, resolved: readonly string[], fallback: T): T {
  if (value === 'any') {
    return 'any' as T;
  }
  return typeof value === 'string' && resolved.includes(value) ? (value as T) : fallback;
}

function readText(value: unknown, key: string): Record<string, string> {
  return typeof value === 'string' && value !== '' ? { [key]: value } : {};
}

/**
 * Read a stored provenance config back into the settings a roll needs.
 *
 * Anything unrecognisable falls back to the default rather than being coerced: a config written by
 * a build that spelled these differently should re-roll the ordinary way, not from a field it
 * misread. The stock count is clamped rather than dropped, because a count outside the page's own
 * bounds is still a number a roll can honour.
 */
export function readMerchantGeneratorConfig(
  config: Record<string, unknown>,
): MerchantGeneratorConfigRecord {
  const defaults = defaultMerchantGeneratorConfigRecord();

  return {
    shopType: readChoice(config.shopType, RESOLVED_SHOP_TYPES, defaults.shopType),
    venueType: readChoice(config.venueType, RESOLVED_VENUE_TYPES, defaults.venueType),
    honesty: readChoice(config.honesty, RESOLVED_HONESTY_LEVELS, defaults.honesty),
    priceLevel: readChoice(config.priceLevel, RESOLVED_PRICE_LEVELS, defaults.priceLevel),
    stockCount: clampStockCount(
      typeof config.stockCount === 'number' ? config.stockCount : defaults.stockCount,
    ),
    includeMerchantMark:
      typeof config.includeMerchantMark === 'boolean'
        ? config.includeMerchantMark
        : defaults.includeMerchantMark,
    ...readText(config.nameGeneratorSet, 'nameGeneratorSet'),
    ...readText(config.settlementName, 'settlementName'),
  };
}

/** A stock count the shop generator can survive: whole, and inside the page's own bounds. */
export function clampStockCount(count: number): number {
  if (!Number.isFinite(count)) {
    return MINIMUM_STOCK_COUNT;
  }
  return Math.min(Math.max(Math.round(count), MINIMUM_STOCK_COUNT), MAXIMUM_STOCK_COUNT);
}

/**
 * The settings as the whole generator config the library's own roller takes.
 *
 * `nameSource` is a parameter rather than part of the record because the two callers hold
 * different things: the page has a live `Culture` it just loaded from the vault, and a re-roll has
 * only the pattern set's name. Naming from the name is what makes a re-roll possible at all
 * without the artifact.
 */
export function toMerchantGeneratorConfig(
  config: MerchantGeneratorConfigRecord,
  nameSource?: CharacterNameSource,
): MerchantGeneratorConfig {
  const full = getDefaultMerchantConfig();
  full.shopType = config.shopType;
  full.venueType = config.venueType;
  full.honesty = config.honesty;
  full.priceLevel = config.priceLevel;
  const count = clampStockCount(config.stockCount);
  full.stockCount = { min: count, max: count };
  full.includeMerchantMark = config.includeMerchantMark;
  full.nameSource = nameSource ?? nameSourceForSet(config.nameGeneratorSet);
  if (config.settlementName !== undefined) {
    full.settlementName = config.settlementName;
  }
  return full;
}

/**
 * The naming a recorded pattern set asks for, or the default when this build has no such set.
 *
 * `getFantasyNameGeneratorSet` **throws** for a name it does not have, and the name recorded here
 * is usually a *culture's* — which is a generated name and is nothing like the twelve fantasy
 * presets. So a re-roll of a merchant named from a saved culture would have crashed rather than
 * fallen back, which is the opposite of what 3.3's discipline asks of every other read path.
 *
 * The fallback is the default patterns, and it is silent: a proprietor named from a tongue this
 * build cannot rebuild is still a proprietor, and the alternative is a re-roll that cannot happen
 * at all.
 */
export function nameSourceForSet(setName: string | undefined): CharacterNameSource {
  if (setName === undefined || !getFantasyNameGeneratorSetNames().includes(setName)) {
    return { kind: 'default' };
  }
  return { kind: 'preset', setName };
}

/** Roll a merchant — the one path the generator page and a re-roll both take. */
export function rollMerchant(
  seed: string,
  config: MerchantGeneratorConfigRecord,
  nameSource?: CharacterNameSource,
): Merchant {
  return generateMerchant(seed, toMerchantGeneratorConfig(config, nameSource));
}

/**
 * Roll a fresh merchant as a snapshot — the destructive half of editing (requirement 4.3), and
 * what `ARTIFACT_EDITORS` registers as this kind's roller.
 */
export function rollMerchantSnapshot(
  seed: string,
  config: MerchantGeneratorConfigRecord,
  nameSource?: CharacterNameSource,
): MerchantSnapshot {
  return toMerchantSnapshot(rollMerchant(seed, config, nameSource));
}
