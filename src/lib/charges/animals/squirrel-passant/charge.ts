import type { ChargeGlyph } from '../../charge-types.js';
import squirrelPassantSVG from './squirrel-passant.svg?raw';

export const squirrelPassant: ChargeGlyph = {
  name: 'squirrel passant',
  pluralName: 'squirrels passant',
  SVG: squirrelPassantSVG,
  chargeType: 'regular',
  tags: ['passant', 'squirrel', 'animals'],
};
