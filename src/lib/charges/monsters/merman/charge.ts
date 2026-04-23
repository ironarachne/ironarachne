import type { ChargeGlyph } from '../../charge-types.js';
import mermanSVG from './merman.svg?raw';

export const merman: ChargeGlyph = {
  name: 'merman',
  pluralName: 'mermans',
  SVG: mermanSVG,
  chargeType: 'regular',
  tags: ['monsters', 'merman'],
};
