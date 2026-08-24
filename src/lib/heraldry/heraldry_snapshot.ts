/**
 * Writing a heraldry snapshot, and the shapes one is made of. Reading one back is
 * `heraldry_rehydrate.ts`: it needs the charge art and this does not, and keeping the two apart
 * is what lets the artifact registry know about heraldry without loading 18 MB of glyphs.
 */

import type { Arms } from './arms.js';
import type { ChargeGroup } from './charge_group.js';
import type { Device } from './device.js';
import type { Variation } from './variation.js';

export const HERALDRY_SNAPSHOT_NAME_MAX_LENGTH = 80 as const;

export type HeraldryGeneratorOptionsSnapshot = {
  heraldryTag: string;
  chargeTinctureName: string;
  numberOfChargesOption: string;
  chargePosition: string;
  lockSeed: boolean;
  fieldDivisionOption?: string;
  variationSlotOptions?: string[];
  variationTinctureOptions?: string[][];
};

export const DEFAULT_FIELD_DIVISION_OPTION = 'any' as const;

export const DEFAULT_VARIATION_SLOT_OPTIONS = ['any', 'any', 'any'] as const;

export const DEFAULT_VARIATION_TINCTURE_OPTIONS = [
  ['any', 'any'],
  ['any', 'any'],
  ['any', 'any'],
] as const;

export function defaultHeraldryGeneratorOptions(): HeraldryGeneratorOptionsSnapshot {
  return normalizeHeraldryGeneratorOptions({
    heraldryTag: 'any',
    chargeTinctureName: 'any',
    numberOfChargesOption: 'any',
    chargePosition: 'normal',
    lockSeed: false,
  });
}

export function normalizeHeraldryGeneratorOptions(
  options: HeraldryGeneratorOptionsSnapshot,
): HeraldryGeneratorOptionsSnapshot {
  return {
    ...options,
    fieldDivisionOption: options.fieldDivisionOption ?? DEFAULT_FIELD_DIVISION_OPTION,
    variationSlotOptions: options.variationSlotOptions ?? [...DEFAULT_VARIATION_SLOT_OPTIONS],
    variationTinctureOptions:
      options.variationTinctureOptions ?? DEFAULT_VARIATION_TINCTURE_OPTIONS.map((row) => [...row]),
  };
}

export type StoredVariation = {
  variationName: string;
  tinctureNames: string[];
};

export type StoredChargeGroup = {
  chargeName: string;
  chargeTinctureName: string;
  numberOfCharges: number;
  arrangementName: string;
  position?: string;
};

export type StoredDevice = {
  fieldName: string;
  variations: StoredVariation[];
  chargeGroups: StoredChargeGroup[];
};

/**
 * A coat of arms as plain data: the device by the names of its parts, and the blazon that
 * describes it.
 *
 * Separate from {@link HeraldrySnapshot}, which is a saved *artifact* and so also carries the seed
 * and the settings it was rolled from. Arms that belong to something else — an organization's
 * visual identity, a character's own device — have no such history of their own, and a type that
 * demanded one would have callers inventing seeds to satisfy it.
 */
export type StoredArms = {
  device: StoredDevice;
  blazon: string;
};

export type HeraldrySnapshot = {
  name: string;
  seed: string;
  blazon: string;
  generatorOptions: HeraldryGeneratorOptionsSnapshot;
  device: StoredDevice;
};

export type RestoredHeraldry = {
  arms: Arms;
  seed: string;
  blazon: string;
  generatorOptions: HeraldryGeneratorOptionsSnapshot;
};

function truncateBlazonName(blazon: string): string {
  if (blazon.length <= HERALDRY_SNAPSHOT_NAME_MAX_LENGTH) {
    return blazon;
  }
  return `${blazon.slice(0, HERALDRY_SNAPSHOT_NAME_MAX_LENGTH - 1)}…`;
}

function toStoredVariation(variation: Variation): StoredVariation {
  return {
    variationName: variation.name,
    tinctureNames: variation.tinctures.map((tincture) => tincture.name),
  };
}

function toStoredChargeGroup(group: ChargeGroup): StoredChargeGroup {
  return {
    chargeName: group.charge.name,
    chargeTinctureName: group.charge.tincture.name,
    numberOfCharges: group.numberOfCharges,
    arrangementName: group.arrangement.name,
    position: group.position,
  };
}

/** A device as the names of its field, variations, and charges. The cheap half of the pair. */
export function toStoredDevice(device: Device): StoredDevice {
  return {
    fieldName: device.field.name,
    variations: device.field.variations.map(toStoredVariation),
    chargeGroups: device.chargeGroups.map(toStoredChargeGroup),
  };
}

/** Arms as plain data, for anything that owns a coat of arms without owning its provenance. */
export function toStoredArms(arms: Arms): StoredArms {
  return { device: toStoredDevice(arms.device), blazon: arms.blazon };
}

export function toHeraldrySnapshot(
  arms: Arms,
  seed: string,
  generatorOptions: HeraldryGeneratorOptionsSnapshot,
): HeraldrySnapshot {
  return {
    name: truncateBlazonName(arms.blazon),
    seed,
    blazon: arms.blazon,
    generatorOptions,
    device: toStoredDevice(arms.device),
  };
}
