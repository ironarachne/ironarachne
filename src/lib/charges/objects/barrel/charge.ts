import type { ChargeGlyph } from '../../charge-types.js';
import barrelSVG from './barrel.svg?raw';

export const barrel: ChargeGlyph = {
  name: 'barrel',
  pluralName: 'barrels',
  SVG: barrelSVG,
  chargeType: 'regular',
  tags: ['barrel', 'objects'],
};
