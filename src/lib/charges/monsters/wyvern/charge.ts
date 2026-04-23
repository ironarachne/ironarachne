import type { ChargeGlyph } from '../../charge-types.js';
import wyvernSVG from './wyvern.svg?raw';

export const wyvern: ChargeGlyph = {
  name: 'wyvern',
  pluralName: 'wyverns',
  SVG: wyvernSVG,
  chargeType: 'regular',
  tags: ['monster', 'wyvern'],
};
