/**
 * Drawing an organization's emblem from its parameters, whichever kind it is.
 *
 * Every emblem the generator can produce has a renderer in the library that owns it; this is the
 * one switch over them, written once so the page, the editor and the SVG export draw the same
 * thing. It reads the *stored* shape, so the editor can draw from a snapshot without rebuilding
 * the arms, and a live identity converts to it in one call.
 *
 * A heraldic emblem needs an RNG because the heraldry renderer takes one for its texture noise; the
 * one handed in is seeded by the caller, so the same arms draw the same way twice.
 */

import type { RNG } from '@ironarachne/rng';

import { renderDiscEmblemSvg } from '$lib/disc_emblem';
import { armsFromStored, renderDeviceBlazon, renderHeraldryDeviceSvg } from '$lib/heraldry';
import { renderMerchantMarkSvg } from '$lib/merchant_marks';
import { renderPatternLatticeSvg } from '$lib/pattern_lattice';
import type { StoredVisualEmblem } from '$lib/visual_identity';

export const ORGANIZATION_EMBLEM_WIDTH = 200 as const;
export const ORGANIZATION_EMBLEM_HEIGHT = 220 as const;

/**
 * The emblem as SVG, or nothing for an organization with no emblem of its own.
 *
 * `null` arms — a referenced coat of arms — draw nothing here too: the caller holding the reference
 * is the one that can draw them, and it does.
 */
export function renderOrganizationEmblemSvg(
  emblem: StoredVisualEmblem,
  rng: RNG,
  width: number = ORGANIZATION_EMBLEM_WIDTH,
  height: number = ORGANIZATION_EMBLEM_HEIGHT,
): string | null {
  switch (emblem.kind) {
    case 'heraldry':
      return emblem.arms === null
        ? null
        : renderHeraldryDeviceSvg(armsFromStored(emblem.arms).device, width, height, rng);
    case 'merchant_mark':
      return renderMerchantMarkSvg(emblem.mark, width, height);
    case 'pattern_lattice':
      return renderPatternLatticeSvg(emblem.lattice, width, height);
    case 'disc_emblem':
      return renderDiscEmblemSvg(emblem.disc, width, height);
    default:
      return null;
  }
}

/** A sentence about the emblem for text that cannot carry a picture: the blazon, or a description. */
export function describeOrganizationEmblem(emblem: StoredVisualEmblem): string {
  switch (emblem.kind) {
    case 'heraldry':
      return emblem.arms === null
        ? 'Bears a saved coat of arms.'
        : `Arms: ${renderDeviceBlazon(armsFromStored(emblem.arms).device)}`;
    case 'merchant_mark':
      return `Merchant mark: ${emblem.mark.chargeName} in ${emblem.mark.fillHex}.`;
    case 'pattern_lattice':
      return `Pattern: a ${emblem.lattice.rows} by ${emblem.lattice.cols} lattice.`;
    case 'disc_emblem':
      return `Disc emblem: ${emblem.disc.chargeName} in ${emblem.disc.chargeHex} on ${emblem.disc.groundHex}.`;
    default:
      return '';
  }
}
