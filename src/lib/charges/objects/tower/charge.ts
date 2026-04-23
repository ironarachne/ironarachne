import type { ChargeGlyph } from '../../charge-types.js';
import towerSVG from './tower.svg?raw';

export const tower: ChargeGlyph = {
  name: 'tower',
  pluralName: 'towers',
  SVG: towerSVG,
  chargeType: 'regular',
  tags: ['tower', 'objects'],
};
