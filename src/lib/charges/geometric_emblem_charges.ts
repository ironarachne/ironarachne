import { getAllChargeGlyphs } from './charge-data.js';
import { matchingTag } from './charge-selectors.js';
import type { ChargeGlyph } from './charge-types.js';

/**
 * Curated simple geometric charges for disc emblems and similar (not full heraldic charge sets).
 */
export function geometricEmblemChargeGlyphs(): ChargeGlyph[] {
  return matchingTag('geometric_emblem', getAllChargeGlyphs());
}
