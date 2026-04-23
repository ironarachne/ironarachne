import type { ChargeGlyph } from '../../charge-types.js';
import stagLodgedSVG from './stag-lodged.svg?raw';

export const stagLodged: ChargeGlyph = {
  name: 'stag lodged',
  pluralName: 'stags lodged',
  SVG: stagLodgedSVG,
  chargeType: 'regular',
  tags: ['animal', 'stag', 'strength'],
};
