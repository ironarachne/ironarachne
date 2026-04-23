import type { ChargeGlyph } from '../../charge-types.js';
import lozengeSVG from './lozenge.svg?raw';

export const lozenge: ChargeGlyph = {
  name: 'lozenge',
  pluralName: 'lozenges',
  SVG: lozengeSVG,
  chargeType: 'regular',
  tags: ['lozenge', 'geometric_emblem', 'symbols'],
};
