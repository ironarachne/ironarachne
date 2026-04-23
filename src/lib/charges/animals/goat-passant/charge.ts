import type { ChargeGlyph } from '../../charge-types.js';
import goatPassantSVG from './goat-passant.svg?raw';

export const goatPassant: ChargeGlyph = {
  name: 'goat passant',
  pluralName: 'goats passant',
  SVG: goatPassantSVG,
  chargeType: 'regular',
  tags: ['passant', 'goat', 'animals'],
};
