import type { ChargeGlyph } from '../../charge-types.js';
import galleonSVG from './galleon.svg?raw';

export const galleon: ChargeGlyph = {
  name: 'galleon',
  pluralName: 'galleons',
  SVG: galleonSVG,
  chargeType: 'regular',
  tags: ['galleon', 'objects'],
};
