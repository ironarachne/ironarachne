import type { ChargeGlyph } from '../../charge-types.js';
import harePassantSVG from './hare-passant.svg?raw';

export const harePassant: ChargeGlyph = {
  name: 'hare passant',
  pluralName: 'hares passant',
  SVG: harePassantSVG,
  chargeType: 'regular',
  tags: ['hare', 'passant', 'animals'],
};
