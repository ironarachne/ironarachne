import type { ChargeGlyph } from '../../charge-types.js';
import narwhalSVG from './narwhal.svg?raw';

export const narwhal: ChargeGlyph = {
  name: 'narwhal',
  pluralName: 'narwhals',
  SVG: narwhalSVG,
  chargeType: 'regular',
  tags: ['narwhal', 'animals'],
};
