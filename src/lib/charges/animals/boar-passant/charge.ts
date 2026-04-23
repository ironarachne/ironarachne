import type { ChargeGlyph } from '../../charge-types.js';
import boarPassantSVG from './boar-passant.svg?raw';

export const boarPassant: ChargeGlyph = {
  name: 'boar passant',
  pluralName: 'boars passant',
  SVG: boarPassantSVG,
  chargeType: 'regular',
  tags: ['boar', 'passant', 'animals'],
};
