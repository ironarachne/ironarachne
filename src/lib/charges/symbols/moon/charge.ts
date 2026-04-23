import type { ChargeGlyph } from '../../charge-types.js';
import moonSVG from './moon.svg?raw';

export const moon: ChargeGlyph = {
  name: 'moon',
  pluralName: 'moons',
  SVG: moonSVG,
  chargeType: 'regular',
  tags: ['moon', 'symbols'],
};
