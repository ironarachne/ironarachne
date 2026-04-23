import type { ChargeGlyph } from '../../charge-types.js';
import salamanderSVG from './salamander.svg?raw';

export const salamander: ChargeGlyph = {
  name: 'salamander',
  pluralName: 'salamanders',
  SVG: salamanderSVG,
  chargeType: 'regular',
  tags: ['monsters', 'salamander'],
};
