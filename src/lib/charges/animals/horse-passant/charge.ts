import type { ChargeGlyph } from '../../charge-types.js';
import horsePassantSVG from './horse-passant.svg?raw';

export const horsePassant: ChargeGlyph = {
  name: 'horse passant',
  pluralName: 'horses passant',
  SVG: horsePassantSVG,
  chargeType: 'regular',
  tags: ['passant', 'horse', 'animals'],
};
