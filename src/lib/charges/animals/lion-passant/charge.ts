import type { ChargeGlyph } from '../../charge-types.js';
import lionPassantSVG from './lion-passant.svg?raw';

export const lionPassant: ChargeGlyph = {
  name: 'lion passant',
  pluralName: 'lions passant',
  SVG: lionPassantSVG,
  chargeType: 'regular',
  tags: ['lion', 'passant', 'animals'],
};
