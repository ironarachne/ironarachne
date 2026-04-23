import type { ChargeGlyph } from '../../charge-types.js';
import axeSVG from './axe.svg?raw';

export const axe: ChargeGlyph = {
  name: 'axe',
  pluralName: 'axes',
  SVG: axeSVG,
  chargeType: 'regular',
  tags: ['axe', 'objects'],
};
