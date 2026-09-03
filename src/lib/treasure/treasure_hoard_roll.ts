/**
 * The single path from a seed to a treasure hoard, and the record of how it was rolled.
 *
 * `generateRandomTreasureHoard` was already a pure function of seed and config — the design says so
 * and it is right. What was not was the page: `TreasureHoardGenerator.svelte` reseeded its own RNG
 * from the seed field inside an `$effect`, so the seed of the next press depended on the *text* of
 * the previous one, and it reseeded again inside `generate()` for good measure. That is the same
 * requirement 2.2 failure #66, #67 and #69 all had.
 *
 * The container types are the library's rather than the user's, so they are rebuilt here rather
 * than recorded: a provenance carrying eleven container definitions would be storing a table.
 */

import { filterContainerTypes, generateContainerTypes } from '$lib/equipment';
import type { Item } from '$lib/equipment';
import { feetToMeters } from '$lib/measurements';
import { getDefaultPotionConfig } from '$lib/potions';

import { generateRandomTreasureHoard } from './treasure_hoard.js';
import { toTreasureHoardSnapshot, type TreasureHoardSnapshot } from './treasure_hoard_snapshot.js';
import type { TreasureHoardGeneratorConfig } from './treasure_types.js';

/** The bounds the page's controls allow, and what a stored value is clamped into. */
export const MINIMUM_HOARD_VALUE = 1;
export const MAXIMUM_HOARD_VALUE = 200_000;
export const MINIMUM_ROOM_DIMENSION = 1;

/**
 * What the generator records about how it rolled, and what a re-roll reads back.
 *
 * Stated as a type so the two ends — what is written as provenance and what a re-roll expects to
 * find — are in one place and drift loudly instead of quietly. It is the page's twelve controls.
 *
 * `value` is in **gold**, as the page's field is; the generator works in copper and the conversion
 * happens in one place, here. Recording the number the user typed is what makes a re-roll agree
 * with the control they set.
 */
export type TreasureHoardGeneratorConfigRecord = {
  value: number;
  coinsProportion: number;
  gemsProportion: number;
  artProportion: number;
  mundaneItemProportion: number;
  magicItemProportion: number;
  potionProportion: number;
  allowPotionVariations: boolean;
  allowPotionHomebrew: boolean;
  roomWidth: number;
  roomLength: number;
  roomHeight: number;
};

/** The settings a page opens on, and what an unreadable provenance record falls back to. */
export function defaultTreasureHoardConfigRecord(): TreasureHoardGeneratorConfigRecord {
  return {
    value: 200,
    coinsProportion: 80,
    gemsProportion: 15,
    artProportion: 5,
    mundaneItemProportion: 20,
    magicItemProportion: 5,
    potionProportion: 0,
    allowPotionVariations: false,
    allowPotionHomebrew: false,
    roomWidth: 10,
    roomLength: 10,
    roomHeight: 10,
  };
}

function readNumber(value: unknown, fallback: number, minimum: number, maximum = Infinity): number {
  if (typeof value !== 'number' || !Number.isFinite(value)) {
    return fallback;
  }
  return Math.min(Math.max(Math.round(value), minimum), maximum);
}

function readBoolean(value: unknown, fallback: boolean): boolean {
  return typeof value === 'boolean' ? value : fallback;
}

/**
 * Read a stored provenance config back into the settings a roll needs.
 *
 * Numbers are clamped rather than dropped: a proportion outside the page's own bounds is still a
 * number a roll can honour, and a hoard worth nothing is not. Anything that is not a number at all
 * falls back to the default, because a config written by a build that spelled these differently
 * should re-roll the ordinary way rather than from a field it misread.
 */
export function readTreasureHoardConfig(
  config: Record<string, unknown>,
): TreasureHoardGeneratorConfigRecord {
  const defaults = defaultTreasureHoardConfigRecord();

  return {
    value: readNumber(config.value, defaults.value, MINIMUM_HOARD_VALUE, MAXIMUM_HOARD_VALUE),
    coinsProportion: readNumber(config.coinsProportion, defaults.coinsProportion, 0, 100),
    gemsProportion: readNumber(config.gemsProportion, defaults.gemsProportion, 0, 100),
    artProportion: readNumber(config.artProportion, defaults.artProportion, 0, 100),
    mundaneItemProportion: readNumber(
      config.mundaneItemProportion,
      defaults.mundaneItemProportion,
      0,
      100,
    ),
    magicItemProportion: readNumber(
      config.magicItemProportion,
      defaults.magicItemProportion,
      0,
      100,
    ),
    potionProportion: readNumber(config.potionProportion, defaults.potionProportion, 0, 100),
    allowPotionVariations: readBoolean(
      config.allowPotionVariations,
      defaults.allowPotionVariations,
    ),
    allowPotionHomebrew: readBoolean(config.allowPotionHomebrew, defaults.allowPotionHomebrew),
    roomWidth: readNumber(config.roomWidth, defaults.roomWidth, MINIMUM_ROOM_DIMENSION),
    roomLength: readNumber(config.roomLength, defaults.roomLength, MINIMUM_ROOM_DIMENSION),
    roomHeight: readNumber(config.roomHeight, defaults.roomHeight, MINIMUM_ROOM_DIMENSION),
  };
}

/** The target value in copper, which is the unit the generator and every price on the site use. */
export function hoardTargetValue(config: TreasureHoardGeneratorConfigRecord): number {
  return config.value * 100;
}

/** The settings as the whole generator config the library's own roller takes. */
export function toTreasureHoardGeneratorConfig(
  config: TreasureHoardGeneratorConfigRecord,
): TreasureHoardGeneratorConfig {
  return {
    artObjectProportion: config.artProportion,
    coinProportions: config.coinsProportion,
    gemProportion: config.gemsProportion,
    mundaneItemProportion: config.mundaneItemProportion,
    magicItemProportion: config.magicItemProportion,
    potionProportion: config.potionProportion,
    potionGeneratorConfig: {
      ...getDefaultPotionConfig(),
      allowHomebrew: config.allowPotionHomebrew,
      allowProceduralNames: config.allowPotionVariations,
    },
    // The container table is the library's, not the user's: rebuilt here rather than recorded,
    // because a provenance carrying eleven container definitions would be storing a table.
    allowedContainerTypes: filterContainerTypes({}, generateContainerTypes()),
    roomDimensions: {
      width: feetToMeters(config.roomWidth),
      length: feetToMeters(config.roomLength),
      height: feetToMeters(config.roomHeight),
    },
    targetValue: hoardTargetValue(config),
  };
}

/** Roll a hoard — the one path the generator page and a re-roll both take. */
export function rollTreasureHoard(
  seed: string,
  config: TreasureHoardGeneratorConfigRecord,
): Item[] {
  return generateRandomTreasureHoard(seed, toTreasureHoardGeneratorConfig(config));
}

/**
 * Roll a fresh hoard as a snapshot — the destructive half of editing (requirement 4.3), and what
 * `ARTIFACT_EDITORS` registers as this kind's roller.
 */
export function rollTreasureHoardSnapshot(
  seed: string,
  config: TreasureHoardGeneratorConfigRecord,
): TreasureHoardSnapshot {
  return toTreasureHoardSnapshot(rollTreasureHoard(seed, config), hoardTargetValue(config));
}
