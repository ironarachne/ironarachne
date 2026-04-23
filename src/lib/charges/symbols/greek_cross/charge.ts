import type { ChargeGlyph } from '../../charge-types.js';
import greekCrossSVG from './greek_cross.svg?raw';

export const greekCross: ChargeGlyph = {
  name: 'greek cross',
  pluralName: 'greek crosses',
  SVG: greekCrossSVG,
  chargeType: 'regular',
  tags: ['cross', 'geometric_emblem', 'symbols'],
};
