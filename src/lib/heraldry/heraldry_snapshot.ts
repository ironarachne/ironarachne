import { getChargeGlyphByName } from '$lib/charges';
import type { Arms } from './arms.js';
import * as Arrangements from './charge_group_arrangements/index.js';
import type { ChargeGroup } from './charge_group.js';
import type { Device } from './device.js';
import * as Fields from './fields.js';
import * as Tinctures from './tinctures.js';
import type { Variation } from './variation.js';
import * as Variations from './variations.js';

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

function toStoredDevice(device: Device): StoredDevice {
  return {
    fieldName: device.field.name,
    variations: device.field.variations.map(toStoredVariation),
    chargeGroups: device.chargeGroups.map(toStoredChargeGroup),
  };
}

function variationFromStored(stored: StoredVariation): Variation {
  const template = Variations.byName(stored.variationName);
  return {
    ...template,
    tinctures: stored.tinctureNames.map((name) => Tinctures.byName(name)),
  };
}

function chargeGroupFromStored(stored: StoredChargeGroup): ChargeGroup {
  const glyph = getChargeGlyphByName(stored.chargeName);
  if (glyph === undefined) {
    throw new Error(`failed to find a charge with name "${stored.chargeName}"`);
  }
  return {
    charge: {
      ...glyph,
      tincture: Tinctures.byName(stored.chargeTinctureName),
    },
    numberOfCharges: stored.numberOfCharges,
    arrangement: Arrangements.byName(stored.arrangementName),
    position: stored.position,
  };
}

function deviceFromStored(stored: StoredDevice): Device {
  const fieldTemplate = Fields.byName(stored.fieldName);
  return {
    field: {
      ...fieldTemplate,
      variations: stored.variations.map(variationFromStored),
    },
    chargeGroups: stored.chargeGroups.map(chargeGroupFromStored),
  };
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

export function heraldryFromSnapshot(snapshot: HeraldrySnapshot): RestoredHeraldry {
  const device = deviceFromStored(snapshot.device);
  return {
    arms: {
      device,
      blazon: snapshot.blazon,
    },
    seed: snapshot.seed,
    blazon: snapshot.blazon,
    generatorOptions: normalizeHeraldryGeneratorOptions(snapshot.generatorOptions),
  };
}
