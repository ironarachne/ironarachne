import * as RNG from '@ironarachne/rng';
import { MAX_CHARGES_PER_GROUP } from './charge_group_arrangements/index.js';
import type { Charge } from './charge_heraldry.js';
import { getAllCharges } from './charge_data.js';
import type { Field } from './field.js';
import * as Fields from './fields.js';
import type { Tincture } from './tinctures.js';
import * as Tinctures from './tinctures.js';
import type { Variation } from './variation.js';
import * as Variations from './variations.js';

export type VariationSlotPreference = {
  variationName?: string;
  tinctureNames?: string[];
};

export type HeraldryGeneratorConfig = {
  chargeCount: number;
  chargeOptions: Array<Charge>;
  chargeTinctures: Array<Tincture>;
  fieldOptions: Array<Field>;
  fieldTinctures1: Array<Tincture>;
  fieldTinctures2: Array<Tincture>;
  variationOptions: Array<Variation>;
  fieldDivisionName?: string;
  variationSlotPreferences?: VariationSlotPreference[];
  chargePosition?: string;
  width: number;
  height: number;
  rng: RNG.RNG;
};

export const DEFAULT_WIDTH = 600;
export const DEFAULT_HEIGHT = 660;

// Build a default config. When an RNG is provided, it will be used for chargeCount
// selection to ensure determinism in tests; otherwise falls back to RNG.item.
export function getDefaultHeraldryGeneratorConfig(rng?: RNG.RNG): HeraldryGeneratorConfig {
  if (!rng) {
    rng = new RNG.RNG(Date.now().toString());
  }

  return {
    chargeCount: rng.int(1, 3),
    chargeOptions: getAllCharges(),
    chargeTinctures: Tinctures.ofTypes(['metal', 'color', 'stain']),
    fieldOptions: Fields.all(),
    fieldTinctures1: Tinctures.all(),
    fieldTinctures2: Tinctures.all(),
    variationOptions: Variations.all(),
    width: DEFAULT_WIDTH,
    height: DEFAULT_HEIGHT,
    rng: rng,
  } as const;
}

export function validateHeraldryGeneratorConfig(
  cfg: HeraldryGeneratorConfig,
): HeraldryGeneratorConfig {
  if (!Number.isFinite(cfg.width) || cfg.width <= 0) {
    throw new Error(`Invalid width: ${cfg.width}`);
  }
  if (!Number.isFinite(cfg.height) || cfg.height <= 0) {
    throw new Error(`Invalid height: ${cfg.height}`);
  }
  if (!Number.isInteger(cfg.chargeCount) || cfg.chargeCount < 0) {
    throw new Error(`Invalid chargeCount: ${cfg.chargeCount}`);
  }
  if (cfg.chargeCount > MAX_CHARGES_PER_GROUP) {
    throw new Error(
      `Invalid chargeCount: ${cfg.chargeCount} (supported: 0–${MAX_CHARGES_PER_GROUP})`,
    );
  }
  return cfg;
}

export function mergeHeraldryGeneratorConfig(
  partial: Partial<HeraldryGeneratorConfig> = {},
): HeraldryGeneratorConfig {
  const base = getDefaultHeraldryGeneratorConfig();
  // Shallow merge is sufficient because values are primitives or arrays
  return validateHeraldryGeneratorConfig({ ...base, ...partial });
}
