import type { ChargeGlyph } from '../../charge-types.js';
import stagPassantSVG from './stag-passant.svg?raw';

export const stagPassant: ChargeGlyph = {
  name: 'stag passant',
  pluralName: 'stags passant',
  SVG: stagPassantSVG,
  chargeType: 'regular',
  tags: ['passant', 'stag', 'animals'],
};
