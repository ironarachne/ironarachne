import type { ChargeGlyph } from '../../charge-types.js';
import bearPassantSVG from './bear-passant.svg?raw';

export const bearPassant: ChargeGlyph = {
  name: 'bear passant',
  pluralName: 'bears passant',
  SVG: bearPassantSVG,
  chargeType: 'regular',
  tags: ['passant', 'bear', 'animals'],
};
