import type { ChargeGlyph } from '../../charge-types.js';
import owlSVG from './owl.svg?raw';

export const owl: ChargeGlyph = {
  name: 'owl',
  pluralName: 'owls',
  SVG: owlSVG,
  chargeType: 'regular',
  tags: ['bird', 'owl', 'wisdom'],
};
