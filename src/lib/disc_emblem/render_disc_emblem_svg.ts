import { getChargeGlyphByName, tintChargeSvg } from '$lib/charges';
import { singleChargeCenterArrangement } from '$lib/heraldry';
import type { DiscEmblem } from './disc_emblem_types.js';

const DISC_VIEWBOX = 600;
const DISC_CX = DISC_VIEWBOX / 2;
const DISC_CY = DISC_VIEWBOX / 2;
const DISC_R = (DISC_VIEWBOX / 2) * 0.92;
const CLIP_ID = 'discEmblemClip';

/**
 * One charge centered on a circular field (SVG), matching merchant mark scale.
 */
export function renderDiscEmblemSvg(disc: DiscEmblem, width: number, height: number): string {
  const glyph = getChargeGlyphByName(disc.chargeName);
  if (!glyph) {
    return `<svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg" version="1.1" />`;
  }
  const tinted = tintChargeSvg(disc.chargeHex, 'disc', glyph.SVG);
  const content = singleChargeCenterArrangement.renderSVG(tinted, DISC_VIEWBOX, DISC_VIEWBOX);
  return `<svg width="${width}" height="${height}" viewBox="0 0 ${DISC_VIEWBOX} ${DISC_VIEWBOX}" xmlns="http://www.w3.org/2000/svg" version="1.1">
<defs>
<clipPath id="${CLIP_ID}"><circle cx="${DISC_CX}" cy="${DISC_CY}" r="${DISC_R}"/></clipPath>
</defs>
<circle cx="${DISC_CX}" cy="${DISC_CY}" r="${DISC_R}" fill="${disc.groundHex}"/>
<g clip-path="url(#${CLIP_ID})">${content}</g>
</svg>`.replace(/<\?xml.*\?>/g, '');
}
