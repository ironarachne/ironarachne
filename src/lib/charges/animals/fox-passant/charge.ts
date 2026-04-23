import type { ChargeGlyph } from '../../charge-types.js';
import foxPassantSVG from './fox-passant.svg?raw';

export const foxPassant: ChargeGlyph = {
  name: 'fox passant',
  pluralName: 'foxes passant',
  SVG: foxPassantSVG,
  chargeType: 'regular',
  tags: ['passant', 'fox', 'animals'],
};
