import type { ChargeGlyph } from '../../charge-types.js';
import allocamelusPassantSVG from './allocamelus-passant.svg?raw';

export const allocamelusPassant: ChargeGlyph = {
  name: 'allocamelus passant',
  pluralName: 'allocameluses passant',
  SVG: allocamelusPassantSVG,
  chargeType: 'regular',
  tags: ['monsters', 'passant', 'allocamelus'],
};
