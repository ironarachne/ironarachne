import { getAllChargeGlyphs } from '$lib/charges/charge-data.js';
import { matchingAnyTags } from '$lib/charges/charge-selectors.js';
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
