import { getChargeGlyphByName } from '$lib/charges/charge-data.js';
import { tintChargeSvg } from '$lib/charges/tint_charge_svg.js';
import { singleChargeCenterArrangement } from '$lib/heraldry/charge_group_arrangements/single_charge_center.js';
import type { MerchantMark } from './merchant_mark_types.js';

/** Square viewBox side; matches heraldry charge layout scale. */
const MARK_VIEWBOX = 600;

/** Light neutral ground behind the mark (merchants’ marks on cloth/paper). */
const MARK_BG = '#F5F0E6';

/**
 * Renders a single charge on a simple square field, no shield.
 */
export function renderMerchantMarkSvg(mark: MerchantMark, width: number, height: number): string {
  const glyph = getChargeGlyphByName(mark.chargeName);
  if (!glyph) {
    return `<svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg" version="1.1" />`;
  }
  const tinted = tintChargeSvg(mark.fillHex, 'mark', glyph.SVG);
  const content = singleChargeCenterArrangement.renderSVG(tinted, MARK_VIEWBOX, MARK_VIEWBOX);
  return `<svg width="${width}" height="${height}" viewBox="0 0 ${MARK_VIEWBOX} ${MARK_VIEWBOX}" xmlns="http://www.w3.org/2000/svg" version="1.1">
<rect width="100%" height="100%" fill="${MARK_BG}"/>
${content}
</svg>`.replace(/<\?xml.*\?>/g, '');
}
