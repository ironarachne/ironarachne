import type { ChargeGlyph } from '../../charge-types.js';
import bellSVG from './bell.svg?raw';

export const bell: ChargeGlyph = {
  name: 'bell',
  pluralName: 'bells',
  SVG: bellSVG,
  chargeType: 'regular',
  tags: ['bell', 'objects'],
};
