import type { ChargeGlyph } from '../../charge-types.js';
import castleSVG from './castle.svg?raw';

export const castle: ChargeGlyph = {
  name: 'castle',
  pluralName: 'castles',
  SVG: castleSVG,
  chargeType: 'regular',
  tags: ['castle', 'objects'],
};
