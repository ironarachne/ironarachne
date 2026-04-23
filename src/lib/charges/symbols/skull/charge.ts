import type { ChargeGlyph } from '../../charge-types.js';
import skullSVG from './skull.svg?raw';

export const skull: ChargeGlyph = {
  name: 'skull',
  pluralName: 'skulls',
  SVG: skullSVG,
  chargeType: 'regular',
  tags: ['skull', 'symbols'],
};
