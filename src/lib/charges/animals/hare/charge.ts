import type { ChargeGlyph } from '../../charge-types.js';
import hareSVG from './hare.svg?raw';

export const hare: ChargeGlyph = {
  name: 'hare',
  pluralName: 'hares',
  SVG: hareSVG,
  chargeType: 'regular',
  tags: ['animal', 'hare', 'fertility'],
};
