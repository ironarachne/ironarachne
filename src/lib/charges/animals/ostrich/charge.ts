import type { ChargeGlyph } from '../../charge-types.js';
import ostrichSVG from './ostrich.svg?raw';

export const ostrich: ChargeGlyph = {
  name: 'ostrich',
  pluralName: 'ostriches',
  SVG: ostrichSVG,
  chargeType: 'regular',
  tags: ['ostrich', 'animals'],
};
