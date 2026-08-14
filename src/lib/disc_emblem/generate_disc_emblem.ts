import type { ChargeGlyph } from '$lib/charges';
import type { RNG } from '@ironarachne/rng';
import { pickContrastingPair } from '$lib/display_colors';
import type { DiscEmblem } from './disc_emblem_types.js';

export function generateDiscEmblem(
  rng: RNG,
  options: { chargeOptions: ChargeGlyph[] },
): DiscEmblem {
  if (options.chargeOptions.length === 0) {
    throw new Error('generateDiscEmblem requires at least one charge option');
  }
  const glyph = rng.item(options.chargeOptions);
  const { ground, charge } = pickContrastingPair(rng);
  return {
    chargeName: glyph.name,
    groundHex: ground,
    chargeHex: charge,
  };
}
