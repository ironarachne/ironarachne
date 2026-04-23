import type { ChargeGlyph } from '$lib/charges/charge-types.js';
import type { RNG } from '@ironarachne/rng';
import { MEDIEVAL_DYE_SWATCHES } from './medieval_dye_colors.js';
import type { MerchantMark } from './merchant_mark_types.js';

export function generateMerchantMark(
  rng: RNG,
  options: { chargeOptions: ChargeGlyph[] },
): MerchantMark {
  if (options.chargeOptions.length === 0) {
    throw new Error('generateMerchantMark requires at least one charge option');
  }
  const glyph = rng.item(options.chargeOptions);
  const fill = rng.weighted(
    MEDIEVAL_DYE_SWATCHES.map((s) => ({ commonality: s.commonality, value: s })),
  );
  return { chargeName: glyph.name, fillHex: fill.hex };
}
