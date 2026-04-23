import type { ChargeGlyph } from '../../charge-types.js';
import compassSVG from './compass.svg?raw';

export const compass: ChargeGlyph = {
  name: 'compass',
  pluralName: 'compasses',
  SVG: compassSVG,
  chargeType: 'regular',
  tags: ['compass', 'objects'],
};
