/**
 * Rebuilding arms from a snapshot, kept apart from `heraldry_snapshot.ts` because of what it
 * costs. A snapshot stores names; turning them back into a device means looking each one up, and
 * the charge lookup reaches `$lib/charges` — 18 MB of glyph art, measured. Writing a snapshot
 * needs none of that, so the two directions are not the same weight and do not belong in the
 * same module: anything that only stores, lists, or validates heraldry can now do so without
 * pulling the art in.
 */

import { getChargeGlyphByName } from '$lib/charges';

import type { Arms } from './arms.js';

import * as Arrangements from './charge_group_arrangements/index.js';
import type { ChargeGroup } from './charge_group.js';
import type { Device } from './device.js';
import * as Fields from './fields.js';
import {
  normalizeHeraldryGeneratorOptions,
  type HeraldrySnapshot,
  type RestoredHeraldry,
  type StoredArms,
  type StoredChargeGroup,
  type StoredDevice,
  type StoredVariation,
} from './heraldry_snapshot.js';
import * as Tinctures from './tinctures.js';
import type { Variation } from './variation.js';
import * as Variations from './variations.js';

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

/**
 * A device rebuilt from the names it was stored under. The expensive half: every charge name is
 * resolved against `$lib/charges`, which is why this module is separate from the writing side.
 */
export function deviceFromStored(stored: StoredDevice): Device {
  const fieldTemplate = Fields.byName(stored.fieldName);
  return {
    field: {
      ...fieldTemplate,
      variations: stored.variations.map(variationFromStored),
    },
    chargeGroups: stored.chargeGroups.map(chargeGroupFromStored),
  };
}

/** Arms rebuilt from {@link StoredArms} — an organization's emblem, a character's own device. */
export function armsFromStored(stored: StoredArms): Arms {
  return { device: deviceFromStored(stored.device), blazon: stored.blazon };
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
