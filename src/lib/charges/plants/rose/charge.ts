import type { ChargeGlyph } from '../../charge-types.js';
import roseSVG from './rose.svg?raw';

export const rose: ChargeGlyph = {
  name: 'rose',
  pluralName: 'roses',
  SVG: roseSVG,
  chargeType: 'regular',
  tags: ['plant', 'rose', 'beauty'],
};
