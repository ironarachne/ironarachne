import type { ChargeGlyph } from '../../charge-types.js';
import anchorSVG from './anchor.svg?raw';

export const anchor: ChargeGlyph = {
  name: 'anchor',
  pluralName: 'anchors',
  SVG: anchorSVG,
  chargeType: 'regular',
  tags: ['anchor', 'objects'],
};
