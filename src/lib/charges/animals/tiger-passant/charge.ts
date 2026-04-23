import type { ChargeGlyph } from '../../charge-types.js';
import tigerPassantSVG from './tiger-passant.svg?raw';

export const tigerPassant: ChargeGlyph = {
  name: 'tiger passant',
  pluralName: 'tigers passant',
  SVG: tigerPassantSVG,
  chargeType: 'regular',
  tags: ['passant', 'tiger', 'animals'],
};
