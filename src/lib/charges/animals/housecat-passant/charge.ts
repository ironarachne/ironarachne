import type { ChargeGlyph } from '../../charge-types.js';
import housecatPassantSVG from './housecat-passant.svg?raw';

export const housecatPassant: ChargeGlyph = {
  name: 'housecat passant',
  pluralName: 'housecats passant',
  SVG: housecatPassantSVG,
  chargeType: 'regular',
  tags: ['housecat', 'passant', 'animals'],
};
