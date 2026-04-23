import type { ChargeGlyph } from '../../charge-types.js';
import heronSVG from './heron.svg?raw';

export const heron: ChargeGlyph = {
  name: 'heron',
  pluralName: 'herons',
  SVG: heronSVG,
  chargeType: 'regular',
  tags: ['bird', 'heron', 'water'],
};
