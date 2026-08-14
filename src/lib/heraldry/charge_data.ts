import { getAllChargeGlyphs, matchingAnyTags } from '$lib/charges';
import { asHeraldryCharge, type Charge } from './charge_heraldry.js';

/**
 * All charge glyphs with a default tincture (sable) for config lists and generation.
 */
export function getAllCharges(): Charge[] {
  return getAllChargeGlyphs().map((g) => asHeraldryCharge(g));
}

export function getChargesMatchingAnyTags(tags: string[]): Charge[] {
  return matchingAnyTags(tags, getAllChargeGlyphs()).map((g) => asHeraldryCharge(g));
}
