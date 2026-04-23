import type { ChargeGlyph } from '../../charge-types.js';
import fleurDeLisSVG from './fleur-de-lis.svg?raw';

export const fleurDeLis: ChargeGlyph = {
  name: 'fleur-de-lis',
  pluralName: 'fleur-de-lises',
  SVG: fleurDeLisSVG,
  chargeType: 'regular',
  tags: ['fleur-de-lis', 'plants'],
};
