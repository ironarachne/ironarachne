import type { ChargeGlyph } from '../../charge-types.js';
import wolfPassantSVG from './wolf-passant.svg?raw';

export const wolfPassant: ChargeGlyph = {
  name: 'wolf passant',
  pluralName: 'wolves passant',
  SVG: wolfPassantSVG,
  chargeType: 'regular',
  tags: ['passant', 'wolf', 'animals'],
};
