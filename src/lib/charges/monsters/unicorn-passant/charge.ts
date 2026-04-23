import type { ChargeGlyph } from '../../charge-types.js';
import unicornPassantSVG from './unicorn-passant.svg?raw';

export const unicornPassant: ChargeGlyph = {
  name: 'unicorn passant',
  pluralName: 'unicorns passant',
  SVG: unicornPassantSVG,
  chargeType: 'regular',
  tags: ['monsters', 'passant', 'unicorn'],
};
