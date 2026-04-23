import type { ChargeGlyph } from '../../charge-types.js';
import dogPassantSVG from './dog-passant.svg?raw';

export const dogPassant: ChargeGlyph = {
  name: 'dog passant',
  pluralName: 'dogs passant',
  SVG: dogPassantSVG,
  chargeType: 'regular',
  tags: ['passant', 'dog', 'animals'],
};
