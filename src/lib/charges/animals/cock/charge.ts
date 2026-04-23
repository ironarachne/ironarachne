import type { ChargeGlyph } from '../../charge-types.js';
import cockSVG from './cock.svg?raw';

export const cock: ChargeGlyph = {
  name: 'cock',
  pluralName: 'cocks',
  SVG: cockSVG,
  chargeType: 'regular',
  tags: ['animal', 'cock', 'vigilance'],
};
