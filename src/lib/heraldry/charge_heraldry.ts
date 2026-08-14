import type { ChargeGlyph } from '$lib/charges';
import type { Tincture } from './tinctures.js';
import * as Tinctures from './tinctures.js';

export type Charge = ChargeGlyph & { tincture: Tincture };

export function asHeraldryCharge(
  glyph: ChargeGlyph,
  tincture: Tincture = Tinctures.byName('sable'),
): Charge {
  return { ...glyph, tincture };
}
