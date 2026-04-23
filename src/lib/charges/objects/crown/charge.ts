import type { ChargeGlyph } from '../../charge-types.js';
import crownSVG from './crown.svg?raw';

export const crown: ChargeGlyph = {
  name: 'crown',
  pluralName: 'crowns',
  SVG: crownSVG,
  chargeType: 'regular',
  tags: ['crown', 'objects'],
};
