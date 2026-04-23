import type { ChargeGlyph } from '../../charge-types.js';
import cockatriceSVG from './cockatrice.svg?raw';

export const cockatrice: ChargeGlyph = {
  name: 'cockatrice',
  pluralName: 'cockatrices',
  SVG: cockatriceSVG,
  chargeType: 'regular',
  tags: ['monster', 'cockatrice', 'mythical'],
};
