import type { ChargeGlyph } from '../../charge-types.js';
import dragonPassantSVG from './dragon-passant.svg?raw';

export const dragonPassant: ChargeGlyph = {
  name: 'dragon passant',
  pluralName: 'dragons passant',
  SVG: dragonPassantSVG,
  chargeType: 'regular',
  tags: ['monsters', 'passant', 'dragon'],
};
