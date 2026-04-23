import type { ChargeGlyph } from '../../charge-types.js';
import mintSVG from './mint.svg?raw';

export const mint: ChargeGlyph = {
  name: 'mint',
  pluralName: 'mints',
  SVG: mintSVG,
  chargeType: 'regular',
  tags: ['plants', 'mint'],
};
