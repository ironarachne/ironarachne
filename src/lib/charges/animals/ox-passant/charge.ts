import type { ChargeGlyph } from '../../charge-types.js';
import oxPassantSVG from './ox-passant.svg?raw';

export const oxPassant: ChargeGlyph = {
  name: 'ox passant',
  pluralName: 'oxes passant',
  SVG: oxPassantSVG,
  chargeType: 'regular',
  tags: ['passant', 'ox', 'animals'],
};
