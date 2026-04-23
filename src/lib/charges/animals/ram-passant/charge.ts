import type { ChargeGlyph } from '../../charge-types.js';
import ramPassantSVG from './ram-passant.svg?raw';

export const ramPassant: ChargeGlyph = {
  name: 'ram passant',
  pluralName: 'rams passant',
  SVG: ramPassantSVG,
  chargeType: 'regular',
  tags: ['passant', 'ram', 'animals'],
};
