import type { ChargeGlyph } from '../../charge-types.js';
import helmetSVG from './helmet.svg?raw';

export const helmet: ChargeGlyph = {
  name: 'helmet',
  pluralName: 'helmets',
  SVG: helmetSVG,
  chargeType: 'regular',
  tags: ['helmet', 'objects'],
};
