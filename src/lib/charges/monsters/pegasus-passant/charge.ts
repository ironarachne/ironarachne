import type { ChargeGlyph } from '../../charge-types.js';
import pegasusPassantSVG from './pegasus-passant.svg?raw';

export const pegasusPassant: ChargeGlyph = {
  name: 'pegasus passant',
  pluralName: 'pegasuses passant',
  SVG: pegasusPassantSVG,
  chargeType: 'regular',
  tags: ['monsters', 'passant', 'pegasus'],
};
